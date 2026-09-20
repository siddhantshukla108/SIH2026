/**
 * chatCli.js — Interactive terminal chat for testing the conversation engine
 * 
 * Usage: npm run chat-cli
 * 
 * Type Hindi/Hinglish text and see the bot's response.
 * Type "quit" or "exit" to stop.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const { handleMessage } = require('../services/conversationEngine');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please specify MONGODB_URI in .env');
  process.exit(1);
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let sessionId = null;
  const mockMode = process.env.MOCK_AI === 'true';

  console.log('='.repeat(60));
  console.log('  PM-AJAY Voice Assistant — CLI Chat');
  console.log(`  Mode: ${mockMode ? '🧪 MOCK (no API calls)' : '🌐 LIVE (OpenRouter)'}`);
  console.log('  Type "quit" to exit, "new" for new conversation');
  console.log('='.repeat(60));
  console.log('');

  // Start conversation (first message with no text to get welcome)
  try {
    const welcome = await handleMessage({
      sessionId: null,
      channel: 'cli',
      text: 'start',
      language: 'hi',
    });
    sessionId = welcome.sessionId;
    console.log(`🤖 Bot: ${welcome.botText}\n`);
  } catch (err) {
    console.error('Error starting conversation:', err.message);
    process.exit(1);
  }

  const askQuestion = () => {
    rl.question('👤 You: ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        askQuestion();
        return;
      }

      if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
        console.log('\nBye! 👋');
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === 'new') {
        sessionId = null;
        console.log('\n--- New conversation started ---\n');
        try {
          const welcome = await handleMessage({
            sessionId: null,
            channel: 'cli',
            text: 'start',
            language: 'hi',
          });
          sessionId = welcome.sessionId;
          console.log(`🤖 Bot: ${welcome.botText}\n`);
        } catch (err) {
          console.error('Error:', err.message);
        }
        askQuestion();
        return;
      }

      try {
        const result = await handleMessage({
          sessionId,
          channel: 'cli',
          text: trimmed,
          language: 'hi',
        });
        sessionId = result.sessionId;

        console.log(`\n🤖 Bot: ${result.botText}`);
        console.log(`   [State: ${result.state}]`);
        
        if (result.profileSummary) {
          console.log(`   [Profile: ${result.profileSummary}]`);
        }
        console.log('');

        if (result.state === 'END') {
          console.log('Conversation ended. Type "new" for a new one or "quit" to exit.\n');
        }
      } catch (err) {
        console.error('Error:', err.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
