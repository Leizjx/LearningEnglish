const mysql = require('mysql2');

// Lấy connection string từ biến môi trường
const connectionString = process.env.DATABASE_URL;
let pool;

if (connectionString) {
  console.log('📦 Database: Using connection string (Filess.io/Render)');
  
  // Đảm bảo có SSL và giới hạn kết nối cho Filess.io (Free tier giới hạn 3)
  let finalUri = connectionString;
  if (!finalUri.includes('ssl=')) {
    const separator = finalUri.includes('?') ? '&' : '?';
    finalUri += `${separator}ssl={"rejectUnauthorized":false}`;
  }
  
  // Ép giới hạn kết nối là 3 để tránh lỗi "Too many connections" trên Filess.io
  if (!finalUri.includes('connectionLimit=')) {
    const separator = finalUri.includes('?') ? '&' : '?';
    finalUri += `${separator}connectionLimit=3`;
  }

  pool = mysql.createPool(finalUri);
} else {
  console.log('🏠 Database: Using local configuration');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'english_app',
    waitForConnections: true,
    connectionLimit: 3, // Đồng bộ với cloud để test local chuẩn hơn
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

// Export promise-based pool
module.exports = pool.promise();
