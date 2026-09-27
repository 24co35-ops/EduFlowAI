require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { isSupabaseConfigured } = require('./config/supabase');
const bobService = require('./services/bob.service');
const aiService = require('./services/ai');

const app = express();

// Security headers (disable CSP — this is an API server, not a page server)
app.use(helmet({ contentSecurityPolicy: false }));

// ponytail: CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : null; // null = allow all origins (safe when frontend is same-origin)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Blocked by CORS policy'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ponytail: Supabase client is initialized on require; no explicit connect step needed

// Trust proxy for rate limiting (Vercel / Cloudflare / Nginx)
app.set('trust proxy', 1);

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Mount Routes with specific rate limiters applied at route level
app.use(['/api/auth', '/auth'], authLimiter, require('./routes/auth.routes'));
app.use(['/api/lessons', '/lessons'], require('./routes/lesson.routes'));
app.use(['/api/quizzes', '/quizzes'], require('./routes/quiz.routes'));
app.use(['/api/student', '/student'], require('./routes/student.routes'));

// Healthcheck & Diagnostic Provider Status
app.get(['/api/health', '/health'], (req, res) => {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  const healthInfo = aiService.getHealthStatus();

  const payload = {
    status: 'online',
    appName: 'EduFlow AI Enterprise Backend',
    supabaseConfigured: isSupabaseConfigured(),
    databaseConnected: isSupabaseConfigured(),
    databaseProvider: 'Supabase Postgres',
    timestamp: new Date().toISOString(),
    primaryProvider: 'IBM BOB (watsonx.ai Granite 13B & 20B)',
    ibmBobConfigured: bobService.isConfigured()
  };

  // Diagnostic details (models, telemetry, geminiConfigured) are NEVER exposed in
  // production — even when ?diagnostics=true is passed — to avoid leaking provider
  // configuration information to external callers.
  if (!IS_PRODUCTION) {
    payload.geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10);
    payload.models = healthInfo.activeModels;
    payload.telemetry = healthInfo.metrics;
  }

  res.json(payload);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    requestId: 'err-' + Math.random().toString(36).substring(2, 9)
  });
});

// Start listener only when run directly as main script
if (require.main === module && process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 EduFlow AI Backend Server running on port ${PORT}`);
    console.log(`⚡ IBM BOB watsonx.ai Engine: ${bobService.isConfigured() ? 'LIVE API KEY CONNECTED' : 'OFFLINE DEMO / SMART FALLBACK ACTIVE'}`);
    console.log(`⚡ Models: Granite 13B (Instruct/Chat) & Granite 20B (Multilingual)`);
    console.log(`⚡ Database: ${isSupabaseConfigured() ? 'Supabase Postgres Connected' : 'In-Memory Demo Mode'}`);
    console.log(`==================================================`);
  });
}

module.exports = app;
