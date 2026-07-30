const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// Database connection
const connectDB = async () => {
  try {
    // Use DATABASE if available (production), otherwise DATABASE_LOCAL (development)
    let DB = process.env.DATABASE.replace('<MONGODB_PASSWORD>', process.env.MONGODB_PASSWORD);

    if (!process.env.NODE_ENV === "development") {
      DB = process.env.DATABASE_LOCAL;

      if (!DB) {
        throw new Error('No local database connection string found in environment variables');
      }
      await mongoose.connect(DB, {});
      console.log('Local Database connection successful!');
      return;
    }

    if (!DB) {
      throw new Error('No remote database connection string found in environment variables');
    }

    await mongoose.connect(DB, {});
    console.log('Remote Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// Connect to database
connectDB();

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development - create HTTP server
  const server = http.createServer(app);
  const port = process.env.PORT || '3000';

  server.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
}