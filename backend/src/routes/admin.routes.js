const express = require('express');
const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret_for_demo', { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GET /api/admin/conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Conversation.countDocuments();
    const conversations = await Conversation.find()
      .populate('beneficiaryId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Anonymize data for the dashboard view
    const anonymized = conversations.map(c => {
      const b = c.beneficiaryId || {};
      return {
        _id: c._id,
        status: c.status,
        channel: c.channel,
        state: c.state,
        createdAt: c.createdAt,
        isDemo: b.isDemo,
        recommendations: c.recommendations,
        beneficiary: {
          ageRange: b.ageRange,
          district: b.district,
          education: b.education,
          currentWork: b.currentWork,
          skills: b.skills,
          interests: b.interests,
          workPreference: b.workPreference,
          localOpportunitiesReported: b.localOpportunitiesReported,
          // Hide sensitive PII if it existed (name, full phone)
        }
      };
    });

    res.json({
      data: anonymized,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('[Admin] Fetch conversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
