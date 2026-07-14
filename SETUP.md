# Sri Venkateswara Holy Devasthanams - Setup Guide

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher) - Optional (falls back to JSON storage)
- **npm** or **yarn** package manager
- **Git** (for version control)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Gemini AI API Key (Optional - for AI chatbot)
GEMINI_API_KEY="your_gemini_api_key_here"

# App URL (Auto-injected in production)
APP_URL="http://localhost:3000"

# MySQL Database Configuration (Optional)
# If MySQL is not configured, the app will use local JSON storage
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="your_mysql_password"
DB_NAME="temple_db"
DB_PORT="3306"
```

### 3. MySQL Setup (Optional but Recommended)

#### Option A: Automatic Setup (Recommended)

The application will automatically create the database and tables on first startup if MySQL credentials are provided.

#### Option B: Manual Setup

If you prefer to set up MySQL manually:

1. **Create Database:**
```sql
CREATE DATABASE temple_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Run Initialization Script:**
```bash
mysql -u root -p temple_db < database/init.sql
```

Or run the script from MySQL command line:
```sql
source database/init.sql;
```

### 4. Run the Application

#### Development Mode:
```bash
npm run dev
```

#### Production Mode:
```bash
npm run build
npm start
```

The application will start on `http://localhost:3000`

## 🗄️ Database Architecture

### Tables Created Automatically:

#### **bookings** table:
- `id` - Unique booking identifier
- `type` - Booking type (DARSHAN, SEVA, PRASADAM)
- `bookingDate` - When booking was made
- `visitDate` - Date of temple visit
- `status` - CONFIRMED/CANCELLED
- `transactionId` - Unique transaction reference
- `amountPaid` - Amount paid
- `pilgrims` - JSON array of pilgrim details
- `details` - Additional booking information
- `createdAt` / `updatedAt` - Timestamps

#### **donations** table:
- `id` - Unique donation identifier
- `donorName` - Donor's name
- `email` - Donor's email
- `phone` - Contact number
- `panNumber` - PAN for tax exemption
- `amount` - Donation amount
- `scheme` - Donation cause/scheme
- `transactionId` - Unique transaction reference
- `date` - Donation date
- `createdAt` / `updatedAt` - Timestamps

## 🔧 Configuration Options

### Without MySQL (JSON Fallback)

If MySQL is not configured, the application automatically falls back to local JSON storage:
- Data is stored in `data/db.json`
- No database setup required
- Suitable for development and testing
- **Note:** Data will be lost if the JSON file is deleted

### With MySQL (Production Recommended)

For production use, MySQL is recommended:
- Persistent data storage
- Better performance for large datasets
- Transaction support
- Data integrity guarantees

## 🛡️ Error Handling & Crash Prevention

The application includes comprehensive error handling:

### Database Connection:
- **Automatic retry logic** - 3 retry attempts with 2-second delays
- **Graceful fallback** - Switches to JSON if MySQL fails
- **Connection pooling** - Efficient connection management
- **Timeout handling** - 10-second connection timeout

### API Endpoints:
- **Try-catch blocks** - All routes wrapped in error handlers
- **Detailed logging** - Console logs with emojis for easy debugging
- **User-friendly errors** - Clear error messages for API consumers
- **Fallback mechanisms** - JSON fallback if MySQL queries fail

### Server Stability:
- **Graceful shutdown** - Handles SIGTERM/SIGINT signals
- **Uncaught exception handling** - Catches and logs unexpected errors
- **Unhandled rejection handling** - Catches promise rejections
- **Force shutdown timeout** - 10-second timeout for graceful shutdown

## 📊 Application Features

### Core Functionality:
- **Darshan Booking** - Special entry and general darshan reservations
- **Seva Booking** - Temple ritual and ceremony bookings
- **Donation Management** - Online donations with multiple schemes
- **Prasadam Orders** - Laddu and prasadam delivery
- **Ticket Verification** - QR code-based ticket checking
- **Panchangam Calendar** - Hindu calendar and auspicious timings
- **AI Chatbot** - Gemini-powered temple assistant

### Background Music:
- **Devotional tracks** - Multiple instrumental tracks
- **Cross-platform** - Works on mobile and desktop
- **User controls** - Play/pause, volume, track selection
- **Auto-play** - Starts on first user interaction

## 🔍 Troubleshooting

### MySQL Connection Issues:

**Problem:** "MySQL connection failed"
- **Solution:** Check MySQL is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)
- **Solution:** Verify credentials in `.env` file
- **Solution:** Ensure MySQL user has proper permissions
- **Solution:** Check firewall settings if MySQL is on remote server

**Problem:** "Database not found"
- **Solution:** The app auto-creates the database, but ensure your MySQL user has CREATE DATABASE privileges
- **Solution:** Or manually create: `CREATE DATABASE temple_db;`

### Application Won't Start:

**Problem:** "Port 3000 already in use"
- **Solution:** Change PORT in `server.ts` or kill the process using port 3000

**Problem:** "Module not found"
- **Solution:** Run `npm install` to install dependencies

### PowerShell Script Execution Error (Windows):

**Problem:** "running scripts is disabled on this system"
- **Solution:** Run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **Solution:** Or use Node.js directly: `node node_modules/tsx/dist/cli.mjs server.ts`

## 🚢 Deployment

### Production Build:

```bash
npm run build
npm start
```

### Environment Variables for Production:

Set these in your hosting environment:
- `NODE_ENV=production`
- `GEMINI_API_KEY` (if using AI features)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (for MySQL)

### Recommended Hosting:
- **Vercel/Netlify** - For frontend (with serverless functions)
- **Railway/Render** - For full-stack with MySQL
- **AWS/Azure/GCP** - For enterprise deployment

## 📝 API Endpoints

### Public Endpoints:
- `GET /api/stats` - Live statistics and announcements
- `GET /api/panchangam` - Hindu calendar data
- `GET /api/bookings` - List/search bookings
- `POST /api/bookings/book` - Create new booking
- `POST /api/bookings/cancel` - Cancel booking
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation
- `POST /api/chat` - AI chatbot assistance

## 🔒 Security Considerations

1. **Environment Variables:** Never commit `.env` file to version control
2. **Database Credentials:** Use strong passwords for MySQL
3. **API Keys:** Keep Gemini API key secure
4. **Input Validation:** All inputs are validated on the server
5. **SQL Injection:** Parameterized queries prevent SQL injection
6. **CORS:** Configure CORS for production domains

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Review the troubleshooting section above
- Ensure all prerequisites are installed
- Verify MySQL connection if using database

## 🎉 Success Indicators

When the application starts successfully, you should see:

```
🔧 Initializing database...
✅ JSON fallback database initialized.
MySQL connection attempt 1/3...
⚠️ All MySQL connection attempts failed, falling back to local JSON database storage.
🚀 Server started successfully!
📡 Server running on http://localhost:3000
🌐 Environment: development
💾 Database: JSON fallback
```

Or with MySQL:

```
🔧 Initializing database...
MySQL connection attempt 1/3...
✅ MySQL Database initialized successfully.
🚀 Server started successfully!
📡 Server running on http://localhost:3000
🌐 Environment: development
💾 Database: MySQL
```

---

**Note:** The application is designed to work seamlessly with or without MySQL. If MySQL is not available, it automatically uses JSON storage, ensuring the application never crashes due to database issues.
