/**
 * stt.js — Speech-to-Text service
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');



/**
 * Transcribe an audio file using the configured STT provider
 * @param {string} filePath - Absolute path to the saved audio file
 * @param {string} language - The selected language (e.g. 'hindi', 'english')
 * @returns {string} Transcribed text
 */
async function transcribeAudio(filePath, language = 'hindi') {
  if (process.env.MOCK_AI === 'true') {
    console.log('[STT] Mock transcription for:', filePath);
    // Return a dummy Hindi transcript based on the file name or just a generic one
    return "Main 10th pass hoon aur mujhe silai aati hai.";
  }

  const provider = process.env.STT_PROVIDER || 'openrouter';

  if (provider === 'openrouter') {
    return openRouterTranscribe(filePath, language);
  }

  if (provider === 'groq') {
    return groqTranscribe(filePath, language);
  }

  throw new Error(`Unknown STT_PROVIDER: ${provider}`);
}

async function groqTranscribe(filePath, language) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('model', 'whisper-large-v3');
  
  // Set ISO 639-1 language code for Whisper
  const langCode = language.toLowerCase() === 'english' ? 'en' : 'hi';
  form.append('language', langCode);

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    return response.data.text;
  } catch (err) {
    if (err.response) {
      console.error('[STT] Groq API Error:', err.response.status, JSON.stringify(err.response.data));
      throw new Error(`STT Groq API error: ${err.response.status}`);
    }
    throw err;
  }
}

async function openRouterTranscribe(filePath, language) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_STT_MODEL || 'openai/whisper-large-v3'; // fallback if not in env

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('model', model);

  // Whisper accepts 'en', 'hi' etc
  const langCode = language.toLowerCase() === 'english' ? 'en' : 'hi';
  form.append('language', langCode);

  try {
    const response = await axios.post(`${baseUrl}/audio/transcriptions`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pm-ajay-assistant.local',
        'X-Title': 'PM-AJAY Voice Assistant',
      },
      timeout: 30000,
    });

    return response.data.text;
  } catch (err) {
    if (err.response) {
      console.error('[STT] API Error:', err.response.status, JSON.stringify(err.response.data));
      throw new Error(`STT API error: ${err.response.status}`);
    }
    throw err;
  }
}

module.exports = { transcribeAudio };
