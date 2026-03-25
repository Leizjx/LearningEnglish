import axiosInstance from './axiosInstance';

/**
 * Authentication Service
 * Contains all API calls related to authentication
 * (Note: Register and Login are handled by AuthContext, but shown here for reference)
 */

// Register new user
export const registerUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/verify-email', {
      token
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout (clear token on backend if needed)
export const logout = async () => {
  try {
    // Token is removed from localStorage by AuthContext
    // This can be used to invalidate token on backend
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout
};
