/**
 * conversationEngine.js — The state machine that drives the conversation
 * 
 * States: START → CONSENT → ASK_LOCATION → ASK_AGE → ASK_EDUCATION
 *   → ASK_CURRENT_WORK → ASK_SKILLS → ASK_INTEREST → ASK_WORK_PREFERENCE
 *   → ASK_MOBILITY_AND_CONSTRAINTS → ASK_LOCAL_OPPORTUNITIES
 *   → CONFIRM_PROFILE → RECOMMEND → FOLLOWUP → END
 */
const { v4: uuidv4 } = require('uuid');
const Conversation = require('../models/Conversation');
const Beneficiary = require('../models/Beneficiary');
const { extractProfile, findMissingFields } = require('./profileExtractor');
const { getRecommendations, buildProfileSummary } = require('./recommender');
const { generateResponse } = require('./responseGenerator');
const messagesHi = require('./messages.hi');

// Ordered states for the conversation flow
const STATES = [
  'START',
  'CONSENT',
  'ASK_LOCATION',
  'ASK_AGE',
  'ASK_EDUCATION',
  'ASK_CURRENT_WORK',
  'ASK_SKILLS',
  'ASK_INTEREST',
  'ASK_WORK_PREFERENCE',
  'ASK_MOBILITY_AND_CONSTRAINTS',
  'ASK_LOCAL_OPPORTUNITIES',
  'CONFIRM_PROFILE',
  'RECOMMEND',
  'FOLLOWUP',
  'END',
];

// Map states to the profile fields they collect
const STATE_FIELD_MAP = {
  ASK_LOCATION: ['state', 'district', 'villageOrBlock'],
  ASK_AGE: ['ageRange'],
  ASK_EDUCATION: ['education'],
  ASK_CURRENT_WORK: ['currentWork', 'traditionalOccupation'],
  ASK_SKILLS: ['skills'],
  ASK_INTEREST: ['interests'],
  ASK_WORK_PREFERENCE: ['workPreference'],
  ASK_MOBILITY_AND_CONSTRAINTS: ['willingToMigrate', 'travelRadiusKm', 'physicalConstraints'],
  ASK_LOCAL_OPPORTUNITIES: ['localOpportunitiesReported'],
};

// Message keys for each state
const STATE_MSG_MAP = {
  START: 'welcome',
  CONSENT: 'consent',
  ASK_LOCATION: 'askLocation',
  ASK_AGE: 'askAge',
  ASK_EDUCATION: 'askEducation',
  ASK_CURRENT_WORK: 'askCurrentWork',
  ASK_SKILLS: 'askSkills',
  ASK_INTEREST: 'askInterest',
  ASK_WORK_PREFERENCE: 'askWorkPreference',
  ASK_MOBILITY_AND_CONSTRAINTS: 'askMobilityConstraints',
  ASK_LOCAL_OPPORTUNITIES: 'askLocalOpportunities',
  CONFIRM_PROFILE: 'confirmProfile',
  RECOMMEND: 'recommend',
  FOLLOWUP: 'followup',
  END: 'end',
};

const MAX_TURNS = parseInt(process.env.MAX_TURNS_PER_SESSION) || 30;

/**
 * Handle an incoming message for a conversation session
 * @param {Object} params - { sessionId, channel, text, language }
 * @returns {Object} { sessionId, botText, state, profileSummary, recommendations }
 */
