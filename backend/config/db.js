// config/db.js
// Serverless-friendly MongoDB connection with fast timeout guards

const mongoose = require('mongoose');

// Disable command buffering so failed connections return errors instantly
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('localhost') || uri.includes('REPLACE')) {
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is missing in Vercel settings.');
    }
  }

  const connectionUri = uri || 'mongodb://localhost:27017/ai-blog-writer';

  try {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 2500, // Timeout fast in 2.5s
      connectTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error('Could not connect to MongoDB Atlas. Please ensure MongoDB Atlas Network Access allows 0.0.0.0/0 (Access from Anywhere).');
  }
};

module.exports = connectDB;
