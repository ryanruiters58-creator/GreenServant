const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../utils/uploadConfig');
const { sendComplaintEmail, sendStatusUpdateEmail } = require('../utils/emailService');

const router = express.Router();

// Create complaint
router.post('/', authMiddleware, upload.array('photos', 5), [
  body('category').isIn(['Water', 'Electricity', 'Roads', 'Refuse', 'Sanitation', 'Street Lights', 'Other']).withMessage('Invalid category'),
  body('description').trim().notEmpty().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('urgency').isIn(['Low', 'Medium', 'High']).withMessage('Invalid urgency level')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { category, description, urgency, location } = req.body;
    const userId = req.userId;

    // Get user details
    const user = await User.findById(userId);

    // Prepare photo data
    const photos = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/complaints/${file.filename}`
    })) : [];

    // Create complaint
    const complaint = new Complaint({
      userId,
      category,
      description,
      urgency,
      location: {
        ...location,
        city: 'Buffalo City'
      },
      photos
    });

    await complaint.save();

    // Send email notification
    const photoUrls = photos.map(p => `${process.env.CLIENT_URL || 'http://localhost:3000'}${p.path}`);
    const emailSent = await sendComplaintEmail({
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      category,
      urgency,
      location: complaint.location,
      description
    }, photoUrls);

    // Update email sent status
    complaint.emailSent = emailSent;
    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: {
        id: complaint._id,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complaint', error: error.message });
  }
});

// Get user's complaints
router.get('/', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      message: 'Complaints retrieved',
      complaints
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
});

// Get single complaint
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (complaint.userId._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint', error: error.message });
  }
});

// Add comment to complaint
router.post('/:id/comments', authMiddleware, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { text } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (complaint.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    complaint.comments.push({
      userId: req.userId,
      text
    });

    await complaint.save();

    res.json({
      message: 'Comment added',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Add photos to existing complaint
router.post('/:id/photos', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (complaint.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check photo limit
    if (complaint.photos.length + req.files.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 photos allowed per complaint' });
    }

    // Add new photos
    req.files.forEach(file => {
      complaint.photos.push({
        filename: file.filename,
        path: `/uploads/complaints/${file.filename}`
      });
    });

    await complaint.save();

    res.json({
      message: 'Photos added',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding photos', error: error.message });
  }
});

module.exports = router;
