const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.post('/flashcards/generate', protect, studentController.generateFlashcards);
router.get('/flashcards', protect, studentController.getFlashcards);
router.get('/progress', protect, studentController.getStudentProgress);
router.get('/analytics', protect, studentController.getTeacherAnalytics);

module.exports = router;
