const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * All routes in this file are protected and require valid JWT token
 * Authorization header format: Bearer <token>
 */

/**
 * GET /protected/profile
 * Get current authenticated user profile
 * Requires: Valid JWT token in Authorization header
 * Returns: Current user info from decoded token
 */
router.get('/profile', verifyToken, getProfile);

/**
 * GET /protected/verify
 * Verify the validity of current JWT token
 * Requires: Valid JWT token in Authorization header
 * Returns: Token validity and user info
 */
router.get('/verify', verifyToken, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
        tokenValid: true
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
