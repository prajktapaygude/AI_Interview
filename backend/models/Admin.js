const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'moderator'],
    default: 'admin'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { 
  collection: 'admins',
  timestamps: true 
});

module.exports = mongoose.model('Admin', adminSchema);

