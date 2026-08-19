const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['mcq', 'short', 'truefalse'], default: 'mcq' },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        explanation: { type: String, default: '' },
        difficulty: { type: String, default: 'medium' }
      }
    ],
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    assignedGrade: { type: String, default: 'Class 10' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
