const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const studentController = require('../controllers/studentController');
const { protect, requireRole } = require('../middleware/auth');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI generation requests. Please wait 15 minutes before trying again.' }
});

router.post('/flashcards/generate', protect, aiLimiter, studentController.generateFlashcards);
router.get('/flashcards', protect, studentController.getFlashcards);
router.get('/progress', protect, requireRole('student'), studentController.getStudentProgress);
router.get('/analytics', protect, requireRole('teacher'), studentController.getTeacherAnalytics);
router.post('/doubt', protect, aiLimiter, studentController.solveDoubt);
router.post('/remediation', protect, aiLimiter, studentController.generateRemediation);

module.exports = router;
