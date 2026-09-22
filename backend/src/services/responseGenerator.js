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
  const msgKey = STATE_MSG_MAP[nextState];
  const intentQuestion = msgKey ? messagesHi[msgKey].question : 'How can I help you?';

  // Handle special states directly or give explicit instructions
  let stateContext = `You need to ask the user: "${intentQuestion}"`;
  
  if (nextState === 'CONFIRM_PROFILE') {
    stateContext = `Summarize their profile accurately: "${profileSummary}". Ask them if this is correct.`;
  } else if (nextState === 'START') {
    stateContext = `Welcome the user to Shayak, tell them you will help find training and work, and ask if they are ready to talk.`;
  } else if (nextState === 'RECOMMEND') {
    stateContext = `OUTPUT THE FOLLOWING EXACTLY AS FORMATTED:
\`\`\`
${profileSummary}
\`\`\`
DO NOT summarize or skip any fields. Maintain the exact bullet points, line breaks, and structure. Only translate the labels into the target language if needed. Ensure the disclaimer is always present at the bottom.`;
  }

  const systemPrompt = `You are Shayak, a friendly, empathetic AI career assistant for PM-AJAY beneficiaries.
Your goal is to converse naturally with the user.

CRITICAL INSTRUCTION FOR LANGUAGE:
The selected Target Language is: **${targetLang.toUpperCase()}**.
- If ENGLISH: You MUST reply STRICTLY in English only. No Hindi words.
- If HINDI: You MUST reply STRICTLY in Hindi only (using Devanagari or Latin script based on what the user used, but Latin is preferred if unsure).
- If HINGLISH: You MUST reply STRICTLY in Hinglish (a natural mix of Hindi and English written in English script).

Current User Profile: ${JSON.stringify(beneficiary || {})}

Instructions:
1. The user just said: "${userText}"
2. Briefly and naturally acknowledge what they said in 1 short sentence. Ignore spelling mistakes/typos in their text.
3. Then, transition smoothly and ask the NEXT required question: ${stateContext}
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
    return intentQuestion;
  }
}

module.exports = { generateResponse };
