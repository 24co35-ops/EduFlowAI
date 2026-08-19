const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userRole: { type: String, default: 'student' },
    messages: [
      {
        sender: { type: String, enum: ['user', 'bob'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
