require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
// Nén gzip tất cả response → tăng tốc trình duyệt
app.use(compression({
  level: 6,          // Mức nén tốt nhất cân bằng tốc độ/dung lượng
  threshold: 1024,   // Chỉ nén response > 1KB
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'https://learning-english-blue.vercel.app'
  ].filter(Boolean),
  credentials: true,
}));

// Parse JSON và URL-encoded body
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Giữ kết nối sống để tránh cold start lần sau
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// ===== Ensure upload folder exists =====
const uploadDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== Static files =====
app.use('/uploads', express.static('uploads', {
  maxAge: '7d', // Cache ảnh 7 ngày ở trình duyệt
}));

// ===== Database =====
const db = require('./config/db');

// ===== Routes =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/protected', require('./routes/protectedRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vocabularies', require('./routes/vocabularyRoutes'));
app.use('/api/users', require('./routes/userProfileRoutes'));

// ===== Health check (Render dùng để ping giữ server sống) =====
app.get('/', (req, res) => {
  res.json({ message: '🚀 API is running successfully', env: process.env.NODE_ENV });
});

// ===== DB Health check — kiểm tra kết nối database =====
app.get('/api/health', async (req, res) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  try {
    console.log('--- Health Check: Testing DB Connection ---');
    console.log('DATABASE_URL present:', hasDbUrl);
    
    const start = Date.now();
    await db.query('SELECT 1');
    const duration = Date.now() - start;

    res.json({
      status: 'ok',
      database: 'connected ✅',
      latency: `${duration}ms`,
      env: process.env.NODE_ENV,
      db_mode: hasDbUrl ? 'Filess.io (cloud)' : 'local fallback ⚠️',
    });
  } catch (err) {
    console.error('❌ Health Check DB Error:', err);
    
    // Phân tích lỗi để gợi ý user
    let hint = 'Check DATABASE_URL format and credentials.';
    if (err.code === 'ER_CON_COUNT_ERROR' || err.message.includes('too many connections')) {
      hint = 'QUÁ TẢI KẾT NỐI: Filess.io Free Tier chỉ cho phép 3 kết nối. Đảm bảo bạn đã tắt các tab Render Dashboard hoặc các bản chạy local cũ.';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      hint = 'LỖI KẾT NỐI: Filess.io không phản hồi. Kiểm tra whitelist IP (nếu có) hoặc xem server database có đang bảo trì không.';
    }

    res.status(500).json({
      status: 'error',
      database: 'disconnected ❌',
      message: 'Server database không phản hồi hoặc quá tải.',
      error_code: err.code,
      hint: hint
    });
  }
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ===== 404 handler =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== Start server =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗜️  Compression: enabled`);
  console.log(`🗃️  Database: ${process.env.DATABASE_URL ? 'Filess.io (cloud)' : 'local MySQL'}`);
});