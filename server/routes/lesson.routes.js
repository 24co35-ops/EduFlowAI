const express = require('express');
const router = express.Router();
const multer = require('multer');
const lessonController = require('../controllers/lessonController');
const { protect, requireRole } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/generate', protect, upload.single('syllabus'), lessonController.generateLessonPlan);
router.post('/translate', protect, lessonController.translateLessonPlan);
router.get('/', protect, lessonController.getLessons);
router.get('/:id', protect, lessonController.getLessonById);

module.exports = router;
