// routes/auth.js
// User registration, login, profile, and credit refill routes with Hybrid DB fallback

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// Helper methods for hybrid DB execution
const findUserByEmail = async (email) => {
  if (!global.isInMemoryDB) {
    try {
      const dbUser = await User.findOne({ email }).select('+password');
      if (dbUser) return dbUser;
    } catch (e) {
      console.warn('MongoDB query warning, using memory fallback:', e.message);
      global.isInMemoryDB = true;
    }
  }
  return global.memoryUsers.get(email) || null;
};

const createUserRecord = async ({ name, email, password }) => {
  if (!global.isInMemoryDB) {
    try {
      const dbUser = await User.create({
        name: name.trim(),
        email,
        password,
        credits: 5,
        tier: 'free',
      });
      return dbUser;
    } catch (e) {
      console.warn('MongoDB create warning, using memory fallback:', e.message);
      global.isInMemoryDB = true;
    }
  }

  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const memUser = {
    _id: id,
    id,
    name: name.trim(),
    email,
    password: hashedPassword,
    credits: 5,
    tier: 'free',
    blogsGenerated: 0,
    comparePassword: async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
  };

  global.memoryUsers.set(email, memUser);
  return memUser;
};

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map((e) => e.msg).join('. ');
      return res.status(400).json({ success: false, error: msg });
    }

    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
        });
      }

      const user = await createUserRecord({ name, email: cleanEmail, password });
      const token = generateToken(user._id || user.id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          blogsGenerated: user.blogsGenerated || 0,
          credits: user.credits ?? 5,
          tier: user.tier || 'free',
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
      return res.status(400).json({ success: false, error: msg });
    }

    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = await findUserByEmail(cleanEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No account found with this email address. Please register first.',
        });
      }

      let isPasswordValid = false;
      if (typeof user.comparePassword === 'function') {
        isPasswordValid = await user.comparePassword(password);
      } else if (user.password) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. Please try again.',
        });
      }

      const token = generateToken(user._id || user.id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          blogsGenerated: user.blogsGenerated || 0,
          credits: user.credits ?? 5,
          tier: user.tier || 'free',
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
 */
router.get('/me', protect, async (req, res) => {
  try {
    let user = req.user;
    if (!user && req.userId) {
      user = Array.from(global.memoryUsers.values()).find((u) => u.id === req.userId || u._id === req.userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        blogsGenerated: user.blogsGenerated || 0,
        credits: user.credits ?? 5,
        tier: user.tier || 'free',
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
});

/**
 * POST /api/auth/add-credits
 */
router.post('/add-credits', protect, async (req, res) => {
  const { amount = 25, planTier = 'pro' } = req.body;

  try {
    let user = req.user;

    if (!global.isInMemoryDB && user && user._id) {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { credits: amount, totalCreditsPurchased: amount },
          $set: { tier: planTier },
        },
        { new: true }
      );
    } else if (user) {
      user.credits = (user.credits || 0) + amount;
      user.tier = planTier;
      if (user.email && global.memoryUsers.has(user.email)) {
        global.memoryUsers.set(user.email, user);
      }
    }

    res.json({
      success: true,
      message: `Successfully added ${amount} credits! Plan upgraded to ${planTier.toUpperCase()}.`,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        blogsGenerated: user.blogsGenerated || 0,
        credits: user.credits ?? 30,
        tier: user.tier || planTier,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add credits.' });
  }
});

module.exports = router;
