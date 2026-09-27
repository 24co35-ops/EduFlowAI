const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const studentController = require('../controllers/studentController');
const { protect, requireRole } = require('../middleware/auth');

// ponytail: same multer config as lesson.routes.js — reuse, don't abstract
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI generation requests. Please wait 15 minutes before trying again.' }
});

router.post('/flashcards/generate', protect, aiLimiter, upload.single('file'), studentController.generateFlashcards);
router.get('/flashcards', protect, studentController.getFlashcards);
router.get('/progress', protect, requireRole('student'), studentController.getStudentProgress);
router.get('/analytics', protect, requireRole('teacher'), studentController.getTeacherAnalytics);
router.post('/doubt', protect, aiLimiter, studentController.solveDoubt);
router.post('/remediation', protect, aiLimiter, studentController.generateRemediation);

module.exports = router;

