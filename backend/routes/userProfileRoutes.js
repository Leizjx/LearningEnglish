const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

// Đảm bảo thư mục upload tồn tại khi khởi chạy server
const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/** * Cấu hình lưu trữ Multer 
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file: profile-ID_USER-TIMESTAMP.jpg để dễ quản lý
    const userId = req.user?.id || 'guest'; 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
    cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

/** * Bộ lọc file và giới hạn 
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB để thân thiện hơn với ảnh di động
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isMimeValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isMimeValid && isExtValid) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ định dạng ảnh (jpg, png, webp)!'));
  }
});

// --- Routes ---

// Lấy thông tin cá nhân
router.get('/profile', verifyToken, getProfile);

// Cập nhật thông tin (bao gồm upload ảnh)
// Sử dụng một middleware bọc multer để bắt lỗi file quá lớn hoặc sai định dạng
router.put('/profile', verifyToken, (req, res, next) => {
  upload.single('profile_image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Lỗi upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, updateProfile);

module.exports = router;