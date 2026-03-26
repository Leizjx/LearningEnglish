const mysql = require('mysql2');

// Lấy connection string từ biến môi trường
const connectionString = process.env.DATABASE_URL;
let pool;

if (connectionString) {
  console.log('📦 Database: Using connection string (Filess.io/Render)');
  
  // mysql2 hỗ trợ truyền trực tiếp connection string làm đối số đầu tiên
  // Để thêm các option khác (connectionLimit), ta có thể dán thêm vào query params của string 
  // HOẶC dùng object config. Ở đây ta dùng string để đảm bảo format chuẩn nhất.
  
  // Đảm bảo có SSL nếu là kết nối cloud (Filess.io)
  let finalUri = connectionString;
  if (!finalUri.includes('ssl=')) {
    const separator = finalUri.includes('?') ? '&' : '?';
    finalUri += `${separator}ssl={"rejectUnauthorized":false}`;
  }

  pool = mysql.createPool(finalUri);
  
  // Cấu hình pool sau khi khởi tạo (nếu dùng pool.pool)
  // Thực tế mysql.createPool(string) sẽ tự parse các params như connectionLimit từ URI
} else {
  console.log('🏠 Database: Using local configuration');
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

// Export promise-based pool
module.exports = pool.promise();
