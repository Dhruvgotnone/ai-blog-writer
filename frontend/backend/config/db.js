// config/db.js
// Serverless-friendly MongoDB connection using Mongoose

const mongoose = require('mongoose');

// Disable buffering so failed DB connections fail fast instead of hanging 10s
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('localhost')) {
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is missing or points to localhost in Vercel settings.');
    }
  }

  const connectionUri = uri || 'mongodb://localhost:27017/ai-blog-writer';

  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`Database connection timeout (${error.message}). Please verify MongoDB Atlas Network Access is set to Allow Access from Anywhere (0.0.0.0/0).`);
  }
};

module.exports = connectDB;
