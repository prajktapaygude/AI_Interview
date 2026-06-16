const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Import proper admin middleware from adminAuth.js
const { authenticateAdmin } = require('./adminAuth');

/* =========================================================
   GET /api/admin/users - List users
========================================================= */
router.get('/users', authenticateAdmin, async (req, res) => {
  console.log('🌐 GET /api/admin/users - Admin viewing users list');
  console.log('Query params:', req.query);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search filter
    if (req.query.search && req.query.search.trim()) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Membership filter
    if (req.query.membership && req.query.membership !== 'all') {
      query.membership = req.query.membership;
    }
    
    // Verified filter
    if (req.query.verified && req.query.verified !== 'all') {
      query.isVerified = req.query.verified === 'true';
    }
    
    // Auth type filter
    if (req.query.authType && req.query.authType !== 'all') {
      query.authType = req.query.authType;
    }
    
    console.log('🔍 Fetching users with query:', JSON.stringify(query));
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`✅ Found ${users.length} users (page ${page}, total: ${total})`);
    
    res.json({
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
    
  } catch (error) {
    console.error('❌ GET /users error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/* =========================================================
   DELETE /api/admin/users/:id - Hard delete user
========================================================= */
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  console.log('🗑️ DELETE /api/admin/users/:id - Permanent delete requested');
  console.log('Admin:', req.admin?.id, 'Target user ID:', req.params.id);
  try {
    const userId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    // First check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('👤 Found user to PERMANENTLY delete:', user.email, user.name);
    
    // PERMANENT DELETE using deleteOne()
    const result = await User.deleteOne({ _id: userId });
    
    if (result.deletedCount === 0) {
      console.log('❌ Delete failed - no document deleted');
      return res.status(404).json({ 
        success: false, 
        message: 'User could not be deleted' 
      });
    }
    
    console.log('✅ Successfully PERMANENTLY deleted user:', user.email);
    
    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.emit('userDeleted', { userId, userEmail: user.email });
      io.emit('statsUpdated');
    }
    
    res.json({ 
      success: true, 
      message: 'User permanently deleted from database',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('❌ DELETE error details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      errorType: error.name
    });
  }
});

/* =========================================================
   PATCH /api/admin/users/:id/verify - Toggle verification
========================================================= */
router.patch('/users/:id/verify', authenticateAdmin, async (req, res) => {
  console.log('🔄 PATCH /api/admin/users/:id/verify - Toggle verification');
  console.log('Admin:', req.admin?.id, 'Target user:', req.params.id, 'New status:', req.body.isVerified);
  try {
    const userId = req.params.id;
    const { isVerified } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    if (typeof isVerified !== 'boolean') {
      console.log('❌ isVerified must be boolean');
      return res.status(400).json({ 
        success: false, 
        message: 'isVerified must be boolean' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const oldStatus = user.isVerified;
    user.isVerified = isVerified;
    await user.save();
    
    console.log(`✅ User ${user.email} verification: ${oldStatus ? 'Verified' : 'Unverified'} → ${isVerified ? 'Verified' : 'Unverified'}`);
    
    res.json({ 
      success: true, 
      message: 'Verification status updated successfully',
      isVerified: user.isVerified
    });
    
  } catch (error) {
    console.error('❌ PATCH /verify error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;