async function handleMessage({ sessionId, channel = 'web', text, language = 'hi' }) {
  // Generate sessionId if not provided
  if (!sessionId) sessionId = uuidv4();

  // Load or create conversation + beneficiary
  let conversation = await Conversation.findOne({ sessionId });
  let beneficiary;

  if (!conversation) {
    // New conversation — create both
    beneficiary = new Beneficiary({
      sessionId,
      channel,
      language,
      isDemo: false,
    });
    await beneficiary.save();

    conversation = new Conversation({
      sessionId,
      beneficiaryId: beneficiary._id,
      channel,
      language,
      state: 'START',
      turns: [],
      recommendations: [],
      status: 'in_progress',
    });
    await conversation.save();

    // Return welcome message using LLM to respect the selected language
    const botText = await generateResponse(text, 'START', language, beneficiary.toObject());
    conversation.turns.push({ role: 'bot', text: botText, at: new Date() });
    conversation.state = 'CONSENT';
    await conversation.save();

    return {
      sessionId,
      botText,
      state: 'CONSENT',
    };
  }

  // Existing conversation
  beneficiary = await Beneficiary.findById(conversation.beneficiaryId);
  if (!beneficiary) {
    throw new Error('Beneficiary not found for session: ' + sessionId);
  }

  // Check max turns
  if (conversation.turns.length >= MAX_TURNS) {
    const botText = messagesHi.error.maxTurns;
    conversation.turns.push({ role: 'user', text, at: new Date() });
    conversation.turns.push({ role: 'bot', text: botText, at: new Date() });
    conversation.status = 'completed';
    await conversation.save();
    return { sessionId, botText, state: 'END' };
  }

  // Record user turn
  conversation.turns.push({ role: 'user', text, at: new Date() });

  // Process based on current state
  const result = await processState(conversation, beneficiary, text, language);

  // Record bot turn
  conversation.turns.push({ role: 'bot', text: result.botText, at: new Date() });
  conversation.state = result.nextState;
  
  if (result.nextState === 'END') {
    conversation.status = 'completed';
  }
  if (result.recommendations) {
    conversation.recommendations = result.recommendations;
  }

  await conversation.save();
  await beneficiary.save();

  return {
    sessionId,
    botText: result.botText,
    state: result.nextState,
    profileSummary: result.profileSummary || null,
    recommendations: result.recommendations || null,
  };
}

/**
 * Process the current state and return the bot's response + next state
 */
