/**
 * benchmarkAudio.js — Test STT and TTS quality (Phase 3 requirement)
 * 
 * Usage: 
 * 1. Put some Hindi audio test files (e.g., test1.wav, test2.m4a) in backend/tmp/test_audio/
 * 2. Run: npm run benchmark:audio
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('../services/stt');
const { generateSpeech } = require('../services/tts');

const TEST_AUDIO_DIR = path.join(__dirname, '..', '..', 'tmp', 'test_audio');
const TEST_TTS_TEXTS = [
  "Namaste. Main samajh gaya ki aap 10th pass hain aur silai ka kaam jaante hain.",
  "Aapke liye Tailoring ka course sabse achha rahega kyunki aapko iska anubhav hai.",
  "Kya aapko apne gaon ke aas-paas koi aur kaam milne ki sambhavna lagti hai?"
];

async function runBenchmark() {
  console.log('=== Audio Benchmark (Phase 3) ===');
  console.log(`STT Provider: ${process.env.STT_PROVIDER}`);
  console.log(`TTS Provider: ${process.env.TTS_PROVIDER}\n`);

  // 1. Benchmark STT
  console.log('--- 1. Testing STT (Speech-to-Text) ---');
  if (!fs.existsSync(TEST_AUDIO_DIR)) {
    fs.mkdirSync(TEST_AUDIO_DIR, { recursive: true });
    console.log(`Created directory: ${TEST_AUDIO_DIR}`);
    console.log('Please put some Hindi test audio files (.wav, .m4a, .ogg) in this directory and run again to test STT.');
  } else {
    const files = fs.readdirSync(TEST_AUDIO_DIR).filter(f => !f.startsWith('.'));
    if (files.length === 0) {
      console.log(`No audio files found in ${TEST_AUDIO_DIR}. Skipping STT test.`);
    } else {
      for (const file of files) {
        const filePath = path.join(TEST_AUDIO_DIR, file);
        console.log(`\nTesting file: ${file}`);
        try {
          const startTime = Date.now();
          const transcript = await transcribeAudio(filePath);
          const latency = Date.now() - startTime;
          console.log(`Transcript: "${transcript}"`);
          console.log(`Latency: ${latency}ms`);
        } catch (error) {
          console.error(`Error transcribing ${file}:`, error.message);
        }
      }
    }
  }

  // 2. Benchmark TTS
  console.log('\n--- 2. Testing TTS (Text-to-Speech) ---');
  let i = 1;
  for (const text of TEST_TTS_TEXTS) {
    console.log(`\nGenerating speech for: "${text}"`);
    try {
      const startTime = Date.now();
      const audioUrl = await generateSpeech(text);
      const latency = Date.now() - startTime;
      
      if (audioUrl) {
        console.log(`Success! Audio saved at relative URL: ${audioUrl}`);
        console.log(`Latency: ${latency}ms`);
      } else {
        console.log(`Generation skipped or failed (check logs).`);
      }
    } catch (error) {
      console.error('Error generating speech:', error.message);
    }
    i++;
  }

  console.log('\n=== Benchmark Complete ===');
}

runBenchmark().catch(console.error);
