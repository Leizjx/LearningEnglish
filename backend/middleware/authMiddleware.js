const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/**
 * Extract token from Authorization header
 * Format: Bearer <token>
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null if not found
 */
function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  // Check if header follows "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * JWT token verification middleware
 * Verifies Bearer token and attaches decoded user to request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
function verifyToken(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Missing Authorization header'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Use: Bearer <token>'
      });
    }

    // Verify and decode token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);

        // Handle different JWT errors
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            success: false,
            message: 'Invalid token'
          });
        }

        return res.status(403).json({
          success: false,
          message: 'Token verification failed'
        });
      }

      // Attach decoded user to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * @param {string|string[]} requiredRoles - Role(s) required to access route
 * @returns {Function} - Middleware function
 */
function checkRole(requiredRoles) {
  // Handle single role or array of roles
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Normalize role assignment; admin by email fallback
      const userRole = req.user.role ||
        (req.user.email === (process.env.ADMIN_EMAIL || 'admin123@gmail.com') ? 'admin' : 'user');

      // Check if user has required role
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Optional authentication middleware
 * Does not reject if token is missing, but verifies if present
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return next();
    }

    const token = extractToken(authHeader);

    if (!token) {
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded;
      }
      next();
    });
  } catch (error) {
    // Continue even if verification fails
    next();
  }
}

module.exports = {
  verifyToken,
  checkRole,
  optionalAuth,
  extractToken
};