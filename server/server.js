const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getIsConnected } = require('./config/db');
const bobService = require('./services/bob.service');

// Load environment variables
dotenv.config();

const app = express();

// ponytail: restrict CORS to configured frontend or dev origins instead of open '*'
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// API Routes (supports both local /api/ path and Vercel serverless / path)
app.use(['/api/auth', '/auth'], require('./routes/auth.routes'));
app.use(['/api/lessons', '/lessons'], require('./routes/lesson.routes'));
app.use(['/api/quizzes', '/quizzes'], require('./routes/quiz.routes'));
app.use(['/api/student', '/student'], require('./routes/student.routes'));

// Healthcheck
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    appName: 'EduFlow AI Backend',
    databaseConnected: getIsConnected(),
    watsonxConfigured: bobService.isConfigured(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10),
    timestamp: new Date()
  });
});

// ponytail: start listener only when run directly as main script
if (require.main === module && process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 EduFlow AI Backend Server running on port ${PORT}`);
    console.log(`⚡ IBM BOB watsonx.ai Engine: ${bobService.isConfigured() ? 'LIVE API KEY CONNECTED' : 'OFFLINE DEMO MODE (Smart Engine active)'}`);
    console.log(`⚡ Gemini Engine: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    console.log(`==================================================`);
  });
}

module.exports = app;

