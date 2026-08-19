const Flashcard = require('../models/Flashcard');
const Attempt = require('../models/Attempt');
const bobService = require('../services/bob.service');
const { getIsConnected } = require('../config/db');

// Memory store fallback
const memoryFlashcards = [
  {
    _id: 'flashcard-demo-1',
    studentId: 'demo-student-1',
    title: 'Photosynthesis Core Concepts',
    summary: '• Light reactions produce ATP & NADPH in thylakoid membranes.\n• Calvin Cycle utilizes carbon dioxide to synthesize glucose.\n• Chlorophyll reflects green wavelengths while absorbing red and blue light.',
    cards: [
      { front: 'Light Reaction Site', back: 'Thylakoid membrane inside chloroplasts.' },
      { front: 'Dark Reaction / Calvin Cycle Site', back: 'Stroma of chloroplasts.' },
      { front: 'Primary Pigment', back: 'Chlorophyll a and Chlorophyll b.' },
      { front: 'Key Output Molecule', back: 'Glucose (C₆H₁₂O₆).' }
    ],
    createdAt: new Date()
  }
];

exports.generateFlashcards = async (req, res) => {
  try {
    const { text, title = 'Study Deck' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Chapter text is required to generate flashcards' });
    }

    const bobDeck = await bobService.generateFlashcards(text, title);

    const flashcardData = {
      studentId: req.user ? (req.user.id || req.user._id) : 'demo-student-1',
      title: bobDeck.title || title,
      summary: bobDeck.summary || '',
      cards: bobDeck.cards || []
    };

    if (getIsConnected()) {
      const savedDeck = await Flashcard.create(flashcardData);
      return res.status(201).json({ success: true, deck: savedDeck });
    }

    const memDeck = { _id: 'deck-' + Date.now(), ...flashcardData, createdAt: new Date() };
    memoryFlashcards.unshift(memDeck);
    return res.status(201).json({ success: true, deck: memDeck });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    if (getIsConnected()) {
      const decks = await Flashcard.find().sort({ createdAt: -1 });
      return res.json({ success: true, decks });
    }
    return res.json({ success: true, decks: memoryFlashcards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user ? (req.user.id || req.user._id) : 'demo-student-1';
    let attempts = [];

    if (getIsConnected()) {
      attempts = await Attempt.find({ studentId }).sort({ createdAt: -1 });
    }

    if (attempts.length === 0) {
      // Default demo stats
      attempts = [
        { topic: 'Photosynthesis & Plant Energy', percentage: 90, createdAt: new Date(Date.now() - 86400000 * 3) },
        { topic: 'Ohm Law & Electric Circuits', percentage: 85, createdAt: new Date(Date.now() - 86400000 * 2) },
        { topic: 'Chemical Reactions & Equations', percentage: 70, createdAt: new Date(Date.now() - 86400000 * 1) }
      ];
    }

    const averageScore = Math.round(
      attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / attempts.length
    );

    const weakTopics = attempts
      .filter(a => (a.percentage || 0) < 80)
      .map(a => a.topic);

    return res.json({
      success: true,
      summary: {
        totalQuizzesTaken: attempts.length,
        averageScore,
        currentStreakDays: 5,
        weakTopics: weakTopics.length > 0 ? Array.from(new Set(weakTopics)) : ['Chemical Reactions Balancing'],
        recentAttempts: attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeacherAnalytics = async (req, res) => {
  try {
    return res.json({
      success: true,
      analytics: {
        totalStudents: 42,
        quizzesCompleted: 128,
        classAverageScore: 84.5,
        timeSavedHoursThisWeek: 14.2,
        topicPerformance: [
          { topic: 'Electric Current & Ohm Law', avgScore: 88, difficulty: 'Easy' },
          { topic: 'Photosynthesis & Calvin Cycle', avgScore: 82, difficulty: 'Medium' },
          { topic: 'Chemical Balancing & Stoichiometry', avgScore: 68, difficulty: 'Hard' },
          { topic: 'Magnetic Effects of Current', avgScore: 74, difficulty: 'Hard' }
        ],
        weakTopicAlerts: [
          { topic: 'Chemical Balancing & Stoichiometry', failureRate: '32%', recommendation: 'IBM BOB recommended a 15-minute diagnostic recap session.' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
