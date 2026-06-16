const express = require('express');
const Plan = require('../models/Plan');
const router = express.Router();

// ========== PUBLIC ROUTES (No Auth Required) ==========

// GET /api/plans - Get all active plans for users
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching active plans for users...');
    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, price: 1 });
    
    console.log(`✅ Found ${plans.length} active plans`);
    res.json({ success: true, plans });
  } catch (err) {
    console.error('Fetch plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// GET /api/plans/public/all - Get ALL plans (including inactive) - Public access
router.get('/public/all', async (req, res) => {
  try {
    console.log('📋 Fetching ALL plans from public endpoint...');
    const plans = await Plan.find().sort({ sortOrder: 1, price: 1 });
    console.log(`✅ Found ${plans.length} total plans`);
    res.json({ success: true, plans });
  } catch (err) {
    console.error('Fetch all plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// ========== ADMIN ROUTES (Keep for compatibility) ==========

// GET /api/plans/admin/all - Get all plans (admin only - but open for now)
router.get('/admin/all', async (req, res) => {
  try {
    console.log('📋 Admin fetching all plans...');
    const plans = await Plan.find().sort({ sortOrder: 1, price: 1 });
    
    console.log(`✅ Found ${plans.length} total plans`);
    res.json({ success: true, plans });
  } catch (err) {
    console.error('Fetch all plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// POST /api/plans - Create new plan
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new plan...', req.body);
    
    const { name, price, features, description, badge, isActive, sortOrder } = req.body;

    if (!name || !price || !features || features.length === 0) {
      return res.status(400).json({ error: 'Name, price, and features are required' });
    }

    // Check if plan with same name already exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan with this name already exists' });
    }

    const plan = new Plan({
      name,
      price: Number(price),
      features: Array.isArray(features) ? features : features.split(',').map(f => f.trim()),
      description: description || '',
      badge: badge || 'none',
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    });

    await plan.save();
    console.log(`✅ New plan created: ${plan.name} - ₹${plan.price}`);

    res.status(201).json({ success: true, plan });
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ error: 'Failed to create plan: ' + err.message });
  }
});

// PUT /api/plans/:id - Update plan
router.put('/:id', async (req, res) => {
  try {
    console.log('✏️ Updating plan:', req.params.id);
    
    const { name, price, features, description, badge, isActive, sortOrder } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (name) plan.name = name;
    if (price) plan.price = Number(price);
    if (features) plan.features = Array.isArray(features) ? features : features.split(',').map(f => f.trim());
    if (description !== undefined) plan.description = description;
    if (badge) plan.badge = badge;
    if (isActive !== undefined) plan.isActive = isActive;
    if (sortOrder !== undefined) plan.sortOrder = sortOrder;

    await plan.save();

    console.log(`✅ Plan updated: ${plan.name} - ₹${plan.price}`);
    res.json({ success: true, plan });
  } catch (err) {
    console.error('Update plan error:', err);
    res.status(500).json({ error: 'Failed to update plan: ' + err.message });
  }
});

// DELETE /api/plans/:id - Delete plan
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting plan:', req.params.id);
    
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    console.log(`❌ Plan deleted: ${plan.name}`);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('Delete plan error:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;