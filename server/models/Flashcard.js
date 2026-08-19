const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    cards: [
      {
        front: { type: String, required: true },
        back: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
