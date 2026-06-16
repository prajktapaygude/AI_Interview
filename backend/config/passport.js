const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Initialize Passport - Google Only
const initPassport = () => {
  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        // IMPORTANT: This allows passing prompt parameter
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('📱 Google auth callback for:', profile.emails[0].value);
          
          let user = await User.findOne({ email: profile.emails[0].value });
          
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              authType: 'google',
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              isVerified: true,
              membership: 'Free'
            });
            console.log('✅ New user created via Google:', user.email);
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.authType = 'google';
            await user.save();
            console.log('✅ Google account linked to existing user:', user.email);
          }
          
          return done(null, user);
        } catch (error) {
          console.error('❌ Google Strategy Error:', error);
          return done(error, null);
        }
      }
    ));
    console.log('✅ Google OAuth configured');
  } else {
    console.log('⚠️ Google OAuth credentials not found - Google login disabled');
  }
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = { initPassport };