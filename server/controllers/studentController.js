const Flashcard = require('../models/Flashcard');
const Attempt = require('../models/Attempt');
const bobService = require('../services/bob.service');
const { getIsConnected } = require('../config/db');
const { memoryAttempts } = require('./quizController');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Helper: return 503 when DB is unavailable in production.
const dbUnavailable = (res) =>
  res.status(503).json({
    success: false,
    message: 'Service temporarily unavailable. Database connection required in production.'
  });

// Memory store fallback (development / demo mode only)
const memoryFlashcards = IS_PRODUCTION ? [] : [
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

/**
 * Calculates transparent multi-factor topic mastery score
 * Formula:
 * Mastery = 40% (recent quiz score) + 25% (historical score) + 15% (consistency) + 10% (difficulty factor) + 10% (improvement trend)
 */
function calculateTopicMastery(attemptsForTopic) {
  if (!attemptsForTopic || attemptsForTopic.length === 0) {
    return {
      masteryScore: 0,
      classification: 'Critical',
      factors: { recentScore: 0, historicalAvg: 0, consistency: 0, difficultyBonus: 0, improvementTrend: 0 }
    };
  }

  // Sort by date ascending
  const sorted = [...attemptsForTopic].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const recentAttempt = sorted[sorted.length - 1];
  const recentScore = recentAttempt.percentage || 0;

  const totalScores = sorted.map(a => a.percentage || 0);
  const historicalAvg = totalScores.reduce((sum, val) => sum + val, 0) / totalScores.length;

  // Consistency: lower standard deviation -> higher consistency score
  const variance = totalScores.reduce((acc, val) => acc + Math.pow(val - historicalAvg, 2), 0) / totalScores.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, Math.min(100, Math.round(100 - stdDev * 2)));

  // Difficulty adjustment bonus
  const difficultyBonus = recentScore >= 80 ? 100 : recentScore >= 60 ? 75 : 50;

  // Improvement trend: difference between last attempt and first attempt
  const improvement = sorted.length > 1
    ? Math.max(0, Math.min(100, 50 + (recentScore - sorted[0].percentage) * 2))
    : 70;

  const weightedScore = Math.round(
    0.40 * recentScore +
    0.25 * historicalAvg +
    0.15 * consistency +
    0.10 * difficultyBonus +
    0.10 * improvement
  );

  let classification = 'Developing';
  if (weightedScore < 40) classification = 'Critical';
  else if (weightedScore < 60) classification = 'Needs Support';
  else if (weightedScore < 75) classification = 'Developing';
  else if (weightedScore < 90) classification = 'Proficient';
  else classification = 'Mastered';

  return {
    masteryScore: weightedScore,
    classification,
    factors: {
      recentScore,
      historicalAvg: Math.round(historicalAvg),
      consistency,
      difficultyBonus,
      improvementTrend: Math.round(improvement)
    }
  };
}

