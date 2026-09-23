/**
 * responseGenerator.js — Generates natural conversational responses using LLM
 */
const { chatCompletion } = require('./llm');
const messagesHi = require('./messages.hi'); // Fallback map to understand the intent of the next state

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

/**
 * Generate a natural bot response using LLM
 * @param {string} userText - What the user just said
 * @param {string} nextState - The next state the engine wants to go to
 * @param {string} language - Target language (hindi, english, hinglish)
 * @param {Object} beneficiary - Profile context
 * @param {string} profileSummary - Only provided for CONFIRM_PROFILE
 * @returns {string} Natural conversational string
 */
async function generateResponse(userText, nextState, language, beneficiary, profileSummary = '') {
  const targetLang = language ? language.toLowerCase() : 'hindi';
  const STATE_INTENTS = {
    CONSENT: 'Ask the user if they are ready to share their information to start the process.',
    ASK_LOCATION: 'Ask the user where they live (village/city, district, and state).',
    ASK_AGE: 'Ask the user for their age or an estimate of their age.',
    ASK_EDUCATION: 'Ask the user about their highest level of education (e.g., 5th pass, 10th pass, etc.).',
    ASK_CURRENT_WORK: 'Ask the user what work they currently do, or if they are unemployed.',
    ASK_SKILLS: 'Ask the user what skills they have (e.g., sewing, farming, computer, cooking).',
    ASK_INTEREST: 'Ask the user what kind of work they like to do or want to learn.',
    ASK_WORK_PREFERENCE: 'Ask the user if they prefer self-employment (their own business) or wage employment (a job).',
    ASK_MOBILITY_AND_CONSTRAINTS: 'Ask the user if they are willing to travel for work outside their village, and if they have any constraints.',
    ASK_LOCAL_OPPORTUNITIES: 'Ask the user what kind of businesses or jobs are popular in their local area.',
    FOLLOWUP: 'Ask the user if they want to know anything else or see more options.',
    END: 'Thank the user, say goodbye, and tell them they can return anytime.'
  };

  let stateContext = `You need to ask the user: "${STATE_INTENTS[nextState] || 'How can I help you?'}"`;
  
  if (nextState === 'CONFIRM_PROFILE') {
    stateContext = `Summarize their profile accurately: "${profileSummary}". Ask them if this is correct.`;
  } else if (nextState === 'START') {
    stateContext = `Welcome the user to Sahayak, tell them you will help find training and work, and ask if they are ready to talk.`;
  } else if (nextState === 'RECOMMEND') {
    stateContext = `OUTPUT THE FOLLOWING EXACTLY AS FORMATTED:
\`\`\`
${profileSummary}
\`\`\`
DO NOT summarize or skip any fields. Maintain the exact bullet points, line breaks, and structure. Only translate the labels into the target language if needed. Ensure the disclaimer is always present at the bottom.`;
  }

  let languageInstructions = '';
  if (targetLang === 'english') {
    languageInstructions = 'You MUST reply STRICTLY in ENGLISH ONLY. Do NOT use any Hindi words. Ignore the language the user is speaking; even if they speak in Hindi, you must reply in English.';
  } else if (targetLang === 'hindi') {
    languageInstructions = 'You MUST reply STRICTLY in PURE HINDI using DEVANAGARI SCRIPT ONLY (e.g., नमस्ते). Do NOT use English script (Latin) and do NOT use English words. Ignore the language the user is speaking; even if they speak in English or Hinglish, you must reply in Devanagari Hindi.';
  } else {
    languageInstructions = 'You MUST reply STRICTLY in HINGLISH (a natural mix of Hindi and English written in ENGLISH/LATIN SCRIPT ONLY, e.g., "Aap kaise ho?"). Do NOT use Devanagari script. Ignore the language the user is speaking; even if they speak in pure English or pure Hindi, you must reply in Hinglish.';
  }

  const systemPrompt = `You are Sahayak, a friendly, empathetic AI career assistant for PM-AJAY beneficiaries.
Your goal is to converse naturally with the user.

CRITICAL INSTRUCTION FOR LANGUAGE:
The selected Target Language is: **${targetLang.toUpperCase()}**.
${languageInstructions}

Current User Profile: ${JSON.stringify(beneficiary || {})}

Instructions:
1. The user just said: "\${userText}" (Ignore the language of this text. Your output MUST follow the CRITICAL INSTRUCTION FOR LANGUAGE above).
2. Briefly and naturally acknowledge what they said in 1 short sentence. Ignore spelling mistakes/typos in their text.
3. Then, transition smoothly and ask the NEXT required question based on this instruction: ${stateContext}
4. Keep your response very concise, friendly, and conversational (under 3 sentences total).
5. Do NOT include markdown, emojis, or any internal thoughts. Output only the spoken text.`;

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  try {
    const raw = await chatCompletion(messages, { temperature: 0.3 });
    return raw.trim();
  } catch (err) {
    console.error('[ResponseGenerator] LLM failed, falling back to static template:', err.message);
    // Fallback logic
    if (nextState === 'CONFIRM_PROFILE' && profileSummary) {
      return messagesHi.confirmProfile.question.replace('{profileSummary}', profileSummary);
    }
    const msgKey = STATE_MSG_MAP[nextState];
    return msgKey ? messagesHi[msgKey].question : 'How can I help you?';
  }
}

module.exports = { generateResponse };
