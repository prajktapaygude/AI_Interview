const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  techStacks: [{ type: String }]
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  roles: [roleSchema]
});

const levelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true }
});

const difficultySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, required: true }
});

const durationSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, required: true }
});

const interviewConfigSchema = new mongoose.Schema({
  categories: [categorySchema],
  levels: [levelSchema],
  difficulties: [difficultySchema],
  durations: [durationSchema],
  prompts: {
    default: { type: String, required: true },
    evaluationCriteria: {
      weights: {
        technical: { type: Number, default: 50 },
        clarity: { type: Number, default: 30 },
        confidence: { type: Number, default: 20 }
      }
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewConfig', interviewConfigSchema);