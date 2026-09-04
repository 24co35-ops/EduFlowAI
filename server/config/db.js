const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || (process.env.NODE_ENV === 'production' ? null : 'mongodb://localhost:27017/eduflow');
  if (!mongoURI) {
    console.error('[Database] CRITICAL: MONGO_URI is not defined in production environment.');
    isConnected = false;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection skipped or failed (${error.message}).`);
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] CRITICAL: Production running without active database connection!');
    } else {
      console.warn(`[Database] App will run in memory / fallback mode for local demo.`);
    }
    isConnected = false;
  }
};

const getIsConnected = () => mongoose.connection.readyState === 1 || isConnected;

module.exports = { connectDB, getIsConnected };

