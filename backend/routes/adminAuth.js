const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const Admin = require('../models/Admin');

/* ================= AUTH ================= */

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email, is_active: true });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found or inactive" });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.ADMIN_JWT_SECRET || 'admin_secret_key',
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= MIDDLEWARE ================= */
const authenticateAdmin = (req, res, next) => {
  try {
    console.log("AUTH HEADER:", req.header('Authorization'));

    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("TOKEN:", token);

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_secret_key');
    req.admin = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Superadmin required middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super Admin privileges required' });
  }
  next();
};

// In routes/auth.js, ensure you have user authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateUser };
/* ================= ADMIN CRUD ================= */

// GET ADMINS - SUPERADMIN ONLY
router.get('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {

  try {
    const {
      page = 1, limit = 10, search = '',
      role = 'all', active = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

if (active === 'true') query.is_active = true;
else if (active === 'false') query.is_active = false;
else query.is_active = true; // default: hide deleted

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') query.role = role;
    if (active !== 'all') query.is_active = active === 'true';

    const total = await Admin.countDocuments(query);

    const admins = await Admin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      admins,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE ADMIN - SUPERADMIN ONLY
router.post('/admins', authenticateAdmin, requireSuperAdmin, async (req, res) => {

  try {
    let { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    email = email.toLowerCase().trim();

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const admin = new Admin({
      name,
      email,
      password_hash,
      role,
      is_active: true
    });

    await admin.save();

    const obj = admin.toObject();
    delete obj.password_hash;

    res.status(201).json({
      message: 'Admin created successfully',
      admin: obj
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE ADMIN - SUPERADMIN ONLY ✅ FIXED
router.put('/admins/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {

  try {
    const { id } = req.params;
    let { name, email, role, password, is_active } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email) email = email.toLowerCase().trim();

    // Prevent self downgrade
    if (
      req.admin.role === 'superadmin' &&
      req.admin.id === id &&
      role &&
      role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Cannot downgrade yourself' });
    }

    if (name) admin.name = name;

    if (email && email !== admin.email) {
      const exists = await Admin.findOne({ email, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      admin.email = email;
    }

    if (role) admin.role = role;

    if (typeof is_active !== 'undefined') {
      admin.is_active = is_active;
    }

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      admin.password_hash = await bcrypt.hash(password, salt);
    }

    await admin.save();

const result = admin.toObject();
    delete result.password_hash;

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('adminToggled', {
        adminId: admin._id,
        is_active: admin.is_active
      });
    }

    res.json({
      message: 'Admin updated successfully',
      admin: result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ADMIN (SOFT DELETE) - SUPERADMIN ONLY
router.delete('/admins/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {

  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin' });
    }

admin.is_active = false;
    await admin.save();

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('adminToggled', {
        adminId: admin._id,
        is_active: false
      });
    }

    res.json({ message: 'Admin deactivated successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL USERS (ADMIN)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ is_active: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, authenticateAdmin, requireSuperAdmin };
