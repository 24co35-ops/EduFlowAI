const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    subject: { type: String, required: true },
    syllabusFileName: { type: String, default: '' },
    syllabusText: { type: String, default: '' },
    overview: { type: String, default: '' },
    plan: [
      {
        day: { type: Number, required: true },
        topic: { type: String, required: true },
        duration: { type: String, default: '45 mins' },
        activities: [{ type: String }],
        objectives: [{ type: String }]
      }
    ],
    language: { type: String, default: 'en' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
