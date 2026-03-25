const db = require('../config/db');
const quizService = require('../services/quizService');
const authService = require('../services/authService');

/**
 * Lấy danh sách tất cả người dùng (Dành cho Admin)
 */
async function getAllUsers(req, res) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin123@gmail.com';
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
    let users = [];

    try {
      // Thử truy vấn đầy đủ các cột mới nhất
      const [rows] = await db.query(
        'SELECT id, email, name, role, profile_image, created_at FROM users ORDER BY created_at DESC'
      );
      
      users = rows.map(u => ({
        ...u,
        // Chỉ thêm domain nếu profile_image là đường dẫn tương đối
        profile_image: u.profile_image 
          ? (u.profile_image.startsWith('http') ? u.profile_image : `${BASE_URL}${u.profile_image}`)
          : null,
        // Đảm bảo role luôn chính xác dựa trên email admin nếu database chưa set role
        role: u.role || (u.email === ADMIN_EMAIL ? 'admin' : 'user')
      }));

    } catch (innerErr) {
      // Xử lý lỗi "Unknown column" (errno 1054) nếu database cũ chưa kịp migration
      if (innerErr.errno === 1054) {
        const [rows] = await db.query(
          'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC'
        );
        users = rows.map(u => ({ 
          ...u, 
          role: u.email === ADMIN_EMAIL ? 'admin' : 'user',
          profile_image: null
        }));
      } else {
        throw innerErr; // Các lỗi khác thì quăng ra ngoài
      }
    }

    return res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('[AdminController] getAllUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách người dùng.'
    });
  }
}

/**
 * Lấy số liệu tổng quan hệ thống cho Dashboard
 */
async function getDashboardOverview(req, res) {
  try {
    // Sử dụng Promise.all để chạy 2 truy vấn song song, giúp tăng tốc độ phản hồi
    const [[userCountResult], quizzes] = await Promise.all([
      db.query('SELECT COUNT(*) AS totalUsers FROM users'),
      quizService.getAllQuizzes()
    ]);

    const totalUsers = userCountResult[0]?.totalUsers || 0;
    const totalQuizzes = quizzes?.length || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalQuizzes,
        quizStats: quizzes // Trả về danh sách quiz để hiển thị chi tiết nếu cần
      }
    });

  } catch (error) {
    console.error('[AdminController] getDashboardOverview Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu tổng quan hệ thống.'
    });
  }
}

/**
 * Thêm người dùng mới (Dành cho Admin)
 */
async function createUser(req, res) {
  try {
    const { email, name, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email và mật khẩu là bắt buộc.' });
    }

    const emailValidation = authService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.error });
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ success: false, message: passwordValidation.error });
    }

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại.' });
    }

    const hashedPassword = await authService.hashPassword(password);
    const userRole = role || 'user';
    
    try {
      const [result] = await db.query(
        'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
        [email.toLowerCase(), name || null, hashedPassword, userRole]
      );
      return res.status(201).json({ success: true, message: 'Tạo người dùng thành công.', data: { id: result.insertId, email, name, role: userRole } });
    } catch (dbErr) {
      const [result] = await db.query(
        'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
        [email.toLowerCase(), name || null, hashedPassword]
      );
      return res.status(201).json({ success: true, message: 'Tạo người dùng thành công.', data: { id: result.insertId, email, name, role: 'user' } });
    }
  } catch (error) {
    console.error('[AdminController] createUser Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo người dùng.' });
  }
}

/**
 * Cập nhật người dùng (Dành cho Admin)
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;
    
    let updates = [];
    let values = [];
    
    if (email) {
      const emailValidation = authService.validateEmail(email);
      if (!emailValidation.isValid) return res.status(400).json({ success: false, message: emailValidation.error });
      updates.push('email = ?');
      values.push(email.toLowerCase());
    }
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (password) {
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.isValid) return res.status(400).json({ success: false, message: passwordValidation.error });
      const hashedPassword = await authService.hashPassword(password);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có thông tin nào để cập nhật.' });
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      await db.query(query, values);
    } catch (dbErr) {
      if (dbErr.errno === 1054) {
        let safeU = [];
        let safeV = [];
        if (email) { safeU.push('email = ?'); safeV.push(email.toLowerCase()); }
        if (name !== undefined) { safeU.push('name = ?'); safeV.push(name); }
        if (password) { safeU.push('password = ?'); safeV.push(await authService.hashPassword(password)); }
        safeV.push(id);
        if(safeU.length > 0) {
          await db.query(`UPDATE users SET ${safeU.join(', ')} WHERE id = ?`, safeV);
        }
      } else {
        throw dbErr;
      }
    }

    return res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công.' });
  } catch (error) {
    console.error('[AdminController] updateUser Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật người dùng.' });
  }
}

/**
 * Xóa người dùng (Dành cho Admin)
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Xóa người dùng thành công.' });
  } catch (error) {
    console.error('[AdminController] deleteUser Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng.' });
  }
}

module.exports = {
  getAllUsers,
  getDashboardOverview,
  createUser,
  updateUser,
  deleteUser
};