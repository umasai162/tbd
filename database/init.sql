-- Sri Venkateswara Holy Devasthanams - Database Initialization Script
-- This script creates the database and tables for the temple portal system

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS temple_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE temple_db;

-- Drop tables if they exist (for clean re-initialization)
-- Uncomment these lines if you want to reset the database
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS donations;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL COMMENT 'Type of booking: DARSHAN, SEVA, PRASADAM',
  bookingDate DATETIME NOT NULL COMMENT 'When the booking was made',
  visitDate DATE NOT NULL COMMENT 'Date of visit to temple',
  status VARCHAR(50) DEFAULT 'CONFIRMED' COMMENT 'CONFIRMED, CANCELLED',
  transactionId VARCHAR(100) UNIQUE COMMENT 'Unique transaction ID',
  amountPaid DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Amount paid for booking',
  pilgrims JSON COMMENT 'Array of pilgrim details',
  details JSON COMMENT 'Additional booking details',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
  INDEX idx_status (status),
  INDEX idx_bookingDate (bookingDate),
  INDEX idx_visitDate (visitDate),
  INDEX idx_transactionId (transactionId),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Temple booking records';

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(50) PRIMARY KEY,
  donorName VARCHAR(255) NOT NULL COMMENT 'Name of the donor',
  email VARCHAR(255) NOT NULL COMMENT 'Email address of donor',
  phone VARCHAR(50) COMMENT 'Phone number of donor',
  panNumber VARCHAR(50) COMMENT 'PAN number for tax exemption',
  amount DECIMAL(10,2) NOT NULL COMMENT 'Donation amount',
  scheme VARCHAR(255) NOT NULL COMMENT 'Donation scheme/cause',
  transactionId VARCHAR(100) UNIQUE COMMENT 'Unique transaction ID',
  date DATETIME NOT NULL COMMENT 'Date of donation',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
  INDEX idx_email (email),
  INDEX idx_date (date),
  INDEX idx_transactionId (transactionId),
  INDEX idx_scheme (scheme)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Temple donation records';

-- Create payment_attempts table for tracking UPI payment attempts
CREATE TABLE IF NOT EXISTS payment_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(100) NOT NULL COMMENT 'Transaction ID from payment gateway',
  amount DECIMAL(10,2) NOT NULL COMMENT 'Payment amount',
  method VARCHAR(50) NOT NULL COMMENT 'Payment method (UPI, CARD, etc.)',
  status VARCHAR(50) DEFAULT 'PENDING' COMMENT 'Payment status (PENDING, SUCCESS, FAILED)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment attempt tracking';

-- Insert sample data for testing (optional)
-- Uncomment to add sample records

-- INSERT INTO bookings (id, type, bookingDate, visitDate, status, transactionId, amountPaid, pilgrims, details) VALUES
-- ('BK-1234ABC', 'DARSHAN', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'CONFIRMED', 'TXN-123456789', 300.00, 
--  '[{"name":"Ramesh Kumar","age":35,"gender":"Male","idNumber":"ABC123456"}]', 
--  '{"specialEntry":true,"laddus":2}');

-- INSERT INTO donations (id, donorName, email, phone, panNumber, amount, scheme, transactionId, date) VALUES
-- ('DN-5678', 'Sita Devi', 'sita@example.com', '9876543210', 'ABCDE1234F', 1000.00, 'Annadanam', 'TXN-DON98765', NOW());

-- Display database information
SELECT 'Database initialized successfully!' AS message;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'temple_db';
