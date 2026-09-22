/**
 * profileExtractor.js — Extracts structured profile fields from conversation text using LLM
 * 
 * Input: latest user message + current partial profile + conversation history
 * Output: { extractedFields, confidence, missingFields }
 */
const { chatCompletion } = require('./llm');

// Education levels in order (for validation)
const EDUCATION_LEVELS = ['none', '5th', '8th', '10th', '12th', 'graduate'];

// All profile fields we want to extract
const ALL_FIELDS = [
  'name', 'ageRange', 'gender', 'state', 'district', 'villageOrBlock',
  'education', 'currentWork', 'traditionalOccupation', 'skills', 'interests',
  'workPreference', 'willingToMigrate', 'travelRadiusKm',
  'physicalConstraints', 'localOpportunitiesReported', 'incomeExpectation',
];

/**
 * Extract profile fields from the conversation so far
 * @param {string} userMessage - The latest user message
 * @param {Object} currentProfile - Current partial Beneficiary profile
 * @param {Array} conversationHistory - Array of { role, text } turns
 * @returns {Object} { extractedFields, confidence, missingFields }
 */
async function extractProfile(userMessage, currentProfile = {}, conversationHistory = []) {
  const systemPrompt = buildExtractionPrompt(currentProfile);
  
  // Build conversation context (last 6 turns max to save tokens)
  const recentHistory = conversationHistory.slice(-6);
  const historyText = recentHistory
    .map(t => `${t.role === 'user' ? 'User' : 'Bot'}: ${t.text}`)
    .join('\n');

  const userPrompt = `Conversation so far:\n${historyText}\n\nLatest user message: "${userMessage}"\n\nExtract all profile fields you can find. Return JSON only.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const raw = await chatCompletion(messages, { temperature: 0.1, jsonMode: true });
    const parsed = parseAndValidate(raw, currentProfile);
    return parsed;
  } catch (err) {
    console.error('[ProfileExtractor] Error:', err.message);
    // On failure, return empty extraction (don't crash the conversation)
    return {
      extractedFields: {},
      confidence: {},
      missingFields: findMissingFields(currentProfile),
    };
  }
}

/**
 * Build the system prompt for profile extraction
 */
function buildExtractionPrompt(currentProfile) {
  return `You are a profile extraction assistant for a Hindi/Hinglish voice conversation system.
Your job is to extract structured profile fields from the user's message.

The user is a beneficiary from an SC community in India. They speak Hindi or Hinglish or English.
Common terms: "dasvi pass" = 10th, "aathvi" = 8th, "silai" = tailoring, "dudh ka kaam" = dairy, "kheti" = farming, "gaon" = village.

CRITICAL INSTRUCTION: You must act as a translator and taxonomy matcher. Regardless of how broken the user's language or spelling is (e.g. "I m intrestd in silai" or "main kheti krta hu"), you MUST map their skills, interests, and current work to EXACT standard English terms (e.g., "tailoring", "farming"). Do NOT output Hindi words in the JSON arrays; translate everything to proper English concepts.

Current known profile:
${JSON.stringify(currentProfile, null, 2)}

Extract ALL fields you can find from the user's message. Return ONLY valid JSON in this exact format:
{
  "extractedFields": {
    "name": "string or null",
    "ageRange": "string like '25-30' or '35' or null",
    "gender": "male/female/other or null",
    "state": "string or null",
    "district": "string or null",
    "villageOrBlock": "string or null",
    "education": "none/5th/8th/10th/12th/graduate or null",
    "currentWork": "string or null",
    "traditionalOccupation": "string or null",
    "skills": ["array of skill strings"] or null,
    "interests": ["array of interest strings"] or null,
    "workPreference": "wage/self/either or null",
    "willingToMigrate": true/false or null,
    "travelRadiusKm": number or null,
    "physicalConstraints": ["array"] or null,
    "localOpportunitiesReported": ["array"] or null,
    "incomeExpectation": "string or null"
  },
  "confidence": {
    "fieldName": 0.0 to 1.0
  },
  "missingFields": ["list of fields still unknown"]
}

Rules:
1. Only include fields you can actually extract from this message. Use null for unknown fields.
2. Do NOT invent or guess information. If unsure, set confidence low and leave null.
3. Map Hindi/Hinglish terms to English field values (e.g. "silai" → skill "tailoring").
4. Education must be one of: none, 5th, 8th, 10th, 12th, graduate.
5. workPreference must be: wage, self, or either.
6. For missingFields, list fields that are still null in the combined profile (current + extracted).
7. Return ONLY the JSON object. No explanation, no markdown.`;
}

/**
 * Parse LLM response and validate the extracted fields
 */
function parseAndValidate(raw, currentProfile) {
  let parsed;
  
  try {
    // Clean up response — remove markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('[ProfileExtractor] Failed to parse JSON:', raw.substring(0, 200));
    return {
      extractedFields: {},
      confidence: {},
      missingFields: findMissingFields(currentProfile),
    };
  }

  const fields = parsed.extractedFields || {};
  const confidence = parsed.confidence || {};

  // Validate education enum
  if (fields.education && !EDUCATION_LEVELS.includes(fields.education)) {
    // Try to map common variations
    const eduMap = {
      '5': '5th', 'fifth': '5th', 'panchvi': '5th',
      '8': '8th', 'eighth': '8th', 'aathvi': '8th',
      '10': '10th', 'tenth': '10th', 'dasvi': '10th', 'matric': '10th',
      '12': '12th', 'twelfth': '12th', 'inter': '12th', 'intermediate': '12th',
      'ba': 'graduate', 'bsc': 'graduate', 'bcom': 'graduate', 'degree': 'graduate',
      'illiterate': 'none', 'no education': 'none', 'padhai nahi': 'none',
    };
    fields.education = eduMap[fields.education.toLowerCase()] || null;
  }

  // Validate workPreference enum
  if (fields.workPreference && !['wage', 'self', 'either', 'unknown'].includes(fields.workPreference)) {
    fields.workPreference = null;
  }

  // Ensure arrays are arrays
  ['skills', 'interests', 'physicalConstraints', 'localOpportunitiesReported'].forEach(key => {
    if (fields[key] && !Array.isArray(fields[key])) {
      fields[key] = [fields[key]];
    }
  });

  // Remove null fields from extracted (we only want real updates)
  const cleanFields = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val !== null && val !== undefined && val !== '') {
      cleanFields[key] = val;
    }
  }

  // Compute missing fields from the merged profile
  const merged = { ...currentProfile, ...cleanFields };
  const missingFields = findMissingFields(merged);

  return {
    extractedFields: cleanFields,
    confidence,
    missingFields,
  };
}

/**
 * Find which important fields are still missing from the profile
 */
function findMissingFields(profile) {
  const required = [
    'district', 'state', 'ageRange', 'education',
    'currentWork', 'skills', 'interests', 'workPreference',
  ];
  const optional = [
    'willingToMigrate', 'localOpportunitiesReported',
  ];

  const missing = [];
  for (const field of required) {
    const val = profile[field];
    if (val === undefined || val === null || val === '' || val === 'unknown') {
      missing.push(field);
    }
    // Empty arrays count as missing
    if (Array.isArray(val) && val.length === 0) {
      missing.push(field);
    }
  }
  // Add optional fields only if we have most required ones
  if (missing.length <= 2) {
    for (const field of optional) {
      const val = profile[field];
      if (val === undefined || val === null) {
        missing.push(field);
      }
    }
  }
  return missing;
}

module.exports = { extractProfile, findMissingFields };
