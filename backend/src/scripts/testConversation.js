/**
 * Quick test script for the conversation engine (MOCK_AI mode)
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { handleMessage } = require('../services/conversationEngine');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  console.log('--- Test 1: New conversation (welcome) ---');
  const r1 = await handleMessage({ text: 'start', channel: 'test' });
  console.log('Bot:', r1.botText);
  console.log('State:', r1.state);
  console.log('SessionId:', r1.sessionId);
  console.log('');

  console.log('--- Test 2: Give consent ---');
  const r2 = await handleMessage({ sessionId: r1.sessionId, text: 'haan ji', channel: 'test' });
  console.log('Bot:', r2.botText);
  console.log('State:', r2.state);
  console.log('');

  console.log('--- Test 3: Give location ---');
  const r3 = await handleMessage({ sessionId: r1.sessionId, text: 'Main Lucknow UP se hoon', channel: 'test' });
  console.log('Bot:', r3.botText);
  console.log('State:', r3.state);
  console.log('');

  console.log('--- Test 4: Give age ---');
  const r4 = await handleMessage({ sessionId: r1.sessionId, text: 'Meri umr 25 saal hai', channel: 'test' });
  console.log('Bot:', r4.botText);
  console.log('State:', r4.state);
  console.log('');

  console.log('=== All tests completed! ===');
  await mongoose.disconnect();
  process.exit(0);
}

test().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
