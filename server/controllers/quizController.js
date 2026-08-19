const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const bobService = require('../services/bob.service');
const { getIsConnected } = require('../config/db');

// Memory store fallback
const memoryQuizzes = [
  {
    _id: 'quiz-demo-1',
    teacherId: 'demo-teacher-1',
    topic: 'Photosynthesis & Plant Energy',
    difficulty: 'medium',
    status: 'published',
    assignedGrade: 'Class 10',
    questions: [
      {
        question: 'Which cellular organelle is the primary site of photosynthesis in plant cells?',
        type: 'mcq',
        options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Golgi Apparatus'],
        correctAnswer: 'Chloroplast',
        explanation: 'Chloroplasts contain chlorophyll pigments that absorb light energy required for photosynthesis.',
        difficulty: 'easy'
      },
      {
        question: 'What are the two major chemical outputs of the light-dependent reactions of photosynthesis?',
        type: 'mcq',
        options: ['ATP and NADPH', 'Glucose and Water', 'Carbon Dioxide and Heat', 'Lactic Acid and NADP+'],
        correctAnswer: 'ATP and NADPH',
        explanation: 'Light reactions convert solar energy into chemical energy stored in ATP and NADPH molecules.',
        difficulty: 'medium'
      },
      {
        question: 'True or False: The Calvin Cycle (dark reactions) can occur in the absence of light as long as ATP and NADPH are available.',
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'The Calvin Cycle is light-independent because it directly uses stored chemical energy rather than photons.',
        difficulty: 'medium'
      },
      {
        question: 'Explain why plants appear green to the human eye.',
        type: 'short',
        options: [],
        correctAnswer: 'Chlorophyll pigments absorb blue and red light wavelengths, while reflecting green light wavelengths back to our eyes.',
        explanation: 'Reflection of green light wavelengths gives plants their green coloration.',
        difficulty: 'hard'
      }
    ],
    createdAt: new Date()
  }
];

const memoryAttempts = [
  {
    _id: 'attempt-demo-1',
    studentId: 'demo-student-1',
    studentName: 'Rohan Gupta',
    quizId: 'quiz-demo-1',
    topic: 'Photosynthesis & Plant Energy',
    totalScore: 18,
    maxScore: 20,
    percentage: 90,
    answers: [
      { questionIndex: 0, questionText: 'Which organelle...', userAnswer: 'Chloroplast', correctAnswer: 'Chloroplast', isCorrect: true, score: 5, feedback: 'Correct!' },
      { questionIndex: 1, questionText: 'What outputs...', userAnswer: 'ATP and NADPH', correctAnswer: 'ATP and NADPH', isCorrect: true, score: 5, feedback: 'Correct!' },
      { questionIndex: 2, questionText: 'True or False...', userAnswer: 'True', correctAnswer: 'True', isCorrect: true, score: 5, feedback: 'Correct!' },
      { questionIndex: 3, questionText: 'Explain why green...', userAnswer: 'Chlorophyll reflects green light and absorbs other colors.', correctAnswer: 'Chlorophyll reflects green light.', isCorrect: true, score: 3, feedback: 'IBM BOB Feedback: Good explanation, core terminology present.' }
    ],
    createdAt: new Date()
  }
];

exports.generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 4 } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Quiz topic is required' });
    }

    // Call IBM BOB engine
    const questions = await bobService.generateQuiz(topic, difficulty, questionCount);

    const quizData = {
      teacherId: req.user ? (req.user.id || req.user._id) : 'demo-teacher-1',
      topic,
      difficulty,
      questions,
      status: 'published',
      assignedGrade: req.body.assignedGrade || 'Class 10'
    };

    if (getIsConnected()) {
      const newQuiz = await Quiz.create(quizData);
      return res.status(201).json({ success: true, quiz: newQuiz });
    }

    const memQuiz = { _id: 'quiz-' + Date.now(), ...quizData, createdAt: new Date() };
    memoryQuizzes.unshift(memQuiz);
    return res.status(201).json({ success: true, quiz: memQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    if (getIsConnected()) {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      return res.json({ success: true, quizzes });
    }
    return res.json({ success: true, quizzes: memoryQuizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    let quiz = null;
    if (getIsConnected()) {
      quiz = await Quiz.findById(id);
    } else {
      quiz = memoryQuizzes.find(q => q._id === id);
    }

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    return res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.gradeAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    let quiz = null;

    if (getIsConnected()) {
      quiz = await Quiz.findById(quizId);
    } else {
      quiz = memoryQuizzes.find(q => q._id === quizId);
    }

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for grading' });
    }

    let totalScore = 0;
    const maxScore = quiz.questions.length * 5;
    const gradedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
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
        // Short answer auto-graded via IBM BOB NLP
        const bobGrading = await bobService.autoGradeAnswer(q.question, q.correctAnswer, String(studentAns));
        const score = bobGrading.score || 3;
        totalScore += score;
        gradedAnswers.push({
          questionIndex: i,
          questionText: q.question,
          userAnswer: String(studentAns),
          correctAnswer: q.correctAnswer,
          isCorrect: score >= 3,
          score,
          feedback: `[IBM BOB Auto-Grading Feedback]: ${bobGrading.feedback}`
        });
      }
    }

    const percentage = Math.round((totalScore / maxScore) * 100);

    const attemptData = {
      studentId: req.user ? (req.user.id || req.user._id) : 'demo-student-1',
      studentName: req.user ? req.user.name : 'Rohan Gupta',
      quizId: quiz._id,
      topic: quiz.topic,
      answers: gradedAnswers,
      totalScore,
      maxScore,
      percentage
    };

    if (getIsConnected()) {
      const savedAttempt = await Attempt.create(attemptData);
      return res.status(201).json({ success: true, attempt: savedAttempt });
    }

    const memAttempt = { _id: 'attempt-' + Date.now(), ...attemptData, createdAt: new Date() };
    memoryAttempts.unshift(memAttempt);
    return res.status(201).json({ success: true, attempt: memAttempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttempts = async (req, res) => {
  try {
    if (getIsConnected()) {
      const attempts = await Attempt.find().sort({ createdAt: -1 });
      return res.json({ success: true, attempts });
    }
    return res.json({ success: true, attempts: memoryAttempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
