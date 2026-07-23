// middleware/auth.js
// JWT authentication middleware with fallback secret handling

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || 'inkwell_ai_default_jwt_secret_key_2026';

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
    req.user = await User.findById(decoded.id).select('-password');

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
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
