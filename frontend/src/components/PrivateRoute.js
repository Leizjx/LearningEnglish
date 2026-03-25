import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // 1. Phải đợi check xong Loading mới quyết định chuyển hướng
  if (loading) return <div className="loading">Đang kiểm tra đăng nhập...</div>;

  // 2. Nếu đã login (isAuthenticated là true), Outlet sẽ hiển thị Dashboard/Profile...
  // Nếu chưa login, đá về trang /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;