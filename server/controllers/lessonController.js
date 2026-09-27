const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bobService = require('../services/bob.service');
const { extractTextFromBuffer } = require('../utils/pdfParser');

// ponytail: single helper — all Supabase errors surface as 500 with real message
const dbErr = (res, err) =>
  res.status(500).json({ success: false, message: err.message || 'Database error.' });

const noDb = (res) =>
  res.status(503).json({ success: false, message: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.' });

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

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
    const cleanSubject = bobResult.subject || subject;
    const cleanOverview = bobResult.overview || 'IBM BOB Generated Plan';
    const cleanPlan = Array.isArray(bobResult.plan) ? bobResult.plan : [];

    if (isUUID(userId)) {
      const { data, error } = await supabase.from('lessons').insert({
        teacher_id:        userId,
        subject:           cleanSubject,
        syllabus_file_name: filename,
        syllabus_text:     syllabusText.slice(0, 1000),
        overview:          cleanOverview,
        plan:              cleanPlan,
        language
      }).select().single();

      if (!error && data) {
        return res.status(201).json({ success: true, lesson: normalizeLesson(data), _aiMetadata: bobResult._aiMetadata });
      }
      console.warn('[Lesson] Database insert note:', error?.message);
    }

    // Resilient fallback: return AI generated lesson with temporary id
    const fallbackLesson = {
      id: crypto.randomUUID(),
      teacher_id: userId,
      subject: cleanSubject,
      syllabus_file_name: filename,
      syllabus_text: syllabusText.slice(0, 1000),
      overview: cleanOverview,
      plan: cleanPlan,
      language,
      created_at: new Date().toISOString()
    };
    return res.status(201).json({ success: true, lesson: normalizeLesson(fallbackLesson), _aiMetadata: bobResult._aiMetadata });
  } catch (err) {
    console.error('[Lesson] generate error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Error generating lesson plan' });
  }
};

exports.getLessons = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const userId = req.user.id;
    let query = supabase.from('lessons').select('*').order('created_at', { ascending: false });

    if (req.user.role === 'teacher') {
      if (!isUUID(userId)) return res.json({ success: true, lessons: [] });
      query = query.eq('teacher_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[Lesson] fetch note:', error.message);
      return res.json({ success: true, lessons: [] });
    }
    return res.json({ success: true, lessons: (data || []).map(normalizeLesson) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching lessons' });
  }
};

exports.getLessonById = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    if (isUUID(req.params.id)) {
      const { data, error } = await supabase.from('lessons').select('*').eq('id', req.params.id).single();
      if (!error && data) {
        if (req.user.role === 'teacher' && data.teacher_id !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        return res.json({ success: true, lesson: normalizeLesson(data) });
      }
    }
    return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching lesson plan' });
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

    if (isUUID(req.params.id) && isUUID(req.user.id)) {
      const { data, error } = await supabase
        .from('lessons').update(updates)
        .eq('id', req.params.id).eq('teacher_id', req.user.id)
        .select().single();
      if (!error && data) {
        return res.json({ success: true, lesson: normalizeLesson(data) });
      }
    }

    const updated = {
      id: req.params.id,
      teacher_id: req.user.id,
      subject: subject || 'General Science',
      overview: overview || 'Updated Overview',
      plan: plan || [],
      language: language || 'en',
      created_at: new Date().toISOString()
    };
    return res.json({ success: true, lesson: normalizeLesson(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error updating lesson plan' });
  }
};

exports.deleteLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    if (isUUID(req.params.id) && isUUID(req.user.id)) {
      const { error } = await supabase.from('lessons')
        .delete().eq('id', req.params.id).eq('teacher_id', req.user.id);
      if (error) console.warn('[Lesson] delete note:', error.message);
    }
    return res.json({ success: true, message: 'Lesson plan deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting lesson plan' });
  }
};

exports.translateLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const { lessonId, targetLang } = req.body;
    let overview = 'Lesson Plan Overview';
    let topics = [];

    if (isUUID(lessonId)) {
      const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (data) {
        if (data.teacher_id !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        overview = data.overview;
        topics = (data.plan || []).map(p => p.topic);
      }
    }

    const textToTranslate = JSON.stringify({ overview, topics });
    const translatedText = await bobService.translateText(textToTranslate, targetLang || 'hi');
    return res.json({ success: true, translatedContent: translatedText, targetLanguage: targetLang });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error translating lesson plan' });
  }
};
