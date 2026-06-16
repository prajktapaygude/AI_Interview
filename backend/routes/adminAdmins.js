const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Middleware
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');

/* =========================================================
   GET /api/admin/admins - List admins with filters/pagination
   Filters: search, role, active, page, limit
========================================================= */
router.get('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const {
      page = 1, 
      limit = 10, 
      search = '',
      role = '',
      active = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) query.role = role;

    // Active filter
    if (active !== '') query.is_active = active === 'true';

    const total = await Admin.countDocuments(query);

    const admins = await Admin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password_hash')
      .lean();

    res.json({
      admins,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Admins list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =========================================================
   POST /api/admin/admins - Create new admin
========================================================= */
router.post('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const admin = new Admin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role
    });

    await admin.save();

    const safeAdmin = admin.toObject();
    delete safeAdmin.password_hash;

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('adminUpdated');

    res.status(201).json({ message: 'Admin created successfully', admin: safeAdmin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================================================
   PUT /api/admin/admins/:id - Update admin (toggle active, name, role, password)
========================================================= */
router.put('/admins/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate self-deactivation attempt
    const requester = req.admin; // from middleware
    if (requester._id.toString() === id && updates.is_active === false) {
      return res.status(403).json({ message: 'Cannot deactivate your own account' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update fields if provided
    if (updates.name) admin.name = updates.name.trim();
    if (updates.email) {
      const existing = await Admin.findOne({ email: updates.email.trim().toLowerCase() });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      admin.email = updates.email.trim().toLowerCase();
    }
    if (updates.role) admin.role = updates.role;
    if (updates.password) {
      const salt = await bcrypt.genSalt(12);
      admin.password_hash = await bcrypt.hash(updates.password, salt);
    }
    if (updates.is_active !== undefined) admin.is_active = updates.is_active;

    await admin.save();

    const safeAdmin = admin.toObject();
    delete safeAdmin.password_hash;

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('adminToggled', { adminId: id, is_active: admin.is_active });
      io.emit('adminUpdated');
    }

    res.json({ message: 'Admin updated successfully', admin: safeAdmin });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================================================
   DELETE /api/admin/admins/:id - Soft delete admin (set is_active = false)
========================================================= */
router.delete('/admins/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent self-deletion
    const requester = req.admin;
    if (requester._id.toString() === id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    admin.is_active = false;
    await admin.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('adminToggled', { adminId: id, is_active: false });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

