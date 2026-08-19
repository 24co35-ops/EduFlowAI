const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['teacher', 'student', 'admin'], default: 'teacher' },
    institution: { type: String, default: 'Greenwood High School' },
    grade: { type: String, default: 'Class 10' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
