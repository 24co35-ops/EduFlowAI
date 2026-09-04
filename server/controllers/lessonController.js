const Lesson = require('../models/Lesson');
const bobService = require('../services/bob.service');
const { extractTextFromBuffer } = require('../utils/pdfParser');
const { getIsConnected } = require('../config/db');

// In-memory store for fallback demo mode
const memoryLessons = [
  {
    _id: 'lesson-demo-1',
    teacherId: 'demo-teacher-1',
    subject: 'Class 10 Physics — Motion & Electricity',
    syllabusFileName: 'physics_class10_syllabus.pdf',
    syllabusText: 'Chapter 1: Electric Current, Potential Difference, Ohm Law, Resistance in series and parallel. Chapter 2: Magnetic Effects of Current.',
    overview: 'Comprehensive 5-day structured plan powered by IBM BOB Granite 13B.',
    plan: [
      {
        day: 1,
        topic: 'Electric Current & Potential Difference',
        duration: '45 mins',
        activities: ['Interactive lecture on electron flow', 'Real-life circuit demonstration'],
        objectives: ['Define electric current & unit (Ampere)', 'Calculate potential difference V = W/Q']
      },
      {
        day: 2,
        topic: 'Ohm Law & Resistance Factors',
        duration: '50 mins',
        activities: ['Laboratory V-I graph plotting exercise', 'Group problem solving'],
        objectives: ['State Ohm Law', 'Analyze resistivity variables (length, area)']
      },
      {
        day: 3,
        topic: 'Resistors in Series and Parallel',
        duration: '45 mins',
        activities: ['Equivalent resistance calculation workshop', 'Breadboard circuit building'],
        objectives: ['Derive R_total = R1 + R2', 'Analyze parallel voltage distribution']
      },
      {
        day: 4,
        topic: 'Heating Effects of Electric Current',
        duration: '45 mins',
        activities: ['Joule Law of heating video case study', 'Safety fuse discussion'],
        objectives: ['Understand H = I²Rt formula', 'Evaluate household electrical safety']
      },
      {
        day: 5,
        topic: 'Weekly Assessment & Magnetic Effects Intro',
        duration: '60 mins',
        activities: ['Formative MCQ Quiz', 'Right Hand Thumb Rule demonstration'],
        objectives: ['Evaluate weekly mastery', 'Introduce magnetic field lines']
      }
    ],
    language: 'en',
    createdAt: new Date()
  }
];

exports.generateLessonPlan = async (req, res) => {
  try {
    let syllabusText = req.body.syllabusText || '';
    const subject = req.body.subject || 'General Science';
    const language = req.body.language || 'en';
    let filename = '';

    if (req.file) {
      filename = req.file.originalname;
      const extracted = await extractTextFromBuffer(req.file.buffer, filename);
      if (extracted && extracted.trim().length > 0) {
        syllabusText = extracted;
      }
    }

    if (!syllabusText || syllabusText.trim().length === 0) {
      syllabusText = 'Standard Science Curriculum Syllabus: Fundamentals, Theories, Experiments, and Final Evaluation.';
    }

    // Call IBM BOB AI engine
    const bobResult = await bobService.generateLessonPlan(syllabusText, subject, language);

    const userId = req.user.id || req.user._id;
    const lessonData = {
      teacherId: userId,
      subject: bobResult.subject || subject,
      syllabusFileName: filename,
      syllabusText: syllabusText.slice(0, 1000),
      overview: bobResult.overview || 'Structured IBM BOB Generated Plan',
      plan: bobResult.plan || [],
      language: language
    };

    if (getIsConnected()) {
      const savedLesson = await Lesson.create(lessonData);
      return res.status(201).json({ success: true, lesson: savedLesson });
    }

    // Fallback store
    const memLesson = { _id: 'lesson-' + Date.now(), ...lessonData, createdAt: new Date() };
    memoryLessons.unshift(memLesson);
    return res.status(201).json({ success: true, lesson: memLesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.translateLessonPlan = async (req, res) => {
  try {
    const { lessonId, targetLang } = req.body;
    let lesson = null;

    if (getIsConnected()) {
      lesson = await Lesson.findById(lessonId);
    } else {
      lesson = memoryLessons.find(l => l._id === lessonId);
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }

    // ponytail: enforce ownership check before translation
    const userId = req.user.id || req.user._id;
    if (String(lesson.teacherId) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this lesson plan' });
    }

    // Perform IBM BOB translation for overview and activities
    const textToTranslate = JSON.stringify({
      overview: lesson.overview,
      topics: lesson.plan.map(p => p.topic)
    });

    const translatedText = await bobService.translateText(textToTranslate, targetLang || 'hi');

    return res.json({
      success: true,
      translatedContent: translatedText,
      targetLanguage: targetLang
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLessons = async (req, res) => {
  try {
    // ponytail: filter by teacherId so educators only see their own lessons
    const userId = req.user.id || req.user._id;
    const filter = req.user.role === 'teacher' ? { teacherId: userId } : {};

    if (getIsConnected()) {
      const lessons = await Lesson.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, lessons });
    }
    const lessons = req.user.role === 'teacher' 
      ? memoryLessons.filter(l => String(l.teacherId) === String(userId))
      : memoryLessons;
    return res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    let lesson = null;
    if (getIsConnected()) {
      lesson = await Lesson.findById(id);
    } else {
      lesson = memoryLessons.find(l => l._id === id);
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }

    // ponytail: prevent teachers from accessing other teachers' lesson plans
    const userId = req.user.id || req.user._id;
    if (req.user.role === 'teacher' && String(lesson.teacherId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this lesson plan' });
    }

    return res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

