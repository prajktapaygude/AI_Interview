const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test',
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  questions: [{
    text: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    difficulty: String,
    topic: String,
    points: { type: Number, default: 1 },
    order: Number,
    _id: mongoose.Schema.Types.ObjectId
  }],
  answers: {
    type: [String],
    default: []
  },
  score: { 
    type: Number,
    default: 0
  },
  correctAnswers: { 
    type: Number,
    default: 0
  },
  incorrectAnswers: { 
    type: Number,
    default: 0
  },
  totalPoints: { 
    type: Number,
    default: 0
  },
  timeSpent: { 
    type: Number,
    default: 0
  },
  detailedResults: [{
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String,
    pointsEarned: Number,
    totalPoints: Number
  }],
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  isPassed: { 
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

testAttemptSchema.index({ userId: 1, testId: 1 });
testAttemptSchema.index({ testId: 1, completedAt: -1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);