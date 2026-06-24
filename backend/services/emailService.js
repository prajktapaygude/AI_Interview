// const nodemailer = require('nodemailer');

// // Create transporter using environment variables
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// /**
//  * Send email verification link to user
//  * @param {string} email - recipient email address
//  * @param {string} token - verification token
//  */
// const sendVerificationEmail = async (email, token) => {
//   const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
//   const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
//         .button { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; margin: 20px 0; }
//         .footer { font-size: 12px; color: #666; margin-top: 30px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h2>Welcome to AI Mentor!</h2>
//         <p>Please verify your email address by clicking the button below:</p>
//         <a href="${verificationUrl}" class="button">Verify Email Address</a>
//         <p>This link expires in 24 hours.</p>
//         <div class="footer">
//           <p>If you didn't create an account, you can ignore this email.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   await transporter.sendMail({
//     from: `"AI Mentor" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Verify Your Email - AI Mentor',
//     html: htmlContent
//   });
// };

// module.exports = { sendVerificationEmail };





const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,                     // STARTTLS
  secure: false,                 // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,                     // force IPv4
  connectionTimeout: 10000,      // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
  debug: true,
  logger: true,
});

// ... keep the rest of your send functions unchanged

/**
 * Send email verification link to user
 * @param {string} email - recipient email address
 * @param {string} token - verification token
 */
const sendVerificationEmail = async (email, token) => {
  console.log(`📧 Attempting to send verification email to: ${email}`);
  console.log(`🔑 Using EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`📤 Using EMAIL_HOST: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);

  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    const htmlContent = `
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
    `;

    const mailOptions = {
      from: `"AI Mentor" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - AI Mentor',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📬 Response: ${info.response}`);
    return info;

  } catch (error) {
    console.error('❌ Email sending FAILED:');
    console.error(`   Error name: ${error.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error code: ${error.code}`);
    console.error(`   Command: ${error.command}`);
    console.error(`   Response: ${error.response}`);
    console.error('   Full error object:', error);
    throw error; // re-throw so the caller knows it failed
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  console.log(`📧 Attempting to send password reset email to: ${email}`);

  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
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
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <div class="footer">
            <p>If you didn't request this, you can ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"AI Mentor" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - AI Mentor',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return info;

  } catch (error) {
    console.error('❌ Password reset email FAILED:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };