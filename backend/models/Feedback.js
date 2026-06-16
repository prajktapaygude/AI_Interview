const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
    trim: true,
    minlength: [10, 'Feedback must be at least 10 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);