const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topic: String,
  points: { type: Number, default: 1 },
  order: { type: Number, default: 0 }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: String,
  topic: String,
  duration: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  passingScore: { type: Number, required: true, min: 0, max: 100 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true },
  attemptsCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CRITICAL: Add this method
testSchema.methods.calculateScore = function(answers) {
  let correctAnswers = 0;
  let totalPoints = 0;
  const detailedResults = [];
  
  this.questions.forEach((question, index) => {
    const userAnswer = answers && answers[index] ? answers[index] : null;
    const isCorrect = userAnswer === question.correctAnswer;
    const pointsEarned = isCorrect ? question.points : 0;
    
    if (isCorrect) correctAnswers++;
    totalPoints += pointsEarned;
    
    detailedResults.push({
      questionId: question._id,
      questionText: question.text,
      userAnswer: userAnswer || 'Not answered',
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      explanation: question.explanation || '',
      pointsEarned: pointsEarned,
      totalPoints: question.points
    });
  });
  
  const totalPossiblePoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  const percentageScore = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;
  const isPassed = percentageScore >= this.passingScore;
  
  return {
    score: Math.round(percentageScore * 100) / 100,
    correctAnswers,
    incorrectAnswers: this.totalQuestions - correctAnswers,
    totalPoints,
    totalPossiblePoints,
    isPassed,
    detailedResults
  };
};

// Add this method to update stats
testSchema.methods.updateStats = async function() {
  const TestAttempt = mongoose.model('TestAttempt');
  const attempts = await TestAttempt.find({ 
    testId: this._id,
    completedAt: { $ne: null }
  });
  
  this.attemptsCount = attempts.length;
  if (attempts.length > 0) {
    this.averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Test', testSchema);