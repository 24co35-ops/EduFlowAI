const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect, requireRole } = require('../middleware/auth');

// ponytail: teacher builds quizzes, student submits/grades attempts
router.post('/generate', protect, requireRole('teacher'), quizController.generateQuiz);
router.post('/grade', protect, requireRole('student'), quizController.gradeAttempt);
router.get('/', protect, quizController.getQuizzes);
router.get('/attempts', protect, quizController.getAttempts);
router.get('/:id', protect, quizController.getQuizById);

module.exports = router;
