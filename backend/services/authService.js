const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const BCRYPT_ROUNDS = 10;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  // Optional: Add more strict password requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumbers = /\d/.test(password);
  // if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
  //   return { isValid: false, error: 'Password must contain uppercase, lowercase, and numbers' };
  // }

  return { isValid: true, error: null };
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

/**
 * Compare password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
}

/**
 * Check if user exists by email
 * @param {string} email - Email to check
 * @returns {Promise<Object|null>} - User object if exists, null otherwise
 */
async function findUserByEmail(email) {
  try {
    const [rows] = await db.query(
      'SELECT id, email, password, role FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    if (error.message.includes("Unknown column 'role'") || error.errno === 1054) {
      const [rows] = await db.query(
        'SELECT id, email, password FROM users WHERE email = ?',
        [email.toLowerCase()]
      );
      return rows.length > 0 ? rows[0] : null;
    }
    throw new Error('Error querying database');
  }
}

/**
 * Create new user in database
 * @param {string} email - User email
 * @param {string} hashedPassword - Hashed password
 * @param {string} role - User role
 * @returns {Promise<Object>} - Created user with id
 */
async function createUser(email, hashedPassword, role = 'user') {
  const defaultAvatar = '/uploads/profiles/default-avatar.png';
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, password, role, profile_image) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), hashedPassword, role, defaultAvatar]
    );
    return {
      id: result.insertId,
      email: email.toLowerCase(),
      role,
      profile_image: defaultAvatar
    };
  } catch (error) {
    if (error.message.includes("Unknown column 'role'") || error.errno === 1054) {
      const [result] = await db.query(
        'INSERT INTO users (email, password, profile_image) VALUES (?, ?, ?)',
        [email.toLowerCase(), hashedPassword, defaultAvatar]
      );
      return {
        id: result.insertId,
        email: email.toLowerCase(),
        role,
        profile_image: defaultAvatar
      };
    }
    throw new Error('Error creating user in database');
  }
}

/**
 * Generate JWT token
 * @param {Object} user - User object with id and email
 * @returns {string} - JWT token
 */
function generateToken(user) {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (error) {
    throw new Error('Error generating token');
  }
}

/**
 * Register user service
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - Created user object
 */
async function registerUser(email, password) {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    throw { status: 400, message: emailValidation.error };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw { status: 400, message: passwordValidation.error };
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw { status: 409, message: 'Email already exists' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Assign role (admin via special email)
  const isAdminRegistration =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || 'admin123@gmail.com');
  const role = isAdminRegistration ? 'admin' : 'user';

  // Create user
  const newUser = await createUser(email, hashedPassword, role);

  return newUser;
}

/**
 * Login user service
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - Token and user info
 */
async function loginUser(email, password) {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    throw { status: 400, message: emailValidation.error };
  }

  // Direct admin credential fallback (hardcoded allowed admin)
  const isAdminFallback =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || 'admin123@gmail.com') &&
    password === (process.env.ADMIN_PASSWORD || '123123');

  // Validate password (skip if using admin fallback)
  if (!isAdminFallback) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw { status: 400, message: passwordValidation.error };
    }
  }

  // Find user
  let user = await findUserByEmail(email);



  if (!user && isAdminFallback) {
    // Generate token for admin without DB record
    const token = generateToken({ id: null, email: email.toLowerCase(), role: 'admin' });
    return {
      accessToken: token,
      user: {
        id: null,
        email: email.toLowerCase(),
        role: 'admin'
      }
    };
  }

  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  // Determine role from DB or fallback by email
  const role = user.role ||
    (user.email === (process.env.ADMIN_EMAIL || 'admin123@gmail.com') ? 'admin' : 'user');

  // Generate token
  const token = generateToken({ id: user.id, email: user.email, role });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      role
    }
  };
}

module.exports = {
  // Validation functions
  validateEmail,
  validatePassword,

  // Password functions
  hashPassword,
  comparePassword,

  // Database functions
  findUserByEmail,
  createUser,

  // Token functions
  generateToken,

  // Service functions
  registerUser,
  loginUser
};
