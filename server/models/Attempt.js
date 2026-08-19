const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, default: 'Student' },
    quizId: { type: String, required: true },
    topic: { type: String, default: 'General' },
    answers: [
      {
        questionIndex: { type: Number },
        questionText: { type: String },
        userAnswer: { type: String },
        correctAnswer: { type: String },
        isCorrect: { type: Boolean },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: '' }
      }
    ],
    totalScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
