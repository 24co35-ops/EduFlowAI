const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const quizController = require('../controllers/quizController');
const { protect, requireRole } = require('../middleware/auth');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI generation requests. Please wait 15 minutes before trying again.' }
});

router.post('/generate', protect, requireRole('teacher'), aiLimiter, quizController.generateQuiz);
router.post('/regenerate-question', protect, requireRole('teacher'), aiLimiter, quizController.regenerateQuestion);
router.post('/grade', protect, requireRole('student'), quizController.gradeAttempt);
router.get('/', protect, quizController.getQuizzes);
router.get('/attempts', protect, quizController.getAttempts);
router.get('/:id', protect, quizController.getQuizById);
router.put('/:id', protect, requireRole('teacher'), quizController.updateQuiz);
router.delete('/:id', protect, requireRole('teacher'), quizController.deleteQuiz);

module.exports = router;
