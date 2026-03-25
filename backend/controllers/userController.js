const userService = require('../services/userService');
const fs = require('fs').promises; // Sử dụng bản promises để dùng async/await
const path = require('path');

/**
 * Lấy thông tin cá nhân
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id; // Lấy từ verifyToken middleware
    const profile = await userService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('[UserController] getProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin' });
  }
}

/**
 * Cập nhật thông tin cá nhân (Hỗ trợ xóa ảnh cũ)
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    
    // 1. Lấy thông tin hiện tại để kiểm tra ảnh cũ
    const currentUser = await userService.getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // 2. Chuẩn bị dữ liệu cập nhật
    const profileData = {
      name: req.body.name !== undefined ? req.body.name : currentUser.name,
      phone: req.body.phone !== undefined ? req.body.phone : currentUser.phone,
      address: req.body.address !== undefined ? req.body.address : currentUser.address,
      bio: req.body.bio !== undefined ? req.body.bio : currentUser.bio,
    };

    // 3. Xử lý ảnh đại diện mới
    if (req.file) {
      profileData.profile_image = `/uploads/profiles/${req.file.filename}`;

      // LOGIC XÓA ẢNH CŨ: Nếu user đã có ảnh và không phải ảnh mặc định
      if (currentUser.profile_image && currentUser.profile_image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', currentUser.profile_image);
        try {
          await fs.unlink(oldPath); // Xóa file vật lý trên server
          console.log('Đã xóa ảnh cũ:', oldPath);
        } catch (err) {
          console.warn('Không thể xóa ảnh cũ (có thể file không tồn tại):', err.message);
        }
      }
    }

    // 4. Gọi service cập nhật
    await userService.updateUserProfile(userId, profileData);

    // 5. Lấy lại profile mới nhất để trả về cho Frontend cập nhật UI ngay lập tức
    const updatedProfile = await userService.getUserProfile(userId);

    return res.json({ 
      success: true, 
      message: 'Cập nhật thông tin thành công', 
      data: updatedProfile 
    });
  } catch (error) {
    console.error('[UserController] updateProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật' });
  }
}

module.exports = {
  getProfile,
  updateProfile
};