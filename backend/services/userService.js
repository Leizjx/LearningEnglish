const db = require('../config/db');

/**
 * Lấy thông tin chi tiết người dùng
 * @param {number|string} userId 
 */
async function getUserProfile(userId) {
  try {
    // Sử dụng mảng rows trực tiếp từ destructuring
    const [rows] = await db.query(
      'SELECT id, email, name, phone, address, bio, profile_image, created_at, role FROM users WHERE id = ?',
      [userId]
    );

    // Trả về user đầu tiên hoặc null nếu không tìm thấy
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`[UserService] Error fetching profile for ID ${userId}:`, error.message);
    throw new Error('Database query failed');
  }
}

/**
 * Cập nhật thông tin người dùng (Hỗ trợ cập nhật từng phần - Partial Update)
 * @param {number|string} userId 
 * @param {Object} profileData 
 */
async function updateUserProfile(userId, profileData) {
  const { name, phone, address, bio, profile_image } = profileData;
  
  try {
    // 1. Kiểm tra xem user có tồn tại không trước khi update (tùy chọn nhưng an toàn)
    // 2. Xây dựng câu lệnh SQL động (Dynamic SQL) để tránh ghi đè dữ liệu cũ bằng null
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (profile_image !== undefined) {
      updates.push('profile_image = ?');
      params.push(profile_image);
    }

    if (updates.length === 0) {
      return { success: false, message: 'No data provided for update' };
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(userId);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return { success: false, message: 'User not found or no changes made' };
    }

    return { 
      success: true, 
      message: 'Profile updated successfully',
      affectedRows: result.affectedRows 
    };
  } catch (error) {
    console.error(`[UserService] Error updating profile for ID ${userId}:`, error.message);
    // Không nên quăng nguyên error object của DB ra ngoài để bảo mật
    throw new Error('Could not update user profile');
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile
};