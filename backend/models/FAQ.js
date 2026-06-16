const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  keywords: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }],
  answer: {
    type: String,
    required: true
  },
  exampleQuestion: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FAQ', faqSchema);