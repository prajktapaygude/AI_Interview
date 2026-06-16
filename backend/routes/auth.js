// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const crypto = require('crypto');
// const User = require('../models/User');

// let nodemailer;
// try {
//   nodemailer = require('nodemailer');
// } catch (err) {
//   console.log('⚠️ nodemailer not installed, email sending disabled');
// }

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// // =========================================================
// // MIDDLEWARE: Authenticate User
// // =========================================================
// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authorization header missing or invalid'
//       });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     req.user = user;
//     next();

//   } catch (error) {
//     console.error('Auth error:', error.message);
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token'
//     });
//   }
// };

// // =========================================================
// // REGISTER
// // =========================================================
// router.post('/register', async (req, res) => {
//   try {
//     let { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists'
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name: name.trim(),
//       email,
//       password: hashedPassword,
//       authType: 'local',
//       membership: 'Free',
//       isPremium: false
//     });

//     await user.save();

//     const io = req.app.get('io');
//     if (io) {
//       io.emit('usersUpdated');
//       io.emit('statsUpdated');
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         membership: user.membership,
//         authType: user.authType
//       }
//     });

//   } catch (err) {
//     console.error('Register Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // =========================================================
// // LOGIN
// // =========================================================
// router.post('/login', async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     email = email.toLowerCase().trim();

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     if (user.authType === 'google') {
//       return res.status(400).json({
//         success: false,
//         message: 'Please use Google login'
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     user.lastLogin = new Date();
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         membership: user.membership,
//         authType: user.authType
//       }
//     });

//   } catch (err) {
//     console.error('Login Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // =========================================================
// // GOOGLE AUTH (Updated with account selection prompt)
// // =========================================================
// router.get('/google', (req, res, next) => {
//   const { prompt } = req.query;
  
//   console.log('🔵 Google auth initiated, prompt param:', prompt);
  
//   const options = {
//     scope: ['profile', 'email'],
//     accessType: 'offline'
//   };
  
//   // Force account selection if prompt=select_account
//   if (prompt === 'select_account') {
//     options.prompt = 'select_account';
//     console.log('🟢 Setting prompt=select_account to force account selection');
//   }
  
//   // Use passport with the options
//   passport.authenticate('google', options)(req, res, next);
// });

// router.get('/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
//   }),
//   (req, res) => {
//     try {
//       console.log('✅ Google auth successful for user:', req.user.email);
      
//       const token = jwt.sign(
//         { userId: req.user._id },
//         JWT_SECRET,
//         { expiresIn: '7d' }
//       );

//       const userData = encodeURIComponent(JSON.stringify({
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         avatar: req.user.avatar,
//         membership: req.user.membership,
//         authType: req.user.authType
//       }));

//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//       res.redirect(`${frontendUrl}/auth/google-callback?token=${token}&user=${userData}`);
      
//     } catch (error) {
//       console.error('Google callback error:', error);
//       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_callback_failed`);
//     }
//   }
// );

// // =========================================================
// // VERIFY TOKEN
// // =========================================================
// router.get('/verify', async (req, res) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided'
//       });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }

//     res.json({
//       success: true,
//       user
//     });

//   } catch (err) {
//     console.error('Verify Error:', err);
//     res.status(401).json({
//       success: false,
//       message: 'Token is not valid'
//     });
//   }
// });

// // =========================================================
// // PROFILE
// // =========================================================
// router.get('/profile', authenticateUser, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.json({ user });
//   } catch (err) {
//     console.error('Profile fetch error:', err);
//     res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// });

// // =========================================================
// // FORGOT PASSWORD
// // =========================================================
// // =========================================================
// // FORGOT PASSWORD (sends real email)
// // =========================================================
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() });

//     // Always return generic success for security
//     if (!user) {
//       return res.status(200).json({
//         success: true,
//         message: 'If your email is registered, you will receive a password reset link.'
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = Date.now() + 3600000; // 1 hour

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = resetTokenExpiry;
//     await user.save();

//     const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

