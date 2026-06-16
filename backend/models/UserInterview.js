const mongoose = require('mongoose');

const userInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userName: String,
  userEmail: String,
  role: String,
  position: String,
  techStack: String,
  level: { type: String, default: 'mid' },
  difficulty: { type: String, default: 'medium' },
  totalQuestions: Number,
  answeredQuestions: Number,
  overallScore: Number,
  technicalScore: Number,
  clarityScore: Number,
  confidenceScore: Number,
  duration: Number,
  status: String,
  completedAt: Date,
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestion' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInterview', userInterviewSchema);