// middleware/auth.js
// JWT authentication middleware with hybrid store lookup

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || 'inkwell_ai_default_jwt_secret_key_2026';

const findUserById = async (id) => {
  if (!global.isInMemoryDB) {
    try {
      const user = await User.findById(id).select('-password');
      if (user) return user;
    } catch (e) {
      global.isInMemoryDB = true;
    }
  }
  return Array.from(global.memoryUsers.values()).find((u) => u.id === id || u._id === id) || null;
};

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await findUserById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token is invalid or expired. Please log in again.',
    });
  }
};

/**
 * Optional auth - attach user if token present, but don't block if not
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await findUserById(decoded.id);
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
