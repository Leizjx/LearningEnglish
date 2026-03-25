const mysql = require('mysql2');

// Determine database connection configuration
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
let pool;

if (connectionString) {
  // Use connection string if provided (e.g., from Railway or Render)
  // Keep connectionLimit low for free-tier DB hosts (e.g., Filess.io allows max 5)
  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
  });
} else {
  // Fall back to individual environment variables
  pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'english_app',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
    queueLimit: 0,
  });
}

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error details:', err);
  } else {
    console.log('✅ MySQL database connected successfully');
    connection.release();
  }
});

// Export promise-based pool for async/await support
module.exports = pool.promise();
