const interventionService = require('../services/intervention.service');

exports.getActionCenter = async (req, res) => {
  try {
    const data = interventionService.getActionCenterData(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[InterventionController] getActionCenter error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignIntervention = async (req, res) => {
  try {
    const { conceptId, studentIds, topic, customNotes } = req.body;
    if (!conceptId) {
      return res.status(400).json({ success: false, message: 'conceptId is required to assign intervention.' });
    }

    const created = interventionService.assignIntervention({
      teacherId: req.user.id,
      conceptId,
      studentIds: studentIds || [],
      topic,
      customNotes
    });

    res.status(201).json({
      success: true,
      message: `Intervention assigned to ${created.length} student(s).`,
      interventions: created
    });
  } catch (err) {
    console.error('[InterventionController] assignIntervention error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNextBestAction = async (req, res) => {
  try {
    const studentId = req.user.id;
    const nextAction = interventionService.getStudentNextBestAction(studentId);
    res.json({ success: true, nextAction });
  } catch (err) {
    console.error('[InterventionController] getNextBestAction error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMasteryCheckQuestions = async (req, res) => {
  try {
    const conceptId = req.query.conceptId || req.query.concept || 'concept-parallel-resistance';
    const questions = interventionService.generateMasteryCheckQuestions(conceptId);
    res.json({ success: true, questions });
  } catch (err) {
    console.error('[InterventionController] getMasteryCheckQuestions error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitMasteryCheck = async (req, res) => {
  try {
    const { interventionId, answers, questions } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required.' });
    }

    const evaluation = interventionService.evaluateMasteryCheck({
      interventionId,
      studentId: req.user.id,
      studentName: req.user.name || 'Student',
      answers,
      questions: questions || []
    });

    res.json({
      success: true,
      result: evaluation
    });
  } catch (err) {
    console.error('[InterventionController] submitMasteryCheck error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyInterventions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const list = req.user.role === 'teacher'
      ? interventionService.getInterventionsForTeacher(studentId)
      : interventionService.getInterventionsForStudent(studentId);
    res.json({ success: true, interventions: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportLmsRoster = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const all = interventionService.getAllInterventions();
    
    if (format === 'csv') {
      const headers = ['Intervention ID', 'Student Name', 'Concept Name', 'Status', 'Pre-Mastery (%)', 'Post-Mastery (%)', 'Delta', 'Assigned At'];
      const rows = all.map(i => [
        i.id,
        `"${i.studentName || 'Student'}"`,
        `"${i.conceptName}"`,
        i.status,
        i.preMasteryScore,
        i.postMasteryScore !== null ? i.postMasteryScore : 'N/A',
        i.masteryDelta !== null ? i.masteryDelta : 'N/A',
        i.assignedAt
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="eduflow-interventions-oneroster.csv"');
      return res.send(csvContent);
    }

    // JSON export formatted for OneRoster / Canvas / Google Classroom LMS
    return res.json({
      success: true,
      standard: 'OneRoster-v1.2-Compatible',
      exportedAt: new Date().toISOString(),
      institution: req.user.institution || 'EduFlow Academy',
      totalRecords: all.length,
      records: all.map(i => ({
        sourcedId: i.id,
        status: i.status === 'completed' ? 'active' : 'pending',
        userSourcedId: i.studentId,
        userName: i.studentName,
        courseSourcedId: 'class-10-science',
        academicSession: '2026-Semester-1',
        learningObjective: i.conceptName,
        scorePreIntervention: i.preMasteryScore,
        scorePostIntervention: i.postMasteryScore,
        scoreDelta: i.masteryDelta,
        misconceptionAlert: i.misconception
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
