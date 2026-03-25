import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminOverview, getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../services/adminService';
import { createVocabulary, getAllVocabularies, deleteVocabulary, updateVocabulary } from '../services/vocabularyService';
import '../pages/AdminPage.css';

// Hằng số mặc định
const DEFAULT_ADMIN = 'admin123@gmail.com';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState({ overview: null, users: [], vocabularies: [] });
  const [editingVocab, setEditingVocab] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' }); // Thay error đơn thuần bằng status (success/error)

  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || DEFAULT_ADMIN;
  const isAdmin = user && user.email === adminEmail;

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, usersRes, vocabsRes] = await Promise.all([
          getAdminOverview(), 
          getAdminUsers(),
          getAllVocabularies()
        ]);
        
        setData({
          overview: overviewRes.success ? overviewRes.data : null,
          users: usersRes.success ? usersRes.data : [],
          vocabularies: vocabsRes.success ? vocabsRes.data : []
        });
      } catch (err) {
        setStatus({ type: 'error', msg: 'Không thể kết nối đến máy chủ admin.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // Handler xử lý thêm từ vựng
  const handleAddVocabulary = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const result = await createVocabulary(payload);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Thêm từ vựng thành công!' });
        e.target.reset();
      } else {
        setStatus({ type: 'error', msg: 'Lỗi: ' + (result.message || 'Không thể thêm từ.') });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi hệ thống khi lưu từ vựng.' });
    }
  };

  // Handler xử lý người dùng
  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const result = await createAdminUser(payload);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Thêm người dùng thành công!' });
        setData(prev => ({ ...prev, users: [result.data, ...prev.users] }));
        e.target.reset();
      } else {
        setStatus({ type: 'error', msg: 'Lỗi: ' + (result.message || 'Không thể thêm người dùng.') });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Lỗi hệ thống khi thêm.' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      const result = await deleteAdminUser(id);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Xóa người dùng thành công!' });
        setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
      } else {
        setStatus({ type: 'error', msg: 'Không thể xóa người dùng.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi hệ thống khi xóa.' });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    if (!payload.password) delete payload.password;

    try {
      const result = await updateAdminUser(editingUser.id, payload);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Cập nhật người dùng thành công!' });
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === editingUser.id ? { ...u, ...payload } : u)
        }));
        setEditingUser(null);
      } else {
        setStatus({ type: 'error', msg: 'Lỗi khi cập nhật người dùng.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Lỗi hệ thống khi cập nhật.' });
    }
  };

  const handleDeleteVocabulary = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa từ này?')) return;
    try {
      const result = await deleteVocabulary(id);
      if (result.success || result.message === 'Vocabulary deleted successfully') {
        setStatus({ type: 'success', msg: 'Xóa từ vựng thành công!' });
        setData(prev => ({ ...prev, vocabularies: prev.vocabularies.filter(v => v.id !== id) }));
      } else {
        setStatus({ type: 'error', msg: 'Không thể xóa từ vựng.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi hệ thống khi xóa từ vựng.' });
    }
  };

  const handleUpdateVocabulary = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const result = await updateVocabulary(editingVocab.id, payload);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Cập nhật từ vựng thành công!' });
        setData(prev => ({
          ...prev,
          vocabularies: prev.vocabularies.map(v => v.id === editingVocab.id ? result.data : v)
        }));
        setEditingVocab(null);
      } else {
        setStatus({ type: 'error', msg: 'Lỗi khi cập nhật từ vựng.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi hệ thống khi cập nhật.' });
    }
  };

  // 1. Kiểm tra quyền truy cập (Guard Clause)
  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-card no-access">
          <h2>🚫 Từ chối truy cập</h2>
          <p>Bạn không có quyền quản trị viên.</p>
          <button onClick={() => navigate('/dashboard')}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Chào mừng quản trị viên: <strong>{user.email}</strong></p>
        </header>

        {status.msg && (
          <div className={`status-alert ${status.type === 'error' ? 'admin-error' : 'admin-success'}`}>
            {status.msg}
          </div>
        )}

        {loading ? (
          <div className="loader">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Overview Stats */}
            <section className="admin-overview">
              <StatBox label="Tổng Users" value={data.overview?.totalUsers} />
              <StatBox label="Tổng Quizzes" value={data.overview?.totalQuizzes} />
            </section>

            {/* Add User Form */}
            <section className="admin-section">
              <h2>🆕 Thêm người dùng mới</h2>
              <form onSubmit={handleAddUser} className="vocab-form">
                <div className="form-grid">
                  <FormInput label="Tên" name="name" />
                  <FormInput label="Email" name="email" type="email" required />
                  <FormInput label="Mật khẩu" name="password" type="password" required />
                  <FormInput label="Vai trò" name="role" type="select" options={['user', 'admin']} defaultValue="user" />
                </div>
                <button type="submit" className="btn-submit">Lưu người dùng</button>
              </form>
            </section>

            {/* Users Table */}
            <section className="admin-section">
              <h2>👥 Quản lý người dùng</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <UserRow 
                        key={u.id || u.email} 
                        u={u} 
                        adminEmail={adminEmail} 
                        isEditing={editingUser && editingUser.id === u.id}
                        setEditingUser={setEditingUser}
                        handleUpdateUser={handleUpdateUser}
                        handleDeleteUser={handleDeleteUser}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Vocabulary Form */}
            <section className="admin-section">
              <h2>🆕 Thêm từ vựng mới</h2>
              <form onSubmit={handleAddVocabulary} className="vocab-form">
                <div className="form-grid">
                  <FormInput label="Word" name="word" required />
                  <FormInput label="Pronunciation" name="pronunciation" />
                  <FormInput label="Difficulty" name="difficulty" type="select" 
                    options={['easy', 'medium', 'hard']} defaultValue="medium" 
                  />
                  <div className="form-row full-width">
                    <label>Meaning</label>
                    <textarea name="meaning" required rows="3" />
                  </div>
                  <FormInput label="Example" name="example" className="full-width" />
                </div>
                <button type="submit" className="btn-submit">Lưu từ vựng</button>
              </form>
            </section>
            {/* Vocabularies Management Table */}
            <section className="admin-section">
              <h2>📚 Quản lý từ vựng</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Word</th>
                      <th>Thuộc tính</th>
                      <th>Meaning</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vocabularies.map((v) => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        {editingVocab && editingVocab.id === v.id ? (
                          <td colSpan="4">
                            <form onSubmit={handleUpdateVocabulary} className="vocab-form inline-form">
                              <div className="form-grid">
                                <FormInput label="Word" name="word" required defaultValue={v.word} />
                                <FormInput label="Pronunciation" name="pronunciation" defaultValue={v.pronunciation} />
                                <FormInput label="Difficulty" name="difficulty" type="select" options={['easy', 'medium', 'hard']} defaultValue={v.difficulty} />
                                <div className="form-row full-width">
                                  <label>Meaning</label>
                                  <textarea name="meaning" required rows="3" defaultValue={v.meaning} />
                                </div>
                                <FormInput label="Example" name="example" className="full-width" defaultValue={v.example} />
                              </div>
                              <div className="btn-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn-submit">Lưu</button>
                                <button type="button" className="btn-cancel" onClick={() => setEditingVocab(null)}>Hủy</button>
                              </div>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td><strong>{v.word}</strong></td>
                            <td>
                              <span className="badge">{v.difficulty}</span>
                              {v.pronunciation && <span className="pronunciation" style={{ fontSize: '0.9em', color: '#666' }}> /{v.pronunciation}/</span>}
                            </td>
                            <td>{v.meaning}</td>
                            <td>
                              <button className="btn-edit" onClick={() => setEditingVocab(v)} style={{ marginRight: '5px' }}>Sửa</button>
                              <button className="btn-delete" onClick={() => handleDeleteVocabulary(v.id)}>Xóa</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {data.vocabularies.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có từ vựng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Quay lại Dashboard
        </button>
      </div>
    </div>
  );
};

// --- Sub-components để code gọn gàng hơn ---

const StatBox = ({ label, value }) => (
  <div className="overview-box">
    <h3>{label}</h3>
    <span>{value ?? 0}</span>
  </div>
);

const UserRow = ({ u, adminEmail, isEditing, setEditingUser, handleUpdateUser, handleDeleteUser }) => {
  if (isEditing) {
    return (
      <tr>
        <td colSpan="5">
          <form onSubmit={handleUpdateUser} className="vocab-form inline-form">
            <div className="form-grid">
              <FormInput label="Tên" name="name" defaultValue={u.name} />
              <FormInput label="Email" name="email" type="email" required defaultValue={u.email} />
              <FormInput label="Mật khẩu mới (Tùy chọn)" name="password" type="password" />
              <FormInput label="Vai trò" name="role" type="select" options={['user', 'admin']} defaultValue={u.role || 'user'} />
            </div>
            <div className="btn-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn-submit">Lưu</button>
              <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Hủy</button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td><strong>{u.name || 'N/A'}</strong></td>
      <td>{u.email}</td>
      <td>
        <span className={`role-badge ${u.role === 'admin' || u.email === adminEmail ? 'admin' : 'user'}`}>
          {u.role || 'user'}
        </span>
      </td>
      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button className="btn-edit" onClick={() => setEditingUser(u)} style={{ marginRight: '5px' }}>Sửa</button>
        {/* Do not let users delete the master admin easily contextually */}
        {u.email !== adminEmail && (
          <button className="btn-delete" onClick={() => handleDeleteUser(u.id)}>Xóa</button>
        )}
      </td>
    </tr>
  );
};

const FormInput = ({ label, name, type = 'text', options, className = "", ...props }) => (
  <div className={`form-row ${className}`}>
    <label>{label}</label>
    {type === 'select' ? (
      <select name={name} {...props}>
        {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
      </select>
    ) : (
      <input type={type} name={name} {...props} />
    )}
  </div>
);

export default AdminPage;