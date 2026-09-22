# Project Progress (PM-AJAY Livelihood Assistant)

## Current Status
- **Phase 0 (Setup):** ✅ Done (MERN stack, basic routing, frontend/backend separation)
- **Phase 1 (Data models):** ✅ Done (Mongoose models for Course, Livelihood, Beneficiary, Conversation)
- **Phase 1B (Data ingestion):** 🔄 In Progress (Extraction scripts exist; waiting for real data to be processed)
- **Phase 2 (Text brain):** ✅ Done (LLM integration, profile extraction, recommendations, chat routing)
- **Phase 3 (Voice web app):** ✅ Done (STT via Groq, TTS via OpenRouter/OpenAI, mobile-friendly voice UI, kiosk mode)
- **Phase 4 (Officer Dashboard):** 🔄 In Progress (Implementing admin login, chart endpoints, and React dashboard pages)
- **Phase 5 (WhatsApp):** ⏳ Not Started
- **Phase 6 (IVR):** ⏳ Not Started

## Known Bugs & Issues
- None so far.

## How to Run Everything
1. Ensure MongoDB URI and API keys are set in `backend/.env`.
2. **Backend:** 
   ```bash
   cd backend
   npm run dev
   ```
   (Runs on http://localhost:5000)
3. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   (Runs on http://localhost:5173)
4. **Test STT/TTS (Phase 3):** Place a `.wav` or `.m4a` file in `backend/tmp/test_audio/` and run:
   ```bash
   cd backend
   npm run benchmark:audio
   ```

## What's Next
- Finish Phase 4: Create Dashboard and Conversation list pages, protect with JWT, and seed demo conversations.
