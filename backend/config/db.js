const mysql = require('mysql2');

// Ưu tiên dùng DATABASE_URL (Filess.io/Render) nếu có
const connectionString = process.env.DATABASE_URL;
let pool;

if (connectionString) {
  // Dùng connection string (Filess.io trên Render)
  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 3,   // Filess.io free tier: tối đa ~5 connections
    queueLimit: 10,
    ssl: { rejectUnauthorized: false }, // Cần cho kết nối qua internet
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
} else {
  // Fallback: dùng biến riêng lẻ (local development)
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'english_app',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 3,
    queueLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

// Export promise-based pool cho async/await
module.exports = pool.promise();
