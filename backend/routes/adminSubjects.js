const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');

// GET - Fetch all subjects from database
router.get('/subjects', authenticateAdmin, async (req, res) => {
  try {
    const subjects = await Subject.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      subjects: subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('GET SUBJECTS ERROR:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// POST - Create new subject
router.post('/subjects', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { name, icon, color, category, level, description, generationConfig } = req.body;
    
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ 
        error: 'Subject already exists',
        success: false 
      });
    }
    
    const subject = new Subject({
      name,
      icon: icon || 'fa-code',
      color: color || '#3B82F6',
      category: category || 'technology',
      level: level || 'Beginner',
      description: description || '',
      generationConfig: generationConfig || {
        prompt: 'Generate {count} {difficulty} questions about {topic} for {subject}',
        defaultDifficulty: 'medium',
        defaultQuestionCount: 5,
        topics: ''
      }
    });
    
    await subject.save();
    res.status(201).json({
      success: true,
      subject: subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update subject
router.put('/subjects/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const { name, icon, color, category, level, description, generationConfig } = req.body;
    if (name) subject.name = name;
    if (icon) subject.icon = icon;
    if (color) subject.color = color;
    if (category) subject.category = category;
    if (level) subject.level = level;
    if (description) subject.description = description;
    if (generationConfig) subject.generationConfig = generationConfig;
    
    await subject.save();
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete subject
router.delete('/subjects/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Also delete associated tests
    const Test = require('../models/Test');
    await Test.deleteMany({ subjectId: req.params.id });
    
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;