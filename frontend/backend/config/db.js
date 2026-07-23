// config/db.js
// Serverless-friendly MongoDB connection using Mongoose

const mongoose = require('mongoose');

let isConnected = 0;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-blog-writer';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('⚠️ MongoDB connection failed:', error.message);
    // Do not call process.exit in serverless environment
  }
};

module.exports = connectDB;
