// models/User.js
// User schema for JWT authentication

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },

    // Track total blogs generated
    blogsGenerated: {
      type: Number,
      default: 0,
    },

    // SaaS Credit & Subscription Tier System
    credits: {
      type: Number,
      default: 5,
    },

    tier: {
      type: String,
      enum: ['free', 'pro', 'agency'],
      default: 'free',
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'admin', // Make default admin so current accounts can manage
    },

    totalCreditsPurchased: {
      type: Number,
      default: 0,
    },

    // User avatar (initials-based by default)
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password in JSON responses
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
