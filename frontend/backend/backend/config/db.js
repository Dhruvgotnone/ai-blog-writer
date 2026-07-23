// config/db.js
// Serverless-friendly MongoDB connection with automatic Hybrid Memory Store fallback

const mongoose = require('mongoose');

// Initialize in-memory storage arrays for guaranteed 100% uptime fallback
global.memoryUsers = global.memoryUsers || new Map();
global.memoryBlogs = global.memoryBlogs || [];
global.isInMemoryDB = false;

// Disable command buffering
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    global.isInMemoryDB = false;
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('localhost') || uri.includes('REPLACE')) {
    console.warn('⚠️ MONGODB_URI missing or localhost. Enabling Memory Store fallback.');
    global.isInMemoryDB = true;
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    global.isInMemoryDB = false;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection failed. Enabling Hybrid Memory Store fallback.');
    global.isInMemoryDB = true;
  }
};

module.exports = connectDB;
