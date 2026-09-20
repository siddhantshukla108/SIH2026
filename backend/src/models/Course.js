const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHi: { type: String },
  sector: { type: String },
  nsqfLevel: { type: Number },
  minEducation: { type: String, enum: ['none', '5th', '8th', '10th', '12th', 'graduate', 'unknown'], default: 'unknown' },
  durationHours: { type: Number },
  jobRoles: [{ type: String }],
  description: { type: String },
  descriptionHi: { type: String },
  tags: [{ type: String }],
  
  // Provenance fields
  sourceName: { type: String }, // "NQR", "NABARD PLP", "OGD", "MANUAL", "SYNTHETIC"
  sourceUrl: { type: String },
  sourceDoc: { type: String },
  sourceExcerpt: { type: String },
  retrievedAt: { type: String },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  isDemo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
