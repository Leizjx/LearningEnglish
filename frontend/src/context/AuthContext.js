import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken')); // Khởi tạo trực tiếp từ storage
  const [initialLoading, setInitialLoading] = useState(true); // Chỉ dùng chặn giao diện ban đầu
  const [loading, setLoading] = useState(false); // Dùng cho tiến trình login/register
  const [error, setError] = useState(null);

  // Hàm xác thực token (được memo để tránh tạo lại hàm vô ích)
  const verifyToken = useCallback(async (tokenToVerify) => {
    try {
      const response = await axiosInstance.get('/users/profile', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Xác thực token thất bại:', err);
      handleLogout();
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Kiểm tra token khi ứng dụng khởi chạy
  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setInitialLoading(false);
    }
  }, [token, verifyToken]);

  // Đăng ký
  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/auth/register', { email, password });
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });

      if (data.success && data.data.accessToken) {
        const { accessToken, user: userData } = data.data;

        localStorage.setItem('accessToken', accessToken);
        setToken(accessToken);
        setUser(userData);

        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất (Dùng useCallback để ổn định tham chiếu)
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Giá trị Context được ghi nhớ (Memoized) để tránh re-render tất cả component con khi không cần thiết
  const contextValue = useMemo(() => ({
    user,
    token,
    loading, // state cho button loading ở trang Login
    error,
    register,
    login,
    logout: handleLogout,
    isAuthenticated: !!token && !!user
  }), [user, token, loading, error, handleLogout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}