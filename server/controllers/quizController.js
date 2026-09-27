const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bobService = require('../services/bob.service');

const dbErr = (res, err) =>
  res.status(500).json({ success: false, message: err.message || 'Database error.' });

const noDb = (res) =>
  res.status(503).json({ success: false, message: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.' });

const normalizeQuiz = (q) => q ? ({
  ...q,
  _id: q.id,
  teacherId: q.teacher_id,
  assignedGrade: q.assigned_grade,
  createdAt: q.created_at
}) : q;

const normalizeAttempt = (a) => a ? ({
  ...a,
  _id: a.id,
  studentId: a.student_id,
  studentName: a.student_name,
  quizId: a.quiz_id,
  totalScore: a.total_score,
  maxScore: a.max_score,
  createdAt: a.created_at
}) : a;

exports.normalizeQuiz = normalizeQuiz;
exports.normalizeAttempt = normalizeAttempt;

exports.generateQuiz = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { topic, difficulty = 'medium', questionCount = 4, assignedGrade = 'Class 10' } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Quiz topic is required' });
    }

    // Call IBM BOB / AI engine
    const questions = await bobService.generateQuiz(topic, difficulty, questionCount, assignedGrade);
    const userId = req.user.id;

    const { data, error } = await supabase.from('quizzes').insert({
      teacher_id: userId,
      topic: topic.trim(),
      difficulty,
      status: 'published',
      assigned_grade: assignedGrade,
      questions: questions || []
    }).select().single();

    if (error) return dbErr(res, error);
    return res.status(201).json({ success: true, quiz: normalizeQuiz(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { id } = req.params;
    const { topic, difficulty, questions, status, assignedGrade } = req.body;
    const userId = req.user.id;

    // Fetch existing quiz to verify ownership
    const { data: existing, error: fetchErr } = await supabase.from('quizzes').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (existing.teacher_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this quiz' });
    }

    const updates = {};
    if (topic !== undefined) updates.topic = topic;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (questions !== undefined) updates.questions = questions;
    if (status !== undefined) updates.status = status;
    if (assignedGrade !== undefined) updates.assigned_grade = assignedGrade;

    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return dbErr(res, error);
    return res.json({ success: true, quiz: normalizeQuiz(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.regenerateQuestion = async (req, res) => {
  try {
    const { topic, difficulty = 'medium', type = 'mcq' } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

    const newQuestions = await bobService.generateQuiz(topic, difficulty, 2);
    const selected = (newQuestions && newQuestions.find(q => q.type === type)) || (newQuestions && newQuestions[0]);

    return res.json({
      success: true,
      question: selected
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existing, error: fetchErr } = await supabase.from('quizzes').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (existing.teacher_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this quiz' });
    }

    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) return dbErr(res, error);

    return res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const userId = req.user.id;
    let query = supabase.from('quizzes').select('*').order('created_at', { ascending: false });

    if (req.user.role === 'teacher') {
      query = query.eq('teacher_id', userId);
    } else {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) return dbErr(res, error);
    return res.json({ success: true, quizzes: (data || []).map(normalizeQuiz) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const userId = req.user.id;
    if (req.user.role === 'teacher' && data.teacher_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this quiz' });
    }

    return res.json({ success: true, quiz: normalizeQuiz(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.gradeAttempt = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { quizId, answers } = req.body;
    if (!quizId) return res.status(400).json({ success: false, message: 'Quiz ID is required' });

    const { data: quiz, error: quizErr } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
    if (quizErr || !quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for grading' });
    }

    const questions = quiz.questions || [];
    let totalScore = 0;
    const maxScore = Math.max(questions.length * 5, 5);
    const gradedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const studentAns = answers && answers[i] !== undefined ? answers[i] : '';

      if (q.type === 'mcq' || q.type === 'truefalse') {
        const isMatch = String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        const score = isMatch ? 5 : 0;
        totalScore += score;
        gradedAnswers.push({
          questionIndex: i,
          questionText: q.question,
          userAnswer: String(studentAns),
          correctAnswer: q.correctAnswer,
          isCorrect: isMatch,
          score,
          feedback: isMatch ? 'Correct! High performance.' : `Incorrect. Correct answer is: ${q.correctAnswer}`
        });
      } else {
        // Short answer auto-graded via IBM Granite NLP
        const bobGrading = await bobService.autoGradeAnswer(q.question, q.correctAnswer, String(studentAns));
        const score = bobGrading.score !== undefined ? bobGrading.score : 3;
        totalScore += score;
        gradedAnswers.push({
          questionIndex: i,
          questionText: q.question,
          userAnswer: String(studentAns),
          correctAnswer: q.correctAnswer,
          isCorrect: score >= 3,
          score,
          feedback: `[IBM Granite NLP Feedback]: ${bobGrading.feedback || 'Evaluated'}`
        });
      }
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const userId = req.user.id;

    const { data: savedAttempt, error: attemptErr } = await supabase.from('attempts').insert({
      student_id: userId,
      student_name: req.user.name || 'Student',
      quiz_id: quiz.id,
      topic: quiz.topic,
      answers: gradedAnswers,
      total_score: totalScore,
      max_score: maxScore,
      percentage
    }).select().single();

    if (attemptErr) return dbErr(res, attemptErr);
    return res.status(201).json({ success: true, attempt: normalizeAttempt(savedAttempt) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttempts = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const userId = req.user.id;

    if (req.user.role === 'student') {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });
      if (error) return dbErr(res, error);
      return res.json({ success: true, attempts: (data || []).map(normalizeAttempt) });
    }

    // Teacher: only see attempts for quizzes they created
    const { data: teacherQuizzes, error: qErr } = await supabase
      .from('quizzes')
      .select('id')
      .eq('teacher_id', userId);

    if (qErr) return dbErr(res, qErr);

    const quizIds = (teacherQuizzes || []).map(q => q.id);
    if (quizIds.length === 0) {
      return res.json({ success: true, attempts: [] });
    }

    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .in('quiz_id', quizIds)
      .order('created_at', { ascending: false });

    if (error) return dbErr(res, error);
    return res.json({ success: true, attempts: (data || []).map(normalizeAttempt) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
