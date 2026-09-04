const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB, getIsConnected } = require('./config/db');
const bobService = require('./services/bob.service');

// Load environment variables
dotenv.config();

const app = express();

// Security headers (disable CSP — this is an API server, not a page server)
app.use(helmet({ contentSecurityPolicy: false }));

// ponytail: same-origin by default on Vercel (frontend + API on same host);
// only enforce allowlist when CLIENT_URL explicitly differs (e.g. separate frontend domain)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : null; // null = allow all origins (safe when frontend is same-origin)

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin = server-to-server or same-origin request — always allow
      if (!origin) return callback(null, true);
      // If no allowlist configured, allow all (Vercel same-origin deployment)
      if (!allowedOrigins) return callback(null, true);
      // Otherwise enforce the allowlist
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Blocked by CORS policy'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Strip $ and . from request bodies to prevent NoSQL injection
app.use(mongoSanitize());

// Connect to MongoDB
connectDB();

// API Routes
// ponytail: rate-limit auth endpoints — trust Vercel/proxy forwarded IPs
app.set('trust proxy', 1);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use(['/api/auth', '/auth'], authLimiter, require('./routes/auth.routes'));
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

