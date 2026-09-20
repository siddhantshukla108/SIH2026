const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  channel: { type: String },
  language: { type: String, default: 'hi' },
  consentGiven: { type: Boolean, default: false },
  
  name: { type: String },
  ageRange: { type: String },
  gender: { type: String },
  
  state: { type: String },
  district: { type: String },
  villageOrBlock: { type: String },
  
  education: { type: String, enum: ['none', '5th', '8th', '10th', '12th', 'graduate', 'unknown'], default: 'unknown' },
  currentWork: { type: String },
  traditionalOccupation: { type: String },
  
  skills: [{ type: String }],
  interests: [{ type: String }],
  
  workPreference: { type: String, enum: ['wage', 'self', 'either', 'unknown'], default: 'unknown' },
  willingToMigrate: { type: Boolean, default: null },
  travelRadiusKm: { type: Number, default: null },
  
  physicalConstraints: [{ type: String }],
  localOpportunitiesReported: [{ type: String }],
  incomeExpectation: { type: String, default: null },
  
  fieldConfidence: {
    type: Map,
    of: Number
  },
  
  isDemo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
