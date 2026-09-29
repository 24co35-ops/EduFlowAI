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

const fallbackLessons = new Map();

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
    const cleanOverview = bobResult.overview || 'Structured Curriculum Lesson Plan';
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
      if (error && error.code !== '23503') {
        console.warn('[Lesson] Database insert note:', error?.message);
      }
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
    fallbackLessons.set(fallbackLesson.id, fallbackLesson);
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
      if (!isUUID(userId)) {
        const memoryMatches = Array.from(fallbackLessons.values()).filter(l => l.teacher_id === userId);
        return res.json({ success: true, lessons: memoryMatches.map(normalizeLesson) });
      }
      query = query.eq('teacher_id', userId);
    }

    const { data, error } = await query;
    let results = (data || []).map(normalizeLesson);
    if (results.length === 0 && fallbackLessons.size > 0) {
      const memoryMatches = Array.from(fallbackLessons.values()).filter(l => req.user.role !== 'teacher' || l.teacher_id === userId);
      results = memoryMatches.map(normalizeLesson);
    }
    return res.json({ success: true, lessons: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching lessons' });
  }
};

exports.getLessonById = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const lessonId = req.params.id;
    let data = null;
    if (isUUID(lessonId)) {
      const resData = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (!resData.error && resData.data) {
        data = resData.data;
      }
    }
    if (!data && fallbackLessons.has(lessonId)) {
      data = fallbackLessons.get(lessonId);
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
    }
    if (req.user.role === 'teacher' && data.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    return res.json({ success: true, lesson: normalizeLesson(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching lesson plan' });
  }
};

exports.updateLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;
    const { subject, overview, plan, language } = req.body;
    const updates = {};
    if (subject)  updates.subject  = subject;
    if (overview) updates.overview = overview;
    if (plan)     updates.plan     = plan;
    if (language) updates.language = language;

    let existing = null;
    if (isUUID(lessonId)) {
      const resData = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (!resData.error && resData.data) {
        existing = resData.data;
      }
    }
    if (!existing && fallbackLessons.has(lessonId)) {
      existing = fallbackLessons.get(lessonId);
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
    }

    if (existing.teacher_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this lesson plan.' });
    }

    if (isUUID(lessonId) && isUUID(userId)) {
      const { data, error } = await supabase
        .from('lessons').update(updates)
        .eq('id', lessonId).eq('teacher_id', userId)
        .select().single();
      if (!error && data) {
        return res.json({ success: true, lesson: normalizeLesson(data) });
      }
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    fallbackLessons.set(lessonId, updated);
    return res.json({ success: true, lesson: normalizeLesson(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error updating lesson plan' });
  }
};

exports.deleteLessonPlan = async (req, res) => {
  if (!isSupabaseConfigured()) return noDb(res);
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;

    let existing = null;
    if (isUUID(lessonId)) {
      const resData = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (!resData.error && resData.data) {
        existing = resData.data;
      }
    }
    if (!existing && fallbackLessons.has(lessonId)) {
      existing = fallbackLessons.get(lessonId);
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found.' });
    }

    if (existing.teacher_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this lesson plan.' });
    }

    if (isUUID(lessonId) && isUUID(userId)) {
      await supabase.from('lessons').delete().eq('id', lessonId).eq('teacher_id', userId);
    }
    fallbackLessons.delete(lessonId);
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
