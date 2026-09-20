/**
 * llm.js — Provider-abstracted LLM service
 * Default: OpenRouter (OpenAI-compatible API)
 * Supports MOCK_AI=true for development without API spend
 */
const axios = require('axios');



/**
 * Send a chat completion request to the configured LLM provider
 * @param {Array} messages - Array of { role, content } message objects
 * @param {Object} options - Optional: temperature, maxTokens, jsonMode
 * @returns {string} The assistant's reply text
 */
async function chatCompletion(messages, options = {}) {
  if (process.env.MOCK_AI === 'true') {
    return getMockResponse(messages);
  }

  const provider = process.env.LLM_PROVIDER || 'openrouter';

  if (provider === 'openrouter') {
    return openRouterCompletion(messages, options);
  }

  // Future: add 'google', 'bhashini' etc.
  throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
}

/**
 * OpenRouter chat completion
 */
async function openRouterCompletion(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_LLM_MODEL;

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in .env');
  if (!model) throw new Error('OPENROUTER_LLM_MODEL is not set in .env');

  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  };

  // Some models support response_format for JSON mode
  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const response = await axios.post(`${baseUrl}/chat/completions`, body, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pm-ajay-assistant.local',
        'X-Title': 'PM-AJAY Voice Assistant',
      },
      timeout: 30000,
    });

    const choice = response.data.choices?.[0];
    if (!choice) throw new Error('No choices in LLM response');

    // Log usage for cost tracking
    const usage = response.data.usage;
    if (usage) {
      console.log(`[LLM] Model: ${model} | Tokens: ${usage.prompt_tokens} in, ${usage.completion_tokens} out`);
    }

    return choice.message.content;
  } catch (err) {
    if (err.response) {
      console.error('[LLM] API Error:', err.response.status, JSON.stringify(err.response.data));
      throw new Error(`LLM API error: ${err.response.status} - ${err.response.data?.error?.message || 'Unknown error'}`);
    }
    throw err;
  }
}

/**
 * Mock response for MOCK_AI=true mode
 * Returns canned responses based on the last user message
 */
function getMockResponse(messages) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const content = lastUserMsg?.content || '';

  // If the system prompt asks for JSON, return mock JSON
  const systemMsg = messages.find(m => m.role === 'system');
  if (systemMsg && systemMsg.content.includes('JSON')) {
    return JSON.stringify({
      extractedFields: {
        education: '10th',
        currentWork: 'silai',
        skills: ['tailoring', 'sewing'],
        interests: ['tailoring'],
        workPreference: 'self',
        willingToMigrate: false,
        district: 'sample district',
        state: 'sample state',
      },
      confidence: {
        education: 0.9,
        currentWork: 0.8,
        skills: 0.8,
        interests: 0.7,
        workPreference: 0.7,
      },
      missingFields: ['ageRange', 'name'],
    });
  }

  // Default conversational mock
  return 'Achha, samajh gaya. Aap aur batayiye.';
}

module.exports = { chatCompletion };
