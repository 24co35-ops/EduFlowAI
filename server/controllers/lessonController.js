const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bobService = require('../services/bob.service');
const { extractTextFromBuffer } = require('../utils/pdfParser');

// ponytail: single helper — all Supabase errors surface as 500 with real message
const dbErr = (res, err) =>
  res.status(500).json({ success: false, message: err.message || 'Database error.' });

const noDb = (res) =>
  res.status(503).json({ success: false, message: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.' });

const normalizeLesson = (l) => l ? ({
  ...l,
  _id: l.id,
  teacherId: l.teacher_id,
  syllabusFileName: l.syllabus_file_name,
  syllabusText: l.syllabus_text,
  createdAt: l.created_at
}) : l;

exports.generateLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    let syllabusText = req.body.syllabusText || '';
    const subject = req.body.subject || 'General Science';
    const language = req.body.language || 'en';
    let filename = '';

    if (req.file) {
      filename = req.file.originalname;
      const extracted = await extractTextFromBuffer(req.file.buffer, filename);
      if (extracted?.trim().length > 0) syllabusText = extracted;
    }
    if (!syllabusText.trim()) {
      syllabusText = 'Standard Science Curriculum Syllabus: Fundamentals, Theories, Experiments, and Final Evaluation.';
    }

    const bobResult = await bobService.generateLessonPlan(syllabusText, subject, language);
    const userId = req.user.id;

    const { data, error } = await supabase.from('lessons').insert({
      teacher_id:        userId,
      subject:           bobResult.subject || subject,
      syllabus_file_name: filename,
      syllabus_text:     syllabusText.slice(0, 1000),
      overview:          bobResult.overview || 'IBM BOB Generated Plan',
      plan:              bobResult.plan || [],
      language
    }).select().single();

    if (error) return dbErr(res, error);
    return res.status(201).json({ success: true, lesson: normalizeLesson(data), _aiMetadata: bobResult._aiMetadata });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLessons = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const userId = req.user.id;
    let query = supabase.from('lessons').select('*').order('created_at', { ascending: false });
    if (req.user.role === 'teacher') query = query.eq('teacher_id', userId);
    const { data, error } = await query;
    if (error) return dbErr(res, error);
    return res.json({ success: true, lessons: (data || []).map(normalizeLesson) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLessonById = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { data, error } = await supabase.from('lessons').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
    if (req.user.role === 'teacher' && data.teacher_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Access denied.' });
    return res.json({ success: true, lesson: normalizeLesson(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { subject, overview, plan, language } = req.body;
    const updates = {};
    if (subject)  updates.subject  = subject;
    if (overview) updates.overview = overview;
    if (plan)     updates.plan     = plan;
    if (language) updates.language = language;

    const { data, error } = await supabase
      .from('lessons').update(updates)
      .eq('id', req.params.id).eq('teacher_id', req.user.id)
      .select().single();
    if (error) return dbErr(res, error);
    if (!data) return res.status(404).json({ success: false, message: 'Lesson not found or access denied.' });
    return res.json({ success: true, lesson: normalizeLesson(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { error } = await supabase.from('lessons')
      .delete().eq('id', req.params.id).eq('teacher_id', req.user.id);
    if (error) return dbErr(res, error);
    return res.json({ success: true, message: 'Lesson plan deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.translateLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { lessonId, targetLang } = req.body;
    const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
    if (data.teacher_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const textToTranslate = JSON.stringify({ overview: data.overview, topics: (data.plan || []).map(p => p.topic) });
    const translatedText = await bobService.translateText(textToTranslate, targetLang || 'hi');
    return res.json({ success: true, translatedContent: translatedText, targetLanguage: targetLang });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