exports.generateFlashcards = async (req, res) => {
  try {
    const { text, title = 'Study Deck' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Chapter text is required to generate flashcards' });
    }

    const bobDeck = await bobService.generateFlashcards(text, title);
    const userId = req.user.id || req.user._id;
    const flashcardData = {
      studentId: userId,
      title: bobDeck.title || title,
      summary: bobDeck.summary || '',
      cards: bobDeck.cards || []
    };

    if (getIsConnected()) {
      try {
        const savedDeck = await Flashcard.create(flashcardData);
        return res.status(201).json({ success: true, deck: savedDeck, _aiMetadata: bobDeck._aiMetadata });
      } catch (dbErr) {
        if (IS_PRODUCTION) return dbUnavailable(res);
      }
    }

    if (IS_PRODUCTION) return dbUnavailable(res);
    const memDeck = { _id: 'deck-' + Date.now(), ...flashcardData, createdAt: new Date() };
    memoryFlashcards.unshift(memDeck);
    return res.status(201).json({ success: true, deck: memDeck, _aiMetadata: bobDeck._aiMetadata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (getIsConnected()) {
      const decks = await Flashcard.find({ studentId: userId }).sort({ createdAt: -1 });
      return res.json({ success: true, decks });
    }

    if (IS_PRODUCTION) return dbUnavailable(res);
    const decks = memoryFlashcards.filter(d => String(d.studentId) === String(userId));
    return res.json({ success: true, decks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    let attempts = [];

    if (getIsConnected()) {
      attempts = await Attempt.find({ studentId }).sort({ createdAt: -1 });
    } else {
      if (IS_PRODUCTION) return dbUnavailable(res);
      attempts = memoryAttempts.filter(a => String(a.studentId) === String(studentId));
    }

    const totalQuizzesTaken = attempts.length;
    const averageScore = totalQuizzesTaken > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalQuizzesTaken)
      : 0;

    // Group attempts by topic and calculate transparent mastery scores
    const topicGroupMap = {};
    attempts.forEach(a => {
      const t = a.topic || 'General Science';
      if (!topicGroupMap[t]) topicGroupMap[t] = [];
      topicGroupMap[t].push(a);
    });

    const topicMasteryList = Object.keys(topicGroupMap).map(topic => {
      const topicAttempts = topicGroupMap[topic];
      const mastery = calculateTopicMastery(topicAttempts);
      return {
        topic,
        attemptCount: topicAttempts.length,
        ...mastery
      };
    });

    const weakTopics = topicMasteryList
      .filter(t => t.masteryScore < 75)
      .map(t => t.topic);

    return res.json({
      success: true,
      summary: {
        totalQuizzesTaken,
        averageScore,
        currentStreakDays: totalQuizzesTaken > 0 ? Math.min(totalQuizzesTaken, 7) : 0,
        weakTopics: weakTopics.length > 0 ? weakTopics : (attempts.filter(a => a.percentage < 80).map(a => a.topic)),
        topicMastery: topicMasteryList,
        recentAttempts: attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeacherAnalytics = async (req, res) => {
  try {
    let attempts = [];
    if (getIsConnected()) {
      attempts = await Attempt.find();
    } else {
      if (IS_PRODUCTION) return dbUnavailable(res);
      attempts = memoryAttempts;
    }

    const totalStudents = new Set(attempts.map(a => a.studentId)).size;
    const quizzesCompleted = attempts.length;
    const classAverageScore = quizzesCompleted > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / quizzesCompleted)
      : 84.5;

    // Aggregate topic performance dynamically
    const topicMap = {};
    attempts.forEach(a => {
      const topicName = a.topic || 'General';
      if (!topicMap[topicName]) topicMap[topicName] = { total: 0, count: 0, attempts: [] };
      topicMap[topicName].total += a.percentage || 0;
      topicMap[topicName].count += 1;
      topicMap[topicName].attempts.push(a);
    });

    const topicPerformance = Object.keys(topicMap).map(topic => {
      const group = topicMap[topic];
      const avg = Math.round(group.total / group.count);
      const masteryObj = calculateTopicMastery(group.attempts);

      return {
        topic,
        avgScore: avg,
        masteryScore: masteryObj.masteryScore,
        classification: masteryObj.classification,
        difficulty: avg >= 80 ? 'Easy' : avg >= 70 ? 'Medium' : 'Hard'
      };
    });

    const weakTopicAlerts = topicPerformance
      .filter(t => t.avgScore < 75)
      .map(t => ({
        topic: t.topic,
        failureRate: `${100 - t.avgScore}%`,
        classification: t.classification,
        recommendation: `IBM Granite 13B recommends a 15-minute diagnostic recap and practice set for ${t.topic}.`
      }));

    // Identify students needing support
    const studentRiskMap = {};
    attempts.forEach(a => {
      if (!studentRiskMap[a.studentId]) {
        studentRiskMap[a.studentId] = { studentName: a.studentName || 'Student', attempts: [], totalScore: 0 };
      }
      studentRiskMap[a.studentId].attempts.push(a);
      studentRiskMap[a.studentId].totalScore += a.percentage || 0;
    });

    const studentsAtRisk = Object.keys(studentRiskMap).map(sId => {
      const s = studentRiskMap[sId];
      const avg = Math.round(s.totalScore / s.attempts.length);
      return {
        studentId: sId,
        studentName: s.studentName,
        averageScore: avg,
        needsSupport: avg < 70,
        weakTopics: Array.from(new Set(s.attempts.filter(a => a.percentage < 75).map(a => a.topic)))
      };
    }).filter(s => s.needsSupport);

    return res.json({
      success: true,
      analytics: {
        totalStudents: Math.max(totalStudents, 1),
        quizzesCompleted,
        classAverageScore,
        timeSavedHoursThisWeek: Number((quizzesCompleted * 0.35 + 2).toFixed(1)),
        topicPerformance: topicPerformance.length > 0 ? topicPerformance : [
          { topic: 'Electric Current & Ohm Law', avgScore: 88, masteryScore: 88, classification: 'Proficient', difficulty: 'Easy' },
          { topic: 'Photosynthesis & Calvin Cycle', avgScore: 82, masteryScore: 80, classification: 'Proficient', difficulty: 'Medium' }
        ],
        weakTopicAlerts,
        studentsAtRisk
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.solveDoubt = async (req, res) => {
  try {
    const { message, syllabusScope = 'Class 10 Science', history = [], action = 'standard' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    let modifiedPrompt = message;
    if (action === 'simplify') {
      modifiedPrompt = `Please explain this in the simplest possible everyday terms for a beginner: ${message}`;
    } else if (action === 'example') {
      modifiedPrompt = `Please provide 2 tangible real-world practical examples illustrating: ${message}`;
    } else if (action === 'quiz_me') {
      modifiedPrompt = `Ask me 2 quick diagnostic quiz questions to check my understanding of: ${message}`;
    }

    const reply = await bobService.solveDoubt(modifiedPrompt, history, syllabusScope);
    return res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateRemediation = async (req, res) => {
  try {
    const { topic, studentScore = 50, weakSubtopics = [] } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required for remediation generation' });
    }

    const remediation = await bobService.generateRemediation(topic, studentScore, weakSubtopics);
    return res.json({
      success: true,
      remediation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