async function processState(conversation, beneficiary, userText, language) {
  const currentState = conversation.state;
  const msgs = messagesHi;

  // -- CONSENT state --
  if (currentState === 'CONSENT') {
    const positive = isPositiveResponse(userText);
    console.log('[Engine] CONSENT state, positive:', positive);
    if (positive) {
      beneficiary.consentGiven = true;
      const botText = await generateResponse(userText, 'ASK_LOCATION', language, beneficiary.toObject());
      return {
        botText,
        nextState: 'ASK_LOCATION',
      };
    } else {
      beneficiary.consentGiven = false;
      const botText = await generateResponse(userText, 'END', language, beneficiary.toObject());
      return {
        botText,
        nextState: 'END',
      };
    }
  }

  // -- CONFIRM_PROFILE state --
  if (currentState === 'CONFIRM_PROFILE') {
    const positive = isPositiveResponse(userText);
    console.log('[Engine] CONFIRM_PROFILE state, positive:', positive, '| userText:', userText);
    if (positive) {
      // Profile confirmed — get recommendations
      return await generateRecommendations(beneficiary, msgs, language);
    } else {
      // Ask what's wrong
      const botText = await generateResponse(userText, 'ASK_LOCATION', language, beneficiary.toObject());
      return {
        botText,
        nextState: 'ASK_LOCATION', // Go back to re-ask
      };
    }
  }

  // -- FOLLOWUP state --
  if (currentState === 'FOLLOWUP') {
    const wantsMore = userText.toLowerCase().includes('aur') || 
                      userText.toLowerCase().includes('dikhao') ||
                      userText.toLowerCase().includes('more');
    if (wantsMore) {
      return await generateRecommendations(beneficiary, msgs, language);
    } else {
      const botText = await generateResponse(userText, 'END', language, beneficiary.toObject());
      return {
        botText,
        nextState: 'END',
      };
    }
  }

  // -- RECOMMEND state (user responded after seeing recommendations) --
  if (currentState === 'RECOMMEND') {
    const botText = await generateResponse(userText, 'FOLLOWUP', language, beneficiary.toObject());
    return {
      botText,
      nextState: 'FOLLOWUP',
    };
  }

  // -- All ASK_* states: extract profile and advance --
  console.log('[Engine] ASK state:', currentState, '| Extracting profile...');
  const history = conversation.turns.map(t => ({ role: t.role, text: t.text }));
  const profileObj = beneficiary.toObject();
  
  const extraction = await extractProfile(userText, profileObj, history);
  console.log('[Engine] Extracted fields:', JSON.stringify(extraction.extractedFields));

  // Update beneficiary with extracted fields
  for (const [key, value] of Object.entries(extraction.extractedFields)) {
    if (value !== null && value !== undefined) {
      // For arrays, merge instead of replace
      if (Array.isArray(value) && Array.isArray(beneficiary[key])) {
        const existing = beneficiary[key] || [];
        const merged = [...new Set([...existing, ...value])];
        beneficiary[key] = merged;
      } else {
        beneficiary[key] = value;
      }
    }
  }

  // Update confidence
  if (extraction.confidence) {
    if (!beneficiary.fieldConfidence) beneficiary.fieldConfidence = new Map();
    for (const [key, val] of Object.entries(extraction.confidence)) {
      beneficiary.fieldConfidence.set(key, val);
    }
  }

  // Determine next state: skip states whose fields are already filled
  const nextState = findNextState(currentState, beneficiary);
  console.log('[Engine] Current:', currentState, '→ Next:', nextState);
  console.log('[Engine] Profile snapshot:', JSON.stringify({
    state: beneficiary.state,
    district: beneficiary.district,
    ageRange: beneficiary.ageRange,
    education: beneficiary.education,
    currentWork: beneficiary.currentWork,
    skills: beneficiary.skills,
    interests: beneficiary.interests,
    workPreference: beneficiary.workPreference,
    willingToMigrate: beneficiary.willingToMigrate,
    localOpportunitiesReported: beneficiary.localOpportunitiesReported,
  }));

  // If we've collected enough, go to CONFIRM_PROFILE
  if (nextState === 'CONFIRM_PROFILE') {
    const summary = buildHindiProfileSummary(beneficiary);
    const botText = await generateResponse(userText, 'CONFIRM_PROFILE', language, beneficiary.toObject(), summary);
    return {
      botText,
      nextState: 'CONFIRM_PROFILE',
      profileSummary: summary,
    };
  }

  // Use LLM to generate the final string
  const botText = await generateResponse(userText, nextState, language, beneficiary.toObject());

  return {
    botText,
    nextState,
  };
}

/**
 * Find the next state, skipping states whose fields are already filled
 */
