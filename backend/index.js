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
  origin: process.env.FRONTEND_URL || '*',
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
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗜️  Compression: enabled`);
  console.log(`🗃️  Database: ${process.env.DATABASE_URL ? 'Filess.io (cloud)' : 'local MySQL'}`);
});