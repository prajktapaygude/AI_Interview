const express = require("express");
const router = express.Router();
const Resource = require('../models/Resource');

const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');

/**
 * GET - Fetch resources
 */
router.get('/resources', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = 'all',
      type = 'all',
      difficulty = 'all',
      date = 'all'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category !== 'all') query.category = category;
    if (type !== 'all') query.type = type;
    if (difficulty !== 'all') query.difficulty = difficulty;

    if (date !== 'all') {
      const now = new Date();
      let startDate;

      if (date === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (date === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (date === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }

      query.createdAt = { $gte: startDate };
    }

    const total = await Resource.countDocuments(query);

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json({
      resources,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error("GET RESOURCES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST - Create resource
 */
router.post('/resources', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("ADMIN:", req.admin);

    // Check if admin exists
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin not authenticated' });
    }

    // Get the admin ID - handle both _id and id fields
    const adminId = req.admin._id || req.admin.id;
    
    if (!adminId) {
      console.error("Admin ID not found in request:", req.admin);
      return res.status(400).json({ error: 'Admin ID not found. Please re-authenticate.' });
    }

    // Create resource with createdBy field
    const resourceData = {
      ...req.body,
      createdBy: adminId
    };

    console.log("Creating resource with data:", resourceData);

    const resource = new Resource(resourceData);
    await resource.save();

    const populated = await Resource.findById(resource._id)
      .populate('createdBy', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.emit('resourceUpdated', {
        action: 'created',
        resource: populated
      });
    }

    res.status(201).json({
      message: 'Resource created successfully',
      resource: populated
    });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT - Update
 */
router.put('/resources/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('resourceUpdated', {
        action: 'updated',
        resource
      });
    }

    res.json({
      message: 'Resource updated successfully',
      resource
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE
 */
router.delete('/resources/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('resourceUpdated', {
        action: 'deleted',
        resourceId: resource._id
      });
    }

    res.json({ message: 'Resource deleted successfully' });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;