function findNextState(currentState, beneficiary) {
  const currentIdx = STATES.indexOf(currentState);
  
  for (let i = currentIdx + 1; i < STATES.length; i++) {
    const state = STATES[i];
    
    // Special states always visit
    if (['CONFIRM_PROFILE', 'RECOMMEND', 'FOLLOWUP', 'END'].includes(state)) {
      return state;
    }

    // Check if this state's fields are already filled
    const fields = STATE_FIELD_MAP[state];
    if (!fields) return state; // No field map means we always visit

    const allFilled = fields.every(field => {
      const val = beneficiary[field];
      if (val === null || val === undefined || val === '' || val === 'unknown') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

    if (!allFilled) return state; // Found a state that needs data
  }

  return 'CONFIRM_PROFILE'; // All fields filled
}

/**
 * Generate recommendations and format the response
 */
async function generateRecommendations(beneficiary, msgs, language) {
  console.log('[Engine] ★ GENERATING RECOMMENDATIONS ★');
  const profile = beneficiary.toObject();
  const results = await getRecommendations(profile);
  console.log('[Engine] Recommendations result:', results.courses.length, 'courses,', results.livelihoods.length, 'livelihoods');

  if (results.courses.length === 0 && results.livelihoods.length === 0) {
    return {
      botText: await require('./responseGenerator').generateResponse('I want recommendations', 'FOLLOWUP', language, profile, 'No recommendations found.'),
      nextState: 'FOLLOWUP',
      recommendations: [],
    };
  }

  const rawTextForLLM = `I found ${results.courses.length} courses and ${results.livelihoods.length} livelihoods.\n` +
    `Courses: ${results.courses.map(r => r.title || r.refId).join(', ')}.\n` +
    `Livelihoods: ${results.livelihoods.map(r => r.title || r.refId).join(', ')}.\n` +
    `Disclaimer: These are just suggestions. Confirm with an officer.`;

  const botText = await require('./responseGenerator').generateResponse('I want recommendations', 'RECOMMEND', language, profile, rawTextForLLM);

  // Format recommendations for storage
  const storedRecs = [
    ...results.courses.map(r => ({ type: 'course', ...r })),
    ...results.livelihoods.map(r => ({ type: 'livelihood', ...r })),
  ];

  return {
    botText,
    nextState: 'RECOMMEND',
    recommendations: storedRecs,
    profileSummary: buildProfileSummary(profile),
  };
}

/**
 * Check if user response is positive (yes/haan/ok/theek hai etc.)
 */
function isPositiveResponse(text) {
  const lower = text.toLowerCase().trim();
  const positives = [
    'haan', 'ha', 'haa', 'ji', 'ji haan', 'yes', 'ok', 'okay',
    'theek', 'thik', 'theek hai', 'sahi', 'sahi hai', 'bilkul',
    'zaroor', 'han', 'hmm', 'ho', 'achha', 'yup', 'yeah', 'y',
    'हाँ', 'हा', 'जी', 'ठीक', 'सही', 'बिलकुल', 'ज़रूर', 'अच्छा'
  ];
  return positives.some(p => lower.includes(p));
}

/**
 * Build a Hindi profile summary for CONFIRM_PROFILE
 */
function buildHindiProfileSummary(beneficiary) {
  const parts = [];
  if (beneficiary.district) parts.push(`aap ${beneficiary.district} se hain`);
  if (beneficiary.ageRange) parts.push(`umr ${beneficiary.ageRange} saal`);
  if (beneficiary.education && beneficiary.education !== 'unknown') {
    parts.push(`${beneficiary.education} pass hain`);
  }
  if (beneficiary.currentWork) parts.push(`${beneficiary.currentWork} ka kaam karte hain`);
  if (beneficiary.skills?.length) parts.push(`aapko ${beneficiary.skills.join(', ')} aata hai`);
  if (beneficiary.interests?.length) parts.push(`aapko ${beneficiary.interests.join(', ')} mein interest hai`);
  if (beneficiary.workPreference && beneficiary.workPreference !== 'unknown') {
    const prefMap = { 'self': 'apna khud ka kaam', 'wage': 'naukri', 'either': 'dono chalega' };
    parts.push(`aap ${prefMap[beneficiary.workPreference] || beneficiary.workPreference} chahte hain`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Abhi zyada jaankari nahi hai';
}

/**
 * Fill template placeholders like {district}, {education} etc.
 */
function fillTemplate(template, beneficiary) {
  return template
    .replace('{district}', beneficiary.district || 'aapka area')
    .replace('{ageRange}', beneficiary.ageRange || '')
    .replace('{education}', beneficiary.education || '')
    .replace('{currentWork}', beneficiary.currentWork || 'kaam')
    .replace('{skills}', (beneficiary.skills || []).join(', ') || 'skills')
    .replace('{interests}', (beneficiary.interests || []).join(', ') || 'interests')
    .replace('{workPreference}', beneficiary.workPreference || '')
    .replace('{localOpportunities}', (beneficiary.localOpportunitiesReported || []).join(', ') || 'kuch kaam');
}

module.exports = { handleMessage };
