const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const lessonController = require('../controllers/lessonController');
const { protect, requireRole } = require('../middleware/auth');

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

router.post('/generate', protect, requireRole('teacher'), aiLimiter, upload.single('syllabus'), lessonController.generateLessonPlan);
router.post('/translate', protect, requireRole('teacher'), lessonController.translateLessonPlan);
router.get('/', protect, lessonController.getLessons);
router.get('/:id', protect, lessonController.getLessonById);
router.put('/:id', protect, requireRole('teacher'), lessonController.updateLessonPlan);
router.delete('/:id', protect, requireRole('teacher'), lessonController.deleteLessonPlan);

module.exports = router;
