const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/action-center', protect, requireRole('teacher'), interventionController.getActionCenter);
router.post('/assign', protect, requireRole('teacher'), interventionController.assignIntervention);
router.get('/next-best-action', protect, requireRole('student'), interventionController.getNextBestAction);
router.get('/mastery-check/questions', protect, interventionController.getMasteryCheckQuestions);
router.post('/mastery-check/submit', protect, requireRole('student'), interventionController.submitMasteryCheck);
router.get('/my', protect, interventionController.getMyInterventions);
router.get('/export', protect, requireRole('teacher'), interventionController.exportLmsRoster);

module.exports = router;
