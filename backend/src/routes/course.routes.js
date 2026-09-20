const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

module.exports = router;
