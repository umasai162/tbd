const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace imports to add mysql2
code = code.replace('import dotenv from "dotenv";', 'import dotenv from "dotenv";\nimport mysql from "mysql2/promise";');

// Replace DB setup and DB file logic with MySQL
const dbSetupStart = code.indexOf('// Data Directory and DB setup');
const dbSetupEnd = code.indexOf('// Helpers for Temple Panchangam generator based on date');

const mysqlSetup = `// MySQL Setup
let pool: mysql.Pool;

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS temple_db');
    await connection.end();

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'temple_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query(\`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50),
        bookingDate DATETIME,
        visitDate DATE,
        status VARCHAR(50),
        transactionId VARCHAR(100),
        amountPaid DECIMAL(10,2),
        pilgrims JSON,
        details JSON
      )
    \`);

    await pool.query(\`
      CREATE TABLE IF NOT EXISTS donations (
        id VARCHAR(50) PRIMARY KEY,
        donorName VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        panNumber VARCHAR(50),
        amount DECIMAL(10,2),
        scheme VARCHAR(255),
        transactionId VARCHAR(100),
        date DATETIME
      )
    \`);

    console.log('MySQL Database initialized successfully.');
  } catch (error: any) {
    console.error('Failed to connect to MySQL database. Make sure MySQL is running:', error.message);
  }
}
initDB();

`;

code = code.slice(0, dbSetupStart) + mysqlSetup + code.slice(dbSetupEnd);

// Replace /api/stats
code = code.replace(/app\.get\("\/api\/stats", \(req, res\) => \{[\s\S]*?\}\);/, `app.get("/api/stats", async (req, res) => {
  try {
    const [bookingsData]: any = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'CONFIRMED'");
    const confirmedCount = bookingsData[0]?.count || 0;

    const [donationsData]: any = await pool.query("SELECT SUM(amount) as total FROM donations");
    const totalHundi = donationsData[0]?.total || 0;

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
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

// Replace /api/bookings GET
code = code.replace(/app\.get\("\/api\/bookings", \(req, res\) => \{[\s\S]*?\}\);/, `app.get("/api/bookings", async (req, res) => {
  const search = req.query.search as string;
  try {
    let query = "SELECT * FROM bookings ORDER BY bookingDate DESC";
    let params: any[] = [];
    if (search) {
      const term = \`%\${search}%\`;
      query = "SELECT * FROM bookings WHERE transactionId LIKE ? OR id LIKE ? ORDER BY bookingDate DESC";
      params = [term, term];
    }
    const [rows]: any = await pool.query(query, params);
    const parsedRows = rows.map((r: any) => ({
      ...r,
      pilgrims: typeof r.pilgrims === 'string' ? JSON.parse(r.pilgrims) : r.pilgrims,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
    }));
    res.json(parsedRows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

// Replace /api/bookings/book
code = code.replace(/app\.post\("\/api\/bookings\/book", \(req, res\) => \{[\s\S]*?\}\);/, `app.post("/api/bookings/book", async (req, res) => {
  const { type, visitDate, pilgrims, amountPaid, details } = req.body;
  if (!type || !visitDate || !pilgrims || !Array.isArray(pilgrims) || pilgrims.length === 0) {
    return res.status(400).json({ error: "Invalid booking request. Missing vital details." });
  }

  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingId = \`BK-\${Math.floor(1000 + Math.random() * 9000)}\${suffix}\`;
  const transactionId = \`TXN-\${Math.floor(100000000 + Math.random() * 900000000)}\`;
  const bookingDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    await pool.query(
      \`INSERT INTO bookings (id, type, bookingDate, visitDate, status, transactionId, amountPaid, pilgrims, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [bookingId, type, bookingDate, visitDate, "CONFIRMED", transactionId, amountPaid, JSON.stringify(pilgrims), JSON.stringify(details)]
    );

    res.json({ success: true, booking: { id: bookingId, type, bookingDate, visitDate, status: "CONFIRMED", transactionId, amountPaid, pilgrims, details } });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

// Replace /api/bookings/cancel
code = code.replace(/app\.post\("\/api\/bookings\/cancel", \(req, res\) => \{[\s\S]*?\}\);/, `app.post("/api/bookings/cancel", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Booking ID is required." });

  try {
    const [result]: any = await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }
    res.json({ success: true, booking: { id, status: 'CANCELLED' } });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

// Replace /api/donations (POST)
code = code.replace(/app\.post\("\/api\/donations", \(req, res\) => \{[\s\S]*?\}\);/, `app.post("/api/donations", async (req, res) => {
  const { donorName, email, phone, panNumber, amount, scheme } = req.body;
  if (!donorName || !email || !amount || !scheme) {
    return res.status(400).json({ error: "Donor details and amount are required." });
  }
  
  const donationId = \`DN-\${Math.floor(1000 + Math.random() * 9000)}\`;
  const transactionId = \`TXN-DON\${Math.floor(100000 + Math.random() * 900000)}\`;
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    await pool.query(
      \`INSERT INTO donations (id, donorName, email, phone, panNumber, amount, scheme, transactionId, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [donationId, donorName, email, phone, panNumber || null, parseFloat(amount), scheme, transactionId, date]
    );

    res.json({ success: true, donation: { id: donationId, donorName, email, phone, panNumber, amount: parseFloat(amount), scheme, transactionId, date } });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

// Replace /api/donations (GET)
code = code.replace(/app\.get\("\/api\/donations", \(req, res\) => \{[\s\S]*?\}\);/, `app.get("/api/donations", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM donations ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});`);

fs.writeFileSync('server.ts', code);
console.log('Successfully updated server.ts for MySQL');
