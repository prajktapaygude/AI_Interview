const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback - submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, feedback } = req.body;

    console.log('📝 Feedback submission:', { name, email, rating, feedback: feedback?.substring(0, 50) });

    // Validation
    const errors = [];
    if (!feedback || feedback.trim() === '') {
      errors.push('Feedback is required');
    } else if (feedback.trim().length < 10) {
      errors.push('Feedback must be at least 10 characters');
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    // Create feedback document
    const newFeedback = new Feedback({
      name: name?.trim() || '',
      email: email?.trim().toLowerCase() || '',
      rating: rating || 0,
      feedback: feedback.trim()
    });

    await newFeedback.save();
    console.log('✅ Feedback saved, ID:', newFeedback._id);

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!'
    });
  } catch (error) {
    console.error('❌ Feedback submission error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// GET /api/feedback - retrieve all feedback (admin only)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${feedbacks.length} feedback entries`);
    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

// DELETE /api/feedback/:id - delete feedback (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;