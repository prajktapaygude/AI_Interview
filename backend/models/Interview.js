const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Which session this question belongs to
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInterview',
    required: true,
    index: true
  },
  
  // User who answered
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Question details
  question: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    default: ''
  },
  idealAnswer: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    suggestions: [String]
  },
  keywords: [String],
  timeTaken: {
    type: Number,
    default: 0
  },
  
  // Question order in session
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ sessionId: 1, order: 1 });
questionSchema.index({ userId: 1 });

module.exports = mongoose.model('Interview', questionSchema, 'interviews');