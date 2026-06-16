const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser } = require('./auth');

// PUT /api/user/membership - Update user membership
router.put('/membership', authenticateUser, async (req, res) => {
  try {
    const { membership } = req.body;

    // Validate membership tiers
    const validMemberships = ['Free', 'Pro', 'Premium'];
    if (!validMemberships.includes(membership)) {
      return res.status(400).json({
        success: false,
        message: `Invalid membership. Must be one of: ${validMemberships.join(', ')}`
      });
    }

    // Update user
    req.user.membership = membership;
    await req.user.save();

    console.log(`✅ Membership updated: ${req.user.email} → ${membership}`);

    res.json({
      success: true,
      message: 'Membership updated successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        membership: req.user.membership
      }
    });

  } catch (error) {
    console.error('Membership update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating membership'
    });
  }
});

module.exports = router;

