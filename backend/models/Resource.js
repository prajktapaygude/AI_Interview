const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'business', 'science', 'humanities', 'professional', 'other', 'frontend', 'backend', 'system-design', 'behavioral', 'dsa']
  },
  subCategory: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'book', 'course', 'practice']
  },
  url: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  tags: [{
    type: String
  }],
  duration: String, // hours or pages
  readTime: String,
  recommended: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  collection: 'resources'
});

module.exports = mongoose.model('Resource', resourceSchema);
