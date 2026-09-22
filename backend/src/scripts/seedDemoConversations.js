require('dotenv').config();
const mongoose = require('mongoose');
const Beneficiary = require('../models/Beneficiary');
const Conversation = require('../models/Conversation');
const Course = require('../models/Course');
const Livelihood = require('../models/Livelihood');
const { v4: uuidv4 } = require('uuid');

const DISTRICTS = ['Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'];
const ED_LEVELS = ['none', '5th', '8th', '10th', '12th', 'graduate'];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const courses = await Course.find({}, '_id').lean();
    const livelihoods = await Livelihood.find({}, '_id').lean();

    if (courses.length === 0) {
      console.log('No courses found! Please seed courses first using npm run import:verified.');
    }

    console.log('Generating 50 synthetic conversations for the dashboard demo...');
    
    // Clear old demo conversations to prevent massive buildup
    const demoBeneficiaries = await Beneficiary.find({ isDemo: true }, '_id');
    const demoIds = demoBeneficiaries.map(b => b._id);
    await Conversation.deleteMany({ beneficiaryId: { $in: demoIds } });
    await Beneficiary.deleteMany({ isDemo: true });

    for (let i = 0; i < 50; i++) {
      const sessionId = uuidv4();
      const channel = Math.random() > 0.5 ? 'web' : (Math.random() > 0.5 ? 'whatsapp' : 'ivr');
      const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
      const education = ED_LEVELS[Math.floor(Math.random() * ED_LEVELS.length)];
      
      const b = new Beneficiary({
        sessionId,
        channel,
        language: 'hi',
        isDemo: true, // IMPORTANT for provenance
        consentGiven: true,
        ageRange: '18-25',
        district,
        state: 'Maharashtra',
        education,
        currentWork: 'Kheti',
        skills: ['farming', 'manual labor'],
        workPreference: Math.random() > 0.5 ? 'self' : 'wage',
        localOpportunitiesReported: ['dairy', 'shop']
      });
      await b.save();

      // Generate random recommendations from what's in DB
      const recs = [];
      if (courses.length > 0) {
        recs.push({
          type: 'course',
          refId: courses[Math.floor(Math.random() * courses.length)]._id,
          reason: 'Synthetic match for demo based on ' + education,
          skillGap: 'Needs basic computer literacy',
          fitFlags: { aspirationMatch: 'good', localOpportunityMatch: 'good' },
          rank: 1
        });
      }

      const c = new Conversation({
        sessionId,
        beneficiaryId: b._id,
        channel,
        language: 'hi',
        state: 'END',
        status: 'completed',
        recommendations: recs,
        turns: [
          { role: 'bot', text: 'Namaste! Welcome.', at: new Date(Date.now() - 10000) },
          { role: 'user', text: '(Synthetic demo transcript)', at: new Date() }
        ],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) // Random date within last 10 days
      });
      await c.save();
    }

    console.log('✅ Generated 50 demo conversations successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
