const passport = require('passport');

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false })(req, res, next);
};

const adminAuthMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

module.exports = { authMiddleware, adminAuthMiddleware };