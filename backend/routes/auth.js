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
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
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
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists.',
        });
      }

      // Create user (with 5 initial credits)
      const user = await User.create({ name, email, password, credits: 5, tier: 'free' });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          blogsGenerated: user.blogsGenerated,
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
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
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
          blogsGenerated: user.blogsGenerated,
          credits: user.credits,
          tier: user.tier,
        },
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.',
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

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        blogsGenerated: user.blogsGenerated,
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        tier: user.tier,
      },
      message: `Successfully added ${amount} credits! Upgraded to ${planTier.toUpperCase()} plan.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add credits.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = router;
