/**
 * tts.js — Text-to-Speech service
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');



// Ensure public directory exists for serving audio files
const PUBLIC_AUDIO_DIR = path.join(__dirname, '..', '..', 'public', 'audio');
if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
  fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
}

/**
 * Generate speech from text
 * @param {string} text - Text to synthesize
 * @returns {string|null} URL path to the generated audio file (e.g. /audio/abc.mp3)
 */
async function generateSpeech(text) {
  if (!text) return null;

  if (process.env.MOCK_AI === 'true') {
    console.log('[TTS] Mock speech generation for text:', text.substring(0, 20) + '...');
    // Return null in mock mode so the frontend knows to fallback to browser TTS automatically
    return null; 
  }

  const provider = process.env.TTS_PROVIDER || 'openrouter';

  if (provider === 'openrouter') {
    return openRouterSpeech(text);
  }

  throw new Error(`Unknown TTS_PROVIDER: ${provider}`);
}

async function openRouterSpeech(text) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  // Note: OpenRouter TTS support is limited. We use a fallback model if none provided.
  const model = process.env.OPENROUTER_TTS_MODEL || 'openai/tts-1'; 
  const voice = process.env.OPENROUTER_TTS_VOICE || 'alloy';
  const format = process.env.OPENROUTER_TTS_FORMAT || 'mp3';

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const body = {
    model,
    input: text,
    voice,
    response_format: format,
  };

  try {
    const response = await axios.post(`${baseUrl}/audio/speech`, body, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pm-ajay-assistant.local',
        'X-Title': 'PM-AJAY Voice Assistant',
      },
      responseType: 'arraybuffer', // Expect binary audio data
      timeout: 30000,
    });

    // Save audio to disk
    const fileName = `${uuidv4()}.${format}`;
    const filePath = path.join(PUBLIC_AUDIO_DIR, fileName);
    fs.writeFileSync(filePath, response.data);

    // Return the relative URL so frontend can fetch it (e.g., http://localhost:5000/audio/xyz.mp3)
    return `/audio/${fileName}`;
  } catch (err) {
    if (err.response) {
      // If responseType is arraybuffer, the error data is also a buffer. We need to convert it to string to read it.
      const errorMsg = err.response.data.toString('utf8');
      console.error('[TTS] API Error:', err.response.status, errorMsg);
      // We return null instead of throwing so the frontend can gracefully fallback to browser TTS
      return null;
    }
    console.error('[TTS] Network Error:', err.message);
    return null;
  }
}

module.exports = { generateSpeech };
