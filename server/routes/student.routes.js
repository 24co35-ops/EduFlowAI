const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, requireRole } = require('../middleware/auth');

// ponytail: teacher analytics restricted to teacher role; flashcards and progress to student
router.post('/flashcards/generate', protect, requireRole('student'), studentController.generateFlashcards);
router.get('/flashcards', protect, requireRole('student'), studentController.getFlashcards);
router.get('/progress', protect, requireRole('student'), studentController.getStudentProgress);
router.get('/analytics', protect, requireRole('teacher'), studentController.getTeacherAnalytics);
router.post('/doubt', protect, studentController.solveDoubt);

module.exports = router;
