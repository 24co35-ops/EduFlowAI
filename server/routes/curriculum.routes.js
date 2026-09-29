const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');
const { protect } = require('../middleware/auth');

router.get('/', protect, curriculumController.getCurriculum);
router.get('/concepts', protect, curriculumController.getConcepts);
router.get('/concept/:id', protect, curriculumController.getConceptById);

module.exports = router;
