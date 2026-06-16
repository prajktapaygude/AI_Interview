const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Pro', 'Premium']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  features: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    enum: ['popular', 'new', 'none'],
    default: 'none'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);