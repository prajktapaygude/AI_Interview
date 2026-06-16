// const mongoose = require('mongoose');

// // REMOVE THIS LINE - it's causing the error:
// // const { authenticateAdmin } = require('./adminAuth');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     // Password is required only for local auth, not for Google auth
//     required: function() {
//       return !this.googleId;
//     }
//   },
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true // Allows null/undefined values while maintaining uniqueness
//   },
//   avatar: {
//     type: String,
//     default: 'https://via.placeholder.com/40'
//   },
//   authType: {
//     type: String,
//     enum: ['local', 'google'],
//     default: 'local'
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   membership: {
//     type: String,
//     default: 'Free'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastLogin: {
//     type: Date
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   },
//   resetPasswordToken: {
//     type: String,
//     default: null
//   },
//   resetPasswordExpires: {
//     type: Date,
//     default: null
//   }
// });

// module.exports = mongoose.model('User', userSchema);

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     // Password is required only for local auth, not for Google auth
//     required: function() {
//       return !this.googleId;
//     }
//   },
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true // Allows null/undefined values while maintaining uniqueness
//   },
//   avatar: {
//     type: String,
//     default: 'https://via.placeholder.com/40'
//   },
//   authType: {
//     type: String,
//     enum: ['local', 'google'],
//     default: 'local'
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   membership: {
//     type: String,
//     default: 'Free'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastLogin: {
//     type: Date
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   },
//   resetPasswordToken: {
//     type: String,
//     default: null
//   },
//   resetPasswordExpires: {
//     type: Date,
//     default: null
//   }
// });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // Password is required only for local auth, not for Google auth
    required: function() {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values while maintaining uniqueness
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/40'
  },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // NEW: email verification token and expiry
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  membership: {
    type: String,
    default: 'Free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', userSchema);