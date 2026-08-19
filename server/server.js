const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const bobService = require('./services/bob.service');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/student', require('./routes/student.routes'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'EduFlow AI Backend',
    watsonxConfigured: bobService.isConfigured(),
    timestamp: new Date()
  });
});

// Socket.io Real-time Doubt Solver Chat
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('send_message', async (data) => {
    try {
      const { message, syllabusScope, history } = data;
      // Emit immediate thinking status
      socket.emit('bot_status', { status: 'thinking' });

      // Call IBM BOB doubt solver engine
      const bobResponse = await bobService.solveDoubt(message, history || [], syllabusScope || '');

      socket.emit('receive_message', {
        id: 'msg-' + Date.now(),
        sender: 'bob',
        text: bobResponse,
        timestamp: new Date()
      });
    } catch (err) {
      socket.emit('receive_message', {
        id: 'msg-err-' + Date.now(),
        sender: 'bob',
        text: 'I encountered an error processing your query. Please try asking again.',
        timestamp: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 EduFlow AI Backend Server running on port ${PORT}`);
  console.log(`⚡ IBM BOB watsonx.ai Engine: ${bobService.isConfigured() ? 'LIVE API KEY CONNECTED' : 'OFFLINE DEMO MODE (Smart Engine active)'}`);
  console.log(`==================================================`);
});

module.exports = app;
