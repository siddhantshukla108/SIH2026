const express = require('express');
const Conversation = require('../models/Conversation');
const Beneficiary = require('../models/Beneficiary');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const totalConversations = await Conversation.countDocuments();
    const completedProfiles = await Conversation.countDocuments({ status: 'completed' });
    
    // Channel split
    const channelSplit = await Conversation.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);

    // Top recommended courses
    const topCourses = await Conversation.aggregate([
      { $unwind: '$recommendations' },
      { $match: { 'recommendations.type': 'course' } },
      { $group: { _id: '$recommendations.refId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalConversations,
      completedProfiles,
      channelSplit,
      topCourseIds: topCourses
    });
  } catch (err) {
    console.error('[Dashboard] Summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/dashboard/by-district
router.get('/by-district', requireAuth, async (req, res) => {
  try {
    const distribution = await Beneficiary.aggregate([
      { $match: { district: { $ne: null } } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(distribution);
  } catch (err) {
    console.error('[Dashboard] District mapping error:', err);
    res.status(500).json({ error: 'Failed to fetch district distribution' });
  }
});

// GET /api/dashboard/education
router.get('/education', requireAuth, async (req, res) => {
  try {
    const distribution = await Beneficiary.aggregate([
      { $match: { education: { $ne: null }, education: { $ne: 'unknown' } } },
      { $group: { _id: '$education', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch education distribution' });
  }
});

module.exports = router;
