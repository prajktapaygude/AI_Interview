const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact - submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Log incoming request
    console.log('📨 Contact form submission:', { name, email, subject, message: message?.substring(0, 50) });

    // Basic presence validation
    const errors = [];
    if (!name || name.trim() === '') errors.push('Name is required');
    if (!email || email.trim() === '') errors.push('Email is required');
    if (!subject || subject.trim() === '') errors.push('Subject is required');
    if (!message || message.trim() === '') errors.push('Message is required');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Create and save
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    await contact.save();
    console.log('✅ Contact saved successfully, ID:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Message received successfully'
    });

  } catch (error) {
    console.error('❌ Contact submission error:', error);

    // Handle Mongoose validation errors (e.g., minlength, required)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry. Please use different information.'
      });
    }

    // Handle database connection issues
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({
        success: false,
        error: 'Database connection issue. Please try again later.'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// GET /api/contact - retrieve all submissions (admin only)
router.get('/', async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${submissions.length} contact submissions`);
    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions'
    });
  }
});

// DELETE /api/contact/:id - delete a submission (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;