//     // ---------- SEND EMAIL ----------
//     if (nodemailer) {
//       try {
//         const transporter = nodemailer.createTransport({
//           host: process.env.EMAIL_HOST,
//           port: process.env.EMAIL_PORT,
//           secure: process.env.EMAIL_PORT == 465, // true for 465, false for others
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//           },
//         });

//         const mailOptions = {
//           from: `"Interview Hub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: 'Password Reset Request',
//           text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
//           html: `<p>You requested a password reset.</p>
//                  <p>Click the link below to reset your password (valid for 1 hour):</p>
//                  <a href="${resetUrl}">${resetUrl}</a>
//                  <p>If you did not request this, please ignore this email.</p>`,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Password reset email sent to ${user.email}`);
//       } catch (emailError) {
//         console.error('❌ Email sending failed:', emailError);
//         // Still return success to the user
//       }
//     } else {
//       console.log('⚠️ nodemailer not installed – email not sent');
//       console.log(`🔐 Reset link (would have been emailed): ${resetUrl}`);
//     }
//     // ---------------------------------

//     res.status(200).json({
//       success: true,
//       message: 'If your email is registered, you will receive a password reset link.'
//     });

//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ error: 'Failed to process request.' });
//   }
// });

// // =========================================================
// // RESET PASSWORD
// // =========================================================
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;
    
//     if (!token || !newPassword) {
//       return res.status(400).json({ error: 'Token and new password are required' });
//     }
    
//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }
    
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!user) {
//       return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
//     }
    
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Password has been reset successfully.' 
//     });
    
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ error: 'Failed to reset password.' });
//   }
// });

// // =========================================================
// // VERIFY RESET TOKEN
// // =========================================================
// router.get('/verify-reset-token/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
    
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!user) {
//       return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Token is valid' 
//     });
    
//   } catch (error) {
//     console.error('Verify token error:', error);
//     res.status(500).json({ error: 'Failed to verify token' });
//   }
// });

// // =========================================================
// // LOGOUT
// // =========================================================
// router.post('/logout', authenticateUser, async (req, res) => {
//   res.json({ success: true, message: 'Logged out successfully' });
// });

// // =========================================================
// // EXPORTS
// // =========================================================
// module.exports = {
//   router,
//   authenticateUser
// };

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const crypto = require('crypto');
// const User = require('../models/User');

// let nodemailer;
// try {
//   nodemailer = require('nodemailer');
// } catch (err) {
//   console.log('⚠️ nodemailer not installed, email sending disabled');
// }

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// // =========================================================
// // MIDDLEWARE: Authenticate User
// // =========================================================
// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authorization header missing or invalid'
//       });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     req.user = user;
//     next();

//   } catch (error) {
//     console.error('Auth error:', error.message);
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token'
//     });
//   }
// };

// // =========================================================
// // REGISTER
// // =========================================================
// router.post('/register', async (req, res) => {
//   try {
//     let { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists'
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name: name.trim(),
//       email,
//       password: hashedPassword,
//       authType: 'local',
//       membership: 'Free',
//       isPremium: false
//     });

//     await user.save();

//     const io = req.app.get('io');
//     if (io) {
//       io.emit('usersUpdated');
//       io.emit('statsUpdated');
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         membership: user.membership,
//         authType: user.authType
//       }
//     });

//   } catch (err) {
//     console.error('Register Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // =========================================================
// // LOGIN
// // =========================================================
// router.post('/login', async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     email = email.toLowerCase().trim();

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     if (user.authType === 'google') {
//       return res.status(400).json({
//         success: false,
//         message: 'Please use Google login'
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     user.lastLogin = new Date();
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         membership: user.membership,
//         authType: user.authType
//       }
//     });

//   } catch (err) {
//     console.error('Login Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // =========================================================
// // GOOGLE AUTH (Updated with account selection prompt)
// // =========================================================
// router.get('/google', (req, res, next) => {
//   const { prompt } = req.query;
  
//   console.log('🔵 Google auth initiated, prompt param:', prompt);
  
//   const options = {
//     scope: ['profile', 'email'],
//     accessType: 'offline'
//   };
  
//   // Force account selection if prompt=select_account
//   if (prompt === 'select_account') {
//     options.prompt = 'select_account';
//     console.log('🟢 Setting prompt=select_account to force account selection');
//   }
  
//   // Use passport with the options
//   passport.authenticate('google', options)(req, res, next);
// });

// router.get('/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
//   }),
//   (req, res) => {
//     try {
//       console.log('✅ Google auth successful for user:', req.user.email);
      
//       const token = jwt.sign(
//         { userId: req.user._id },
//         JWT_SECRET,
//         { expiresIn: '7d' }
//       );

//       const userData = encodeURIComponent(JSON.stringify({
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         avatar: req.user.avatar,
//         membership: req.user.membership,
//         authType: req.user.authType
//       }));

//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//       res.redirect(`${frontendUrl}/auth/google-callback?token=${token}&user=${userData}`);
      
//     } catch (error) {
//       console.error('Google callback error:', error);
//       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_callback_failed`);
//     }
//   }
// );

// // =========================================================
// // VERIFY TOKEN
// // =========================================================
// router.get('/verify', async (req, res) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided'
//       });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }

//     res.json({
//       success: true,
//       user
//     });

//   } catch (err) {
//     console.error('Verify Error:', err);
//     res.status(401).json({
//       success: false,
//       message: 'Token is not valid'
//     });
//   }
// });

// // =========================================================
// // PROFILE
// // =========================================================
// router.get('/profile', authenticateUser, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.json({ user });
//   } catch (err) {
//     console.error('Profile fetch error:', err);
//     res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// });

// // =========================================================
// // FORGOT PASSWORD
// // =========================================================
// // =========================================================
// // FORGOT PASSWORD (sends real email)
// // =========================================================
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() });

//     // Always return generic success for security
//     if (!user) {
//       return res.status(200).json({
//         success: true,
//         message: 'If your email is registered, you will receive a password reset link.'
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = Date.now() + 3600000; // 1 hour

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = resetTokenExpiry;
//     await user.save();

//     const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

//     // ---------- SEND EMAIL ----------
//     if (nodemailer) {
//       try {
//         const transporter = nodemailer.createTransport({
//           host: process.env.EMAIL_HOST,
//           port: process.env.EMAIL_PORT,
//           secure: process.env.EMAIL_PORT == 465, // true for 465, false for others
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//           },
//         });

//         const mailOptions = {
//           from: `"Interview Hub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: 'Password Reset Request',
//           text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
//           html: `<p>You requested a password reset.</p>
//                  <p>Click the link below to reset your password (valid for 1 hour):</p>
//                  <a href="${resetUrl}">${resetUrl}</a>
//                  <p>If you did not request this, please ignore this email.</p>`,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Password reset email sent to ${user.email}`);
//       } catch (emailError) {
//         console.error('❌ Email sending failed:', emailError);
//         // Still return success to the user
//       }
//     } else {
//       console.log('⚠️ nodemailer not installed – email not sent');
//       console.log(`🔐 Reset link (would have been emailed): ${resetUrl}`);
//     }
//     // ---------------------------------

//     res.status(200).json({
//       success: true,
//       message: 'If your email is registered, you will receive a password reset link.'
//     });

//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ error: 'Failed to process request.' });
//   }
// });

// // =========================================================
// // RESET PASSWORD
// // =========================================================
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;
    
//     if (!token || !newPassword) {
//       return res.status(400).json({ error: 'Token and new password are required' });
//     }
    
//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }
    
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!user) {
//       return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
//     }
    
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Password has been reset successfully.' 
//     });
    
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ error: 'Failed to reset password.' });
//   }
// });

