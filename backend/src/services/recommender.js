/**
 * recommender.js — Recommendation engine
 * 
 * Pipeline:
 * 1. Hard filters (plain JS) — education, NSQF, district, work preference
 * 2. Candidate pool — top courses + livelihoods after filters
 * 3. LLM ranking — top 3 courses + 2 livelihoods with Hindi reason
 * 4. Validation — every returned ID must exist in candidate list
 * 5. Fit flags — aspiration, education, mobility, local opportunity match
 */
const Course = require('../models/Course');
const Livelihood = require('../models/Livelihood');
const { chatCompletion } = require('./llm');

// Education hierarchy for comparison
const EDU_ORDER = { 'none': 0, '5th': 1, '8th': 2, '10th': 3, '12th': 4, 'graduate': 5 };

/**
 * Get recommendations for a beneficiary profile
 * @param {Object} profile - Beneficiary profile object
 * @returns {Object} { courses: [...], livelihoods: [...], rawText: string }
 */
async function getRecommendations(profile) {
  // Step 1 & 2: Get filtered candidates
  const candidateCourses = await filterCourses(profile);
  const candidateLivelihoods = await filterLivelihoods(profile);

  if (candidateCourses.length === 0 && candidateLivelihoods.length === 0) {
    return { courses: [], livelihoods: [], rawText: null };
  }

  // Step 3: LLM ranking
  const ranked = await llmRank(profile, candidateCourses, candidateLivelihoods);

  // Step 4: Validate IDs exist in candidate list
  const validCourses = validateIds(ranked.courses, candidateCourses);
  const validLivelihoods = validateIds(ranked.livelihoods, candidateLivelihoods);

  // Step 5: Compute fit flags for each recommendation
  const coursesWithFlags = validCourses.map(rec => ({
    ...rec,
    fitFlags: computeFitFlags(rec, profile, 'course'),
  }));
  const livelihoodsWithFlags = validLivelihoods.map(rec => ({
    ...rec,
    fitFlags: computeFitFlags(rec, profile, 'livelihood'),
  }));

  return {
    courses: coursesWithFlags,
    livelihoods: livelihoodsWithFlags,
  };
}

/**
 * Step 1: Filter courses based on hard rules
 */
async function filterCourses(profile) {
  const userEdu = EDU_ORDER[profile.education] ?? 0;

  // Fetch all courses
  const allCourses = await Course.find().lean();

  return allCourses.filter(course => {
    // Education filter: course.minEducation must be <= user's education
    const courseEdu = EDU_ORDER[course.minEducation] ?? 0;
    if (courseEdu > userEdu) return false;

    // NSQF level cap: avoid level > 4 for <= 8th pass (unless tagged relevant)
    if (userEdu <= 2 && course.nsqfLevel > 4) return false;

    return true;
  }).slice(0, 15); // Take top 15 candidates
}

/**
 * Step 1: Filter livelihoods based on hard rules
 */
async function filterLivelihoods(profile) {
  const allLivelihoods = await Livelihood.find().lean();

  return allLivelihoods.filter(livelihood => {
    // District/state match (fallback: same state)
    if (profile.district && livelihood.district) {
      const profileDist = profile.district.toLowerCase().trim();
      const livDist = livelihood.district.toLowerCase().trim();
      const livState = (livelihood.state || '').toLowerCase().trim();
      const profileState = (profile.state || '').toLowerCase().trim();

      // Exact district match OR same state
      if (profileDist !== livDist && profileState !== livState) {
        return false;
      }
    }

    // Education filter
    const userEdu = EDU_ORDER[profile.education] ?? 0;
    const livEdu = EDU_ORDER[livelihood.minEducation] ?? 0;
    if (livEdu > userEdu) return false;

    // Work preference filter
    if (profile.workPreference === 'self' && livelihood.type === 'wage') return false;
    if (profile.workPreference === 'wage' && livelihood.type === 'self-employment') return false;

    return true;
  }).slice(0, 8); // Take top 8 candidates
}

/**
 * Step 3: Ask LLM to rank candidates and provide Hindi reasons
 */
