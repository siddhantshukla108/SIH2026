const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
  channel: { type: String },
  language: { type: String, default: 'hi' },
  state: { type: String },
  
  turns: [{
    role: { type: String, enum: ['user', 'bot'] },
    text: { type: String },
    at: { type: Date, default: Date.now },
    audioRef: { type: String }
  }],
  
  recommendations: [{
    type: { type: String, enum: ['course', 'livelihood'] },
    refId: { type: mongoose.Schema.Types.ObjectId },
    reason: { type: String },
    skillGap: { type: String },
    nextStep: { type: String },
    fitFlags: {
      aspirationMatch: { type: String, enum: ['good', 'partial', 'unknown'], default: 'unknown' },
      educationMatch: { type: String, enum: ['good', 'partial', 'unknown'], default: 'unknown' },
      mobilityMatch: { type: String, enum: ['good', 'partial', 'unknown'], default: 'unknown' },
      localOpportunityMatch: { type: String, enum: ['good', 'partial', 'unknown'], default: 'unknown' }
    },
    rank: { type: Number }
  }],
  
  status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