// // =========================================================
// // VERIFY RESET TOKEN
// // =========================================================
// router.get('/verify-reset-token/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
    
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!user) {
//       return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Token is valid' 
//     });
    
//   } catch (error) {
//     console.error('Verify token error:', error);
//     res.status(500).json({ error: 'Failed to verify token' });
//   }
// });

// // =========================================================
// // LOGOUT
// // =========================================================
// router.post('/logout', authenticateUser, async (req, res) => {
//   res.json({ success: true, message: 'Logged out successfully' });
// });

// // =========================================================
// // EXPORTS
// // =========================================================
// module.exports = {
//   router,
//   authenticateUser
// };



const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.log('⚠️ nodemailer not installed, email sending disabled');
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// =========================================================
// MIDDLEWARE: Authenticate User
// =========================================================
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// =========================================================
// HELPER: Send Verification Email
// =========================================================
const sendVerificationEmail = async (email, token) => {
  if (!nodemailer) {
    console.log('⚠️ Cannot send email: nodemailer not installed');
    return;
  }

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"AI Mentor" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - AI Mentor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .button { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to AI Mentor!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>This link expires in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (emailError) {
    console.error('❌ Failed to send verification email:', emailError);
  }
};

// =========================================================
// REGISTER (with email verification)
// =========================================================
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token (expires in 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      authType: 'local',
      membership: 'Free',
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // Send verification email (don't block response)
    sendVerificationEmail(email, verificationToken).catch(err => 
      console.error('Background email error:', err)
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('usersUpdated');
      io.emit('statsUpdated');
    }

    // Do NOT return a token – user must verify email first
    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// =========================================================
// VERIFY EMAIL (GET /verify-email?token=...)
// =========================================================
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. Please request a new one.'
      });
    }

    // Mark user as verified and clear token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Issue JWT to auto-login after verification
    const jwtToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        membership: user.membership,
        authType: user.authType
      }
    });

  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// =========================================================
// RESEND VERIFICATION EMAIL
// =========================================================
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new token and expiry
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email resent. Check your inbox.'
    });

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// =========================================================
// LOGIN (check email verification)
// =========================================================
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.authType === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Please use Google login'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        membership: user.membership,
        authType: user.authType
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// =========================================================
// GOOGLE AUTH (Updated with account selection prompt)
// =========================================================
router.get('/google', (req, res, next) => {
  const { prompt } = req.query;
  
  console.log('🔵 Google auth initiated, prompt param:', prompt);
  
  const options = {
    scope: ['profile', 'email'],
    accessType: 'offline'
  };
  
  if (prompt === 'select_account') {
    options.prompt = 'select_account';
    console.log('🟢 Setting prompt=select_account to force account selection');
  }
  
  passport.authenticate('google', options)(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      console.log('✅ Google auth successful for user:', req.user.email);
      
      // Ensure Google users are marked as verified
      if (req.user && !req.user.isVerified) {
        req.user.isVerified = true;
        req.user.save().catch(err => console.error('Failed to set Google user verified:', err));
      }
      
      const token = jwt.sign(
        { userId: req.user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userData = encodeURIComponent(JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        membership: req.user.membership,
        authType: req.user.authType
      }));

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/google-callback?token=${token}&user=${userData}`);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_callback_failed`);
    }
  }
);

// =========================================================
// VERIFY TOKEN
// =========================================================
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error('Verify Error:', err);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

// =========================================================
// PROFILE
// =========================================================
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// =========================================================
// FORGOT PASSWORD
// =========================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_PORT == 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Interview Hub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Password Reset Request',
          text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
          html: `<p>You requested a password reset.</p>
                 <p>Click the link below to reset your password (valid for 1 hour):</p>
                 <a href="${resetUrl}">${resetUrl}</a>
                 <p>If you did not request this, please ignore this email.</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    } else {
      console.log('⚠️ nodemailer not installed – email not sent');
      console.log(`🔐 Reset link (would have been emailed): ${resetUrl}`);
    }

    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// =========================================================
// RESET PASSWORD
// =========================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password has been reset successfully.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// =========================================================
// VERIFY RESET TOKEN
// =========================================================
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Token is valid' 
    });
    
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// =========================================================
// LOGOUT
// =========================================================
router.post('/logout', authenticateUser, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// =========================================================
// EXPORTS
// =========================================================
module.exports = {
  router,
  authenticateUser
};