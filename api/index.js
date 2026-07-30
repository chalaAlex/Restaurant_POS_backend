const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('../app');

// Connect to database
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Use DATABASE or DATABASE_LOCAL from environment
    const DB = process.env.DATABASE || process.env.DATABASE_LOCAL;
    
    if (!DB) {
      throw new Error('Database connection string not found in environment variables');
    }

    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
