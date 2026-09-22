/**
 * chat.routes.js — POST /api/chat/message (Audio + Text)
 */
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { handleMessage } = require('../services/conversationEngine');
const { transcribeAudio } = require('../services/stt');
const { generateSpeech } = require('../services/tts');

const router = express.Router();

// Ensure temp dir exists
const TEMP_DIR = path.join(__dirname, '..', '..', 'tmp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Setup Multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

/**
 * POST /api/chat/message
 * Accepts: JSON { text, sessionId } OR multipart/form-data (audio file + sessionId)
 */
router.post('/message', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    let userText = req.body.text;

    // 1. Process STT if audio was uploaded
    if (req.file) {
      try {
        userText = await transcribeAudio(req.file.path, language);
        // Clean up temp file
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('[Chat Route] STT failed:', err.message);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Speech-to-text failed' });
      }
    }

    // Must have some text at this point
    if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
      return res.status(400).json({ error: 'text or audio is required' });
    }

    // 2. Engine processing
    const result = await handleMessage({
      sessionId: sessionId || null,
      channel: 'web',
      text: userText.trim(),
      language: language || process.env.DEFAULT_LANGUAGE || 'hi',
    });

    // 3. Process TTS for the bot's reply
    try {
      const audioUrl = await generateSpeech(result.botText);
      result.botAudioUrl = audioUrl; // null if failed or mock, frontend will fallback
    } catch (err) {
      console.error('[Chat Route] TTS failed (using text fallback):', err.message);
      result.botAudioUrl = null;
    }

    // Attach what the STT heard so the frontend can display it
    result.userText = userText;

    res.json(result);
  } catch (err) {
    console.error('[Chat Route] Error:', err);
    res.status(500).json({ error: 'Failed to process message', details: err.message });
  }
});

module.exports = router;
