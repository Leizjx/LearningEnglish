const { registerUser, loginUser } = require('../services/authService');

/**
 * Register a new user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Use auth service to register user
    const newUser = await registerUser(email, password);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    // Handle service errors
    if (error.status && error.message) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Login user and return access token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Use auth service to login user
    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    // Handle service errors
    if (error.status && error.message) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Get user profile (for protected routes)
 * @param {Object} req - Express request (with user from token)
 * @param {Object} res - Express response
 */
function getProfile(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