async function llmRank(profile, courses, livelihoods) {
  const profileSummary = buildProfileSummary(profile);
  const courseList = courses.map((c, i) => 
    `ID:${c._id} | ${c.title} | Sector:${c.sector} | NSQF:${c.nsqfLevel} | Jobs:${(c.jobRoles || []).join(', ')} | Tags:${(c.tags || []).join(', ')}`
  ).join('\n');
  const livelihoodList = livelihoods.map((l, i) =>
    `ID:${l._id} | ${l.title} | Type:${l.type} | Sector:${l.sector} | Skills:${(l.requiredSkills || []).join(', ')} | Demand:${l.demandSignal || 'unknown'}`
  ).join('\n');

  const systemPrompt = `You are a livelihood recommendation assistant for rural Indian beneficiaries.
Given a beneficiary profile and candidate lists, pick the BEST matches.

Return ONLY valid JSON in this exact format:
{
  "courses": [
    {
      "refId": "the exact _id from the list",
      "reason": "2 sentence Hindi/Hinglish explanation why this suits the person",
      "skillGap": "what the person still needs to learn for this (Hindi, 1 sentence, or 'none')",
      "nextStep": "specific next action in Hindi (e.g., 'Najdiki ITI mein puchein')",
      "rank": 1
    }
  ],
  "livelihoods": [
    {
      "refId": "the exact _id from the list",
      "reason": "2 sentence Hindi/Hinglish explanation",
      "skillGap": "what they need (Hindi)",
      "nextStep": "next action (Hindi)",
      "rank": 1
    }
  ]
}

Rules:
1. Pick at most 3 courses and 2 livelihoods. Fewer is OK if the match is poor.
2. Rank by how well the option matches the person's skills, interests, education, and location.
3. Reasons MUST be in simple Hindi — the person has low literacy.
4. skillGap: compare person's skills/education with what the course/livelihood needs. If unknown, say "pata nahi".
5. ONLY use IDs from the provided lists. Never invent an ID.
6. If no good match exists, return empty arrays.`;

  const userPrompt = `BENEFICIARY PROFILE:
${profileSummary}

CANDIDATE COURSES:
${courseList || '(none available)'}

CANDIDATE LIVELIHOODS:
${livelihoodList || '(none available)'}

Pick the best matches and return JSON.`;

  try {
    const raw = await chatCompletion(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.2, jsonMode: true }
    );

    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(cleaned);
    return {
      courses: parsed.courses || [],
      livelihoods: parsed.livelihoods || [],
    };
  } catch (err) {
    console.error('[Recommender] LLM ranking failed:', err.message);
    // Fallback: return first few candidates without LLM ranking
    return {
      courses: courses.slice(0, 3).map((c, i) => ({
        refId: c._id.toString(),
        reason: 'Aapki education aur skills ke hisaab se yeh option theek ho sakta hai.',
        skillGap: 'Pata nahi',
        nextStep: 'Training centre se jaankari lein.',
        rank: i + 1,
      })),
      livelihoods: livelihoods.slice(0, 2).map((l, i) => ({
        refId: l._id.toString(),
        reason: 'Aapke area mein yeh kaam ka option ho sakta hai.',
        skillGap: 'Pata nahi',
        nextStep: 'Local officer se baat karein.',
        rank: i + 1,
      })),
    };
  }
}

/**
 * Step 4: Validate that returned IDs exist in the candidate list
 */
function validateIds(recommendations, candidates) {
  const validIds = new Set(candidates.map(c => c._id.toString()));
  return recommendations.filter(rec => {
    if (!rec.refId) return false;
    const id = rec.refId.toString();
    if (!validIds.has(id)) {
      console.warn(`[Recommender] Dropping invalid ID: ${id}`);
      return false;
    }
    return true;
  });
}

/**
 * Step 5: Compute fit flags for a recommendation
 */
function computeFitFlags(rec, profile, type) {
  const flags = {
    aspirationMatch: 'unknown',
    educationMatch: 'unknown',
    mobilityMatch: 'unknown',
    localOpportunityMatch: 'unknown',
  };

  // Aspiration match — check if user's interests/skills overlap with the recommendation
  if (profile.interests && profile.interests.length > 0) {
    // We can't perfectly check without course details here, but if the LLM picked it, it's at least partial
    flags.aspirationMatch = 'partial';
  }

  // Education match
  if (profile.education && profile.education !== 'unknown') {
    flags.educationMatch = 'good'; // Already passed hard filter
  }

  // Mobility match
  if (profile.willingToMigrate !== null && profile.willingToMigrate !== undefined) {
    flags.mobilityMatch = profile.willingToMigrate ? 'good' : 'partial';
  }

  // Local opportunity match
  if (profile.localOpportunitiesReported && profile.localOpportunitiesReported.length > 0) {
    flags.localOpportunityMatch = 'partial';
  }

  return flags;
}

/**
 * Build a readable profile summary for the LLM
 */
function buildProfileSummary(profile) {
  const parts = [];
  if (profile.ageRange) parts.push(`Age: ${profile.ageRange}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.education) parts.push(`Education: ${profile.education}`);
  if (profile.state) parts.push(`State: ${profile.state}`);
  if (profile.district) parts.push(`District: ${profile.district}`);
  if (profile.currentWork) parts.push(`Current work: ${profile.currentWork}`);
  if (profile.traditionalOccupation) parts.push(`Traditional occupation: ${profile.traditionalOccupation}`);
  if (profile.skills?.length) parts.push(`Skills: ${profile.skills.join(', ')}`);
  if (profile.interests?.length) parts.push(`Interests: ${profile.interests.join(', ')}`);
  if (profile.workPreference) parts.push(`Work preference: ${profile.workPreference}`);
  if (profile.willingToMigrate !== null && profile.willingToMigrate !== undefined) {
    parts.push(`Willing to migrate: ${profile.willingToMigrate ? 'yes' : 'no'}`);
  }
  if (profile.travelRadiusKm) parts.push(`Travel radius: ${profile.travelRadiusKm} km`);
  if (profile.physicalConstraints?.length) parts.push(`Physical constraints: ${profile.physicalConstraints.join(', ')}`);
  if (profile.localOpportunitiesReported?.length) parts.push(`Local opportunities reported: ${profile.localOpportunitiesReported.join(', ')}`);
  if (profile.incomeExpectation) parts.push(`Income expectation: ${profile.incomeExpectation}`);
  return parts.join('\n') || 'No profile data yet.';
}

module.exports = { getRecommendations, buildProfileSummary };
