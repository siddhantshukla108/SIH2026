const mongoose = require('mongoose');

const livelihoodSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHi: { type: String },
  type: { type: String, enum: ['self-employment', 'wage', 'existing-trade-upgrade'] },
  district: { type: String },
  state: { type: String },
  sector: { type: String },
  relatedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  requiredSkills: [{ type: String }],
  minEducation: { type: String, enum: ['none', '5th', '8th', '10th', '12th', 'graduate', 'unknown'], default: 'unknown' },
  startupCostRange: { type: String },
  needsAssets: [{ type: String }],
  demandSignal: { type: String, enum: ['high', 'medium', 'low', 'unknown'], default: 'unknown' },
  supportNote: { type: String },
  
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

module.exports = mongoose.model('Livelihood', livelihoodSchema);
