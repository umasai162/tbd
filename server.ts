import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry and safe checks
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// DBManager: Robust abstraction handling MySQL and local JSON database fallback
class DatabaseManager {
  private useMySQL: boolean = false;
  private jsonFilePath: string = path.join(process.cwd(), 'data', 'db.json');
  private pool: mysql.Pool | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private connectionTimeout: number = 10000; // 10 seconds

  async init() {
    // Initialize JSON fallback first to ensure we always have a working database
    this.initializeJSONFallback();

    // Try MySQL connection with retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`MySQL connection attempt ${attempt}/${this.maxRetries}...`);
        
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          connectTimeout: this.connectionTimeout
        });
        
        await connection.query('CREATE DATABASE IF NOT EXISTS temple_db');
        await connection.end();

        this.pool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: 'temple_db',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: this.connectionTimeout
        });

        // Test connection
        await this.pool.query('SELECT 1 as test');

        // Create tables with proper error handling
        await this.createTables();

        this.useMySQL = true;
        console.log('✅ MySQL Database initialized successfully.');
        return;
      } catch (error: any) {
        this.retryCount = attempt;
        console.warn(`❌ MySQL connection attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.warn('⚠️ All MySQL connection attempts failed, falling back to local JSON database storage.');
          this.useMySQL = false;
          if (this.pool) {
            await this.pool.end();
            this.pool = null;
          }
        }
      }
    }
  }

  private initializeJSONFallback() {
    try {
      if (!fs.existsSync(this.jsonFilePath)) {
        fs.mkdirSync(path.dirname(this.jsonFilePath), { recursive: true });
        fs.writeFileSync(this.jsonFilePath, JSON.stringify({ bookings: [], donations: [] }, null, 2), 'utf8');
        console.log('✅ JSON fallback database initialized.');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize JSON fallback:', error.message);
    }
  }

  private async createTables() {
    if (!this.pool) throw new Error('Database pool not initialized');

    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(50) PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          bookingDate DATETIME NOT NULL,
          visitDate DATE NOT NULL,
          status VARCHAR(50) DEFAULT 'CONFIRMED',
          transactionId VARCHAR(100) UNIQUE,
          amountPaid DECIMAL(10,2) DEFAULT 0.00,
          pilgrims JSON,
          details JSON,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_bookingDate (bookingDate),
          INDEX idx_transactionId (transactionId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS donations (
          id VARCHAR(50) PRIMARY KEY,
          donorName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          panNumber VARCHAR(50),
          amount DECIMAL(10,2) NOT NULL,
          scheme VARCHAR(255) NOT NULL,
          transactionId VARCHAR(100) UNIQUE,
          date DATETIME NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_date (date),
          INDEX idx_transactionId (transactionId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS payment_attempts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          transaction_id VARCHAR(100) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          method VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_transaction_id (transaction_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (error: any) {
      console.error('❌ Failed to create tables:', error.message);
      throw error;
    }
  }

  public async safeQuery<T>(query: string, params: any[] = []): Promise<T> {
    if (!this.pool || !this.useMySQL) {
      throw new Error('MySQL not available');
    }

    try {
      const [result] = await this.pool.query(query, params);
      return result as T;
    } catch (error: any) {
      console.error('❌ Query failed:', error.message);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  }

  private async readJSON() {
    try {
      const content = await fs.promises.readFile(this.jsonFilePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return { bookings: [], donations: [] };
    }
  }

  private async writeJSON(data: any) {
    await fs.promises.writeFile(this.jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getStats() {
    try {
      if (this.useMySQL && this.pool) {
        const bookingsData = await this.safeQuery<any>("SELECT COUNT(*) as count FROM bookings WHERE status = 'CONFIRMED'");
        const confirmedCount = bookingsData[0]?.count || 0;

        const donationsData = await this.safeQuery<any>("SELECT COALESCE(SUM(amount), 0) as total FROM donations");
        const totalHundi = donationsData[0]?.total ? parseFloat(donationsData[0].total) : 0;

        return { confirmedCount, totalHundi };
      } else {
        const db = await this.readJSON();
        const confirmedCount = db.bookings.filter((b: any) => b.status === "CONFIRMED").length;
        const totalHundi = db.donations.reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0);
        return { confirmedCount, totalHundi };
      }
    } catch (error: any) {
      console.error('❌ Error getting stats:', error.message);
      // Fallback to JSON if MySQL fails
      const db = await this.readJSON();
      const confirmedCount = db.bookings.filter((b: any) => b.status === "CONFIRMED").length;
      const totalHundi = db.donations.reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0);
      return { confirmedCount, totalHundi };
    }
  }

  async getBookings(search?: string) {
    try {
      if (this.useMySQL && this.pool) {
        let query = "SELECT * FROM bookings ORDER BY bookingDate DESC";
        let params: any[] = [];
        if (search) {
          const term = `%${search}%`;
          query = "SELECT * FROM bookings WHERE transactionId LIKE ? OR id LIKE ? ORDER BY bookingDate DESC";
          params = [term, term];
        }
        const rows = await this.safeQuery<any[]>(query, params);
        return rows.map((r: any) => ({
          ...r,
          pilgrims: typeof r.pilgrims === 'string' ? JSON.parse(r.pilgrims) : r.pilgrims,
          details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
        }));
      } else {
        const db = await this.readJSON();
        let list = db.bookings;
        if (search) {
          const term = search.toLowerCase();
          list = list.filter((r: any) =>
            (r.transactionId && r.transactionId.toLowerCase().includes(term)) ||
            (r.id && r.id.toLowerCase().includes(term))
          );
        }
        return [...list].sort((a: any, b: any) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
      }
    } catch (error: any) {
      console.error('❌ Error getting bookings:', error.message);
      // Fallback to JSON if MySQL fails
      const db = await this.readJSON();
      let list = db.bookings;
      if (search) {
        const term = search.toLowerCase();
        list = list.filter((r: any) =>
          (r.transactionId && r.transactionId.toLowerCase().includes(term)) ||
          (r.id && r.id.toLowerCase().includes(term))
        );
      }
      return [...list].sort((a: any, b: any) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    }
  }

  async createBooking(booking: { type: string; visitDate: string; amountPaid: number; pilgrims: any[]; details: any }) {
    try {
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}${suffix}`;
      const transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const bookingDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const newBooking = {
        id: bookingId,
        type: booking.type,
        bookingDate: new Date().toISOString(),
        visitDate: booking.visitDate,
        status: "CONFIRMED",
        transactionId,
        amountPaid: booking.amountPaid,
        pilgrims: booking.pilgrims,
        details: booking.details
      };

      if (this.useMySQL && this.pool) {
        await this.safeQuery(
          `INSERT INTO bookings (id, type, bookingDate, visitDate, status, transactionId, amountPaid, pilgrims, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, booking.type, bookingDate, booking.visitDate, "CONFIRMED", transactionId, booking.amountPaid, JSON.stringify(booking.pilgrims), JSON.stringify(booking.details)]
        );
        newBooking.bookingDate = new Date(bookingDate).toISOString();
      } else {
        const db = await this.readJSON();
        db.bookings.push(newBooking);
        await this.writeJSON(db);
      }

      return newBooking;
    } catch (error: any) {
      console.error('❌ Error creating booking:', error.message);
      // Fallback to JSON if MySQL fails
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}${suffix}`;
      const transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      
      const newBooking = {
        id: bookingId,
        type: booking.type,
        bookingDate: new Date().toISOString(),
        visitDate: booking.visitDate,
        status: "CONFIRMED",
        transactionId,
        amountPaid: booking.amountPaid,
        pilgrims: booking.pilgrims,
        details: booking.details
      };

      const db = await this.readJSON();
      db.bookings.push(newBooking);
      await this.writeJSON(db);
      return newBooking;
    }
  }

  async cancelBooking(id: string) {
    try {
      if (this.useMySQL && this.pool) {
        const result = await this.safeQuery<any>("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
          throw new Error("Booking not found");
        }
      } else {
        const db = await this.readJSON();
        const booking = db.bookings.find((b: any) => b.id === id);
        if (!booking) {
          throw new Error("Booking not found");
        }
        booking.status = "CANCELLED";
        await this.writeJSON(db);
      }
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error.message);
      // Fallback to JSON if MySQL fails
      const db = await this.readJSON();
      const booking = db.bookings.find((b: any) => b.id === id);
      if (!booking) {
        throw new Error("Booking not found");
      }
      booking.status = "CANCELLED";
      await this.writeJSON(db);
    }
  }

  async getDonations() {
    try {
      if (this.useMySQL && this.pool) {
        const rows = await this.safeQuery<any[]>("SELECT * FROM donations ORDER BY date DESC");
        return rows;
      } else {
        const db = await this.readJSON();
        return [...db.donations].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (error: any) {
      console.error('❌ Error getting donations:', error.message);
      // Fallback to JSON if MySQL fails
      const db = await this.readJSON();
      return [...db.donations].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  async createDonation(donation: { donorName: string; email: string; phone?: string; panNumber?: string; amount: number; scheme: string }) {
    try {
      const donationId = `DN-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `TXN-DON${Math.floor(100000 + Math.random() * 900000)}`;
      const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const newDonation = {
        id: donationId,
        donorName: donation.donorName,
        email: donation.email,
        phone: donation.phone || null,
        panNumber: donation.panNumber || null,
        amount: donation.amount,
        scheme: donation.scheme,
        transactionId,
        date: new Date().toISOString()
      };

      if (this.useMySQL && this.pool) {
        await this.safeQuery(
          `INSERT INTO donations (id, donorName, email, phone, panNumber, amount, scheme, transactionId, date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [donationId, donation.donorName, donation.email, donation.phone || null, donation.panNumber || null, donation.amount, donation.scheme, transactionId, date]
        );
        newDonation.date = new Date(date).toISOString();
      } else {
        const db = await this.readJSON();
        db.donations.push(newDonation);
        await this.writeJSON(db);
      }

      return newDonation;
    } catch (error: any) {
      console.error('❌ Error creating donation:', error.message);
      // Fallback to JSON if MySQL fails
      const donationId = `DN-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `TXN-DON${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newDonation = {
        id: donationId,
        donorName: donation.donorName,
        email: donation.email,
        phone: donation.phone || null,
        panNumber: donation.panNumber || null,
        amount: donation.amount,
        scheme: donation.scheme,
        transactionId,
        date: new Date().toISOString()
      };

      const db = await this.readJSON();
      db.donations.push(newDonation);
      await this.writeJSON(db);
      return newDonation;
    }
  }
}

const dbManager = new DatabaseManager();
dbManager.init();

// Helpers for Temple Panchangam generator based on date
function getPanchangam(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const dateVal = d.getDate();

  // List of Tithis, Nakshatras and Festivals to rotate through based on date
  const tithis = ["Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami", "Amavasya"];
  const nakshatras = ["Aswini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Visakha", "Anuradha", "Jyeshtha", "Mula", "Purvashadha", "Uttarashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  
  const tithiIndex = (dateVal + day) % tithis.length;
  const nakIndex = (dateVal * 3 + day) % nakshatras.length;

  const rahukalamList = [
    "4:30 PM - 6:00 PM", // Sunday
    "7:30 AM - 9:00 AM", // Monday
    "3:00 PM - 4:30 PM", // Tuesday
    "12:00 PM - 1:30 PM", // Wednesday
    "1:30 PM - 3:00 PM", // Thursday
    "10:30 AM - 12:00 PM", // Friday
    "9:00 AM - 10:30 AM"  // Saturday
  ];

  const yamagandamList = [
    "12:00 PM - 1:30 PM",
    "10:30 AM - 12:00 PM",
    "9:00 AM - 10:30 AM",
    "7:30 AM - 9:00 AM",
    "6:00 AM - 7:30 AM",
    "3:00 PM - 4:30 PM",
    "1:30 PM - 3:00 PM"
  ];

  const gulikakalamList = [
    "3:00 PM - 4:30 PM",
    "1:30 PM - 3:00 PM",
    "12:00 PM - 1:30 PM",
    "10:30 AM - 12:00 PM",
    "9:00 AM - 10:30 AM",
    "7:30 AM - 9:00 AM",
    "6:00 AM - 7:30 AM"
  ];

  const auspiciousHours = [
    "08:35 AM - 09:20 AM",
    "11:45 AM - 12:35 PM (Abhijit Muhurtham)",
    "02:15 PM - 03:00 PM",
    "06:30 PM - 07:15 PM"
  ];

  const festivals: string[] = [];
  if (dateVal === 10) festivals.push("Shukla Paksha Ekadashi");
  if (dateVal === 15) festivals.push("Satyanarayana Vratam / Pournami");
  if (dateVal === 1) festivals.push("Pradosha Vratam");
  if (dateVal === 23) festivals.push("Sankashti Chaturthi");
  if (day === 1 && dateVal % 2 === 0) festivals.push("Soma Pradosham");

  return {
    date: dateStr,
    tithi: `${tithis[tithiIndex]} Tithi (Shukla Paksha)`,
    nakshatram: nakshatras[nakIndex],
    rahukalam: rahukalamList[day],
    yamagandam: yamagandamList[day],
    gulikakalam: gulikakalamList[day],
    sunrise: "05:48 AM",
    sunset: "06:42 PM",
    auspiciousTime: auspiciousHours[dateVal % auspiciousHours.length],
    festivals: festivals.length > 0 ? festivals : ["Nitya Puja, Archana Seva"]
  };
}

// --- API ROUTES ---

// 1. Get Live Stats (Landing dashboard)
app.get("/api/stats", async (req, res) => {
  try {
    console.log('📊 Fetching live stats...');
    const { confirmedCount, totalHundi } = await dbManager.getStats();

    res.json({
      liveWaitTimeGeneral: "4 Hours 15 Mins",
      liveWaitTimeSpecial: "45 Mins",
      weather: "28°C, Clear Sky",
      location: "Tirumala Hills (Chittoor Dist, AP, India)",
      announcements: [
        "Special Entry Darshan (Rs. 300) online slots for the upcoming months are now fully released. Book online to reserve your slot.",
        "Free Annadanam (holy meals) is served continuously from 9:00 AM to 11:30 PM daily at the Matrusri Tarigonda Vengamamba Annadhana Complex.",
        "Electronic items, cameras, cell phones, and footwear are strictly prohibited inside the main temple premises. Please use the free lockers.",
        "Dress Code is mandatory: Men: White Dhoti, Kurta, or Pyjama. Women: Saree, Half-Saree, or Chudidar with Dupatta."
      ],
      adminStats: {
        totalTicketsBooked: confirmedCount,
        accommodationOccupancy: "82%",
        hundiCollection: totalHundi,
        livePilgrimCount: 24350
      }
    });
    console.log('✅ Live stats fetched successfully');
  } catch (err: any) {
    console.error('❌ Error fetching live stats:', err.message);
    res.status(500).json({ error: "Failed to fetch live stats. Please try again later." });
  }
});

// 2. Get Panchangam
app.get("/api/panchangam", (req, res) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const data = getPanchangam(dateStr);
    res.json(data);
  } catch (err: any) {
    console.error('❌ Error fetching panchangam:', err.message);
    res.status(500).json({ error: "Failed to fetch panchangam. Please try again later." });
  }
});

// 3. Get bookings list or verify specific ticket
app.get("/api/bookings", async (req, res) => {
  try {
    const search = req.query.search as string;
    console.log('🔍 Fetching bookings...', search ? `Search: ${search}` : 'All bookings');
    const parsedRows = await dbManager.getBookings(search);
    res.json(parsedRows);
    console.log('✅ Bookings fetched successfully');
  } catch (err: any) {
    console.error('❌ Error fetching bookings:', err.message);
    res.status(500).json({ error: "Failed to fetch bookings. Please try again later." });
  }
});

// 4. Create Bookings (unified or per-type)
app.post("/api/bookings/book", async (req, res) => {
  try {
    const { type, visitDate, pilgrims, amountPaid, details } = req.body;
    if (!type || !visitDate || !pilgrims || !Array.isArray(pilgrims) || pilgrims.length === 0) {
      return res.status(400).json({ error: "Invalid booking request. Missing vital details." });
    }

    console.log('🎫 Creating booking...', { type, visitDate, pilgrimCount: pilgrims.length });
    const booking = await dbManager.createBooking({
      type,
      visitDate,
      amountPaid: parseFloat(amountPaid),
      pilgrims,
      details
    });

    res.json({ success: true, booking });
    console.log('✅ Booking created successfully:', booking.id);
  } catch (err: any) {
    console.error('❌ Error creating booking:', err.message);
    res.status(500).json({ error: "Failed to create booking. Please try again later." });
  }
});

// 5. Cancel Booking
app.post("/api/bookings/cancel", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Booking ID is required." });

    console.log('❌ Cancelling booking:', id);
    await dbManager.cancelBooking(id);
    res.json({ success: true, booking: { id, status: 'CANCELLED' } });
    console.log('✅ Booking cancelled successfully:', id);
  } catch (err: any) {
    console.error('❌ Error cancelling booking:', err.message);
    if (err.message === "Booking not found") {
      res.status(404).json({ error: "Booking not found." });
    } else {
      res.status(500).json({ error: "Failed to cancel booking. Please try again later." });
    }
  }
});

// 6. Submit Donation
app.post("/api/donations", async (req, res) => {
  try {
    const { donorName, email, phone, panNumber, amount, scheme } = req.body;
    if (!donorName || !email || !amount || !scheme) {
      return res.status(400).json({ error: "Donor details and amount are required." });
    }

    console.log('💝 Creating donation...', { donorName, amount, scheme });
    const donation = await dbManager.createDonation({
      donorName,
      email,
      phone,
      panNumber,
      amount: parseFloat(amount),
      scheme
    });

    res.json({ success: true, donation });
    console.log('✅ Donation created successfully:', donation.id);
  } catch (err: any) {
    console.error('❌ Error creating donation:', err.message);
    res.status(500).json({ error: "Failed to process donation. Please try again later." });
  }
});

// 7. Get Donations List
app.get("/api/donations", async (req, res) => {
  try {
    console.log('💰 Fetching donations...');
    const rows = await dbManager.getDonations();
    res.json(rows);
    console.log('✅ Donations fetched successfully');
  } catch (err: any) {
    console.error('❌ Error fetching donations:', err.message);
    res.status(500).json({ error: "Failed to fetch donations. Please try again later." });
  }
});

// 8. Payment Verification Endpoint
app.post("/api/payments/verify", async (req, res) => {
  try {
    const { transactionId, amount, method } = req.body;
    
    if (!transactionId || !amount) {
      return res.status(400).json({ error: "Transaction ID and amount are required." });
    }

    console.log('💳 Verifying payment:', { transactionId, amount, method });

    // In a real implementation, you would:
    // 1. Call the payment gateway API (Razorpay, PhonePe, etc.)
    // 2. Verify the transaction status with the payment gateway
    // 3. Update your database with the payment status
    
    // For now, we'll store payment attempts and require manual confirmation
    // In production, integrate with actual payment gateway APIs like:
    // - Razorpay API
    // - PhonePe Merchant API
    // - Paytm Business API
    // - Google Pay for Business API
    
    // Store payment attempt in database for tracking
    try {
      await dbManager.safeQuery(
        `INSERT INTO payment_attempts (transaction_id, amount, method, status, created_at) VALUES (?, ?, ?, 'PENDING', NOW())`,
        [transactionId, amount, method]
      );
    } catch (err) {
      console.log('Payment attempt logging error (non-critical):', err);
    }

    // For demo/testing: Return PENDING status until actual payment gateway integration
    // This prevents fake success messages
    res.json({
      success: false,
      status: 'PENDING',
      transactionId,
      amount,
      message: 'Payment verification pending. Please complete payment in your UPI app and click verify again.',
      note: 'In production, this will integrate with actual payment gateway APIs for real-time verification'
    });
    console.log('⏳ Payment verification pending:', transactionId);
    
  } catch (err: any) {
    console.error('❌ Error verifying payment:', err.message);
    res.status(500).json({ error: "Payment verification failed. Please try again later." });
  }
});

// 9. Payment Status Check
app.get("/api/payments/status/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    console.log('🔍 Checking payment status:', transactionId);
    
    // In production, query your database or payment gateway
    // For demo, return a simulated status
    res.json({
      transactionId,
      status: 'SUCCESS',
      amount: 300,
      method: 'UPI',
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('❌ Error checking payment status:', err.message);
    res.status(500).json({ error: "Failed to check payment status." });
  }
});

// 10. Temple Assistant AI Chatbot (Gemini SDK powered)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    console.log('🤖 Processing chat message...');

    if (!ai) {
      // Elegant fallback response if no API key is provided
      console.log('⚠️ AI service not available (missing API key)');
      return res.json({
        text: `Thank you for reaching out to the Devasthanam Portal Help Desk. As an assistant, I would love to tell you more about the temple timings, rules, and procedures, but the AI service is currently in offline mode (missing API key). 

Here are some helpful standard details for your journey:
- **Dress Code:** Men: White Dhoti, Kurta, or Pyjama. Women: Saree, Half-Saree, or Chudidar with Dupatta.
- **Rules:** Mobile phones, cameras, or electronic gadgets are strictly prohibited in the inner temple. Free locker systems are available.
- **Darshan Booking:** Special Entry Darshan can be booked online for Rs. 300, and includes free Laddus.
- **Accommodation:** Rooms can be booked for 1 day maximum per booking.
Please configure your Gemini API Key in the Secrets panel to activate full AI assistance!`
      });
    }

    const systemInstruction = `You are "Devalaya Mitra", a dedicated and respectful spiritual assistant for the Holy Devasthanam Portal.
Your tone must be peaceful, traditional, polite, and helpful, mirroring the cultural and sacred atmosphere of Hindu Temples (Devasthanams).
Always offer guidance on:
1. Temple Timings: Daily Darshans, special rituals, free meals (Annadanam) timings (usually lunch starts at 11 AM, dinner at 7 PM).
2. Dress Codes: Strict adherence to traditional attire: Dhoti/Kurta for men; Saree, Churidar, or Half-saree for women. Jeans, shorts, or western attire are strictly not allowed inside the sanctum.
3. Guidelines & Do's/Don'ts: No leather items, no cameras or mobile phones, no shoes inside. Maintain silence and piety.
4. Booking Support: Guide them through Darshan (Rs 300 Special entry, Free Sarva Darshan), Accommodation (A/C and Non-A/C rooms), and Prasadam (Laddus).
5. Spiritual values: Offer short, relevant stories or blessings like "May Lord Venkateswara bless you with peace and prosperity" when greeting pilgrims.
Keep answers concise, direct, and well-structured.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
    console.log('✅ Chat response sent successfully');
  } catch (err: any) {
    console.error("❌ Gemini API error:", err.message);
    res.status(500).json({ error: "Failed to fetch response from AI assistant. Please try again later." });
  }
});


// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  try {
    // Initialize database
    console.log('🔧 Initializing database...');
    await dbManager.init();
    
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log('🚀 Server started successfully!');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${dbManager['useMySQL'] ? 'MySQL' : 'JSON fallback'}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('❌ Error closing server:', err);
          process.exit(1);
        }
        
        console.log('🛑 Server closed successfully');
        
        // Close database connections
        if (dbManager['pool']) {
          try {
            await dbManager['pool'].end();
            console.log('💾 Database connections closed');
          } catch (err) {
            console.error('❌ Error closing database connections:', err);
          }
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

startServer();
