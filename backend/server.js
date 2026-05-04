// server.js
// Main Express server - entry point for the backend

require('dotenv').config(); // Load environment variables first

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── Initialize Express ────────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────

// CORS - allow requests from frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse JSON request bodies (up to 10mb for blog content)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for AI generation (it's expensive!)
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // 5 generations per minute
  message: {
    success: false,
    error: 'Generation rate limit reached. Please wait 1 minute.',
  },
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/blogs/generate', generateLimiter);
app.use('/api/blogs/humanize', generateLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/auth', require('./routes/auth'));

// ─── Error Handlers ───────────────────────────────────────────────────────────

// 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, errors });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ══════════════════════════════════════════');
  console.log(`   AI Blog Writer Backend Running!`);
  console.log(`   Port:        ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health:      http://localhost:${PORT}/health`);
  console.log('════════════════════════════════════════════');
  console.log('');
});

module.exports = app;
