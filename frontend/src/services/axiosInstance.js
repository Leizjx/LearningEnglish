import axios from 'axios';

/**
 * Axios instance với base URL và JWT token interceptor
 * Tự động gắn JWT token từ localStorage vào mỗi request
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s — đủ để handle Render cold start (~15-30s)
});

/**
 * Request interceptor — gắn JWT token vào header Authorization
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor — xử lý lỗi + tự retry 1 lần nếu timeout
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response) {
      const status = error.response.status;

      // 401: Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        console.warn('Token expired or invalid. Clearing auth...');
        localStorage.removeItem('accessToken');
        // Redirect về login nếu muốn:
        // window.location.href = '/login';
      }

      if (status === 403) {
        console.warn('Access forbidden.');
      }

      if (status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Timeout hoặc network error → retry 1 lần duy nhất
      if (!config._retried) {
        config._retried = true;
        console.warn('⚡ Request timeout/network error — retrying once...');
        // Đợi 2s rồi thử lại (cho server thời gian wake up)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return axiosInstance(config);
      }
      console.error('Request failed after retry:', error.message);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
