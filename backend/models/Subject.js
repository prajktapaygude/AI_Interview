const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: String,
  icon: String,
  color: String,
  category: String,
  level: String,
  description: String,
  generationConfig: {
    prompt: String,
    defaultDifficulty: String,
    defaultQuestionCount: Number,
    topics: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);