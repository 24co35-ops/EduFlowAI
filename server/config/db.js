const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoURI = process.env.MONGO_URI || (isProduction ? null : 'mongodb://localhost:27017/eduflow');

  if (!mongoURI) {
    console.error('[Database] CRITICAL: MONGO_URI is not defined in production environment.');
    // In production, we cannot operate without a database — fail hard.
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (isProduction) {
      console.error(`[Database] CRITICAL: Production DB connection failed: ${error.message}`);
      // In production, a failed DB connection is fatal — exit so the process supervisor
      // can restart with proper configuration, rather than silently serving 503s forever.
      process.exit(1);
    } else {
      console.warn(`[Database] MongoDB connection failed (${error.message}). App will run in memory / fallback mode for local demo.`);
      isConnected = false;
    }
  }
};

const getIsConnected = () => mongoose.connection.readyState === 1 || isConnected;

module.exports = { connectDB, getIsConnected };
