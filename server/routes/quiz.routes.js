const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, quizController.generateQuiz);
router.post('/grade', protect, quizController.gradeAttempt);
router.get('/', protect, quizController.getQuizzes);
router.get('/attempts', protect, quizController.getAttempts);
router.get('/:id', protect, quizController.getQuizById);

module.exports = router;
