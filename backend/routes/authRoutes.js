const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

/**
 * POST /auth/register
 * Register a new user
 * Body: { email, password }
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Login user and get access token
 * Body: { email, password }
 */
router.post('/login', login);

module.exports = router;
