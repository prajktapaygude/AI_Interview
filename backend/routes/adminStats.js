const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Import admin middleware
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');

// GET /api/admin/stats - Dashboard metrics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Cache results for 5 minutes to reduce DB load
    const cacheKey = 'admin_stats';
    const cached = req.app.get('statsCache')?.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 1000) {
      return res.json(cached.data);
    }

    // Fetch real-time stats
    const [totalUsers, usersCount, adminsCount, resourcesCount] = await Promise.all([
      User.countDocuments({}), // totalUsers - all users
      User.countDocuments({ isVerified: true, is_active: true }), // verified/active users
      Admin.countDocuments({ is_active: true }),
      Resource.countDocuments()
    ]);

    const stats = {
      totalUsers,
      users: usersCount,
      admins: adminsCount,
      subjects: 0, // TODO: Add Subject model count if exists
      interviews: 0, // TODO: Add Interview model/session count  
      resources: resourcesCount,
      timestamp: new Date().toISOString()
    };

    // Cache for 5 minutes
    if (!req.app.get('statsCache')) {
      const NodeCache = require('node-cache');
      req.app.set('statsCache', new NodeCache({ stdTTL: 30 }));
    }
    req.app.get('statsCache').set(cacheKey, { data: stats, timestamp: Date.now() });

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    // Return safe defaults on error
    res.json({
      users: 0,
      admins: 0,
      subjects: 0,
      interviews: 0,
      resources: 0
    });
  }
});

module.exports = router;

