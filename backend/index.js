require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// ===== Ensure upload folder exists =====
const uploadDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== Static files =====
app.use('/uploads', express.static('uploads'));

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

// ===== Health check =====
app.get('/', (req, res) => {
  res.json({ message: '🚀 API is running successfully' });
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
});