// routes/auth.js
// User registration, login, profile, and credit refill routes

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * Generate a signed JWT token for a user
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'inkwell_ai_default_jwt_secret_key_2026';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('email')
      .trim()
      .isEmail().withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map((e) => e.msg).join('. ');
      return res.status(400).json({ success: false, error: msg, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
        });
      }

      // Create user (with 5 initial credits)
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        credits: 5,
        tier: 'free',
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          blogsGenerated: user.blogsGenerated || 0,
          credits: user.credits,
          tier: user.tier,
        },
        message: 'Account created successfully! You got 5 free credits.',
      });

    } catch (error) {
      console.error('❌ Register error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email address required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map((e) => e.msg).join('. ');
      return res.status(400).json({ success: false, error: msg, errors: errors.array() });
    }

    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No account found with this email address. Please register first.',
        });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. Please try again.',
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          blogsGenerated: user.blogsGenerated || 0,
          credits: user.credits,
          tier: user.tier,
        },
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed. Please try again.',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current logged-in user's profile
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        blogsGenerated: user.blogsGenerated || 0,
        credits: user.credits,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
});

/**
 * POST /api/auth/add-credits
 * Simulate credit top-up or tier upgrade
 */
router.post('/add-credits', protect, async (req, res) => {
  const { amount = 25, planTier = 'pro' } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { credits: amount, totalCreditsPurchased: amount },
        $set: { tier: planTier },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Successfully added ${amount} credits! Plan upgraded to ${planTier.toUpperCase()}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        blogsGenerated: user.blogsGenerated,
        credits: user.credits,
        tier: user.tier,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add credits.' });
  }
});

module.exports = router;
