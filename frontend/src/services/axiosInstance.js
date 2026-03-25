import axios from 'axios';

/**
 * Axios instance with base URL and JWT token interceptor
 * Automatically attaches JWT token from localStorage to every request
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request interceptor
 * Automatically adds JWT token to Authorization header
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    // Attach token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common response scenarios
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      // Handle 401 Unauthorized (token expired or invalid)
      if (status === 401) {
        console.warn('Token expired or invalid. Clearing auth...');
        localStorage.removeItem('accessToken');
        // Optionally redirect to login
        // window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.warn('Access forbidden.');
      }

      // Handle 500 Server Error
      if (status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
