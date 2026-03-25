import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Tách hằng số URL ra ngoài để dễ quản lý
const API_BASE_URL = 'http://localhost:5000';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hàm xử lý hiển thị ảnh avatar chuyên nghiệp hơn
  const getAvatarUrl = () => {
    if (!user?.profile_image) return null;
    return user.profile_image.startsWith('http') 
      ? user.profile_image 
      : `${API_BASE_URL}${user.profile_image}`;
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard">
        <header className="dashboard-header">
          <h1>Welcome to English App! 🎉</h1>
        </header>

        {/* User Greeting Section */}
        <section className="user-greeting-section" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', flexWrap: 'wrap' }}>
          <img 
            src={getAvatarUrl() || 'https://via.placeholder.com/80?text=Avatar'} 
            alt="User Avatar" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #74b9ff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, color: '#2d3436', fontSize: '1.8rem' }}>Xin chào {(user?.role === 'admin' || user?.email === 'admin123@gmail.com') ? 'Quản trị viên' : 'Học viên'} {user?.name || ''}! 👋</h2>
            <p style={{ margin: '8px 0 0 0', color: '#636e72', fontSize: '1.1rem' }}>Sẵn sàng chinh phục từ vựng mới ngày hôm nay chưa?</p>
          </div>
          <Link to="/profile" style={{ padding: '12px 24px', background: '#e1f5fe', color: '#0984e3', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #b3e5fc', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            ✏️ Hồ sơ cá nhân
          </Link>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Available Features</h2>
          <div className="feature-grid">
            <FeatureCard 
              to="/flashcards" 
              icon="🎴" 
              title="Flashcards" 
              desc="Practice English vocabulary with interactive flashcards" 
            />
            
            <FeatureCard 
              to="/quizzes" 
              icon="📝" 
              title="Quizzes" 
              desc="Test your knowledge with multiple choice questions" 
            />

            {/* Admin Check */}
            {user?.role === 'admin' || user?.email === 'admin123@gmail.com' ? (
              <FeatureCard 
                to="/admin" 
                icon="🔧" 
                title="Admin" 
                desc="Quản lý người dùng và thống kê" 
                className="admin-card"
              />
            ) : null}
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="action-section">
          <p className="status-text">
            You are logged in with protected access.
          </p>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </footer>
      </main>
    </div>
  );
}

// Component nhỏ hỗ trợ hiển thị Feature
const FeatureCard = ({ to, icon, title, desc, className = "" }) => (
  <Link to={to} className={`feature-card ${className}`}>
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </Link>
);

export default DashboardPage;