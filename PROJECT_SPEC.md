# PROJECT_SPEC.md — PM-AJAY Voice Livelihood Assistant (SIH 2026)

> **Version 2 changes:** (1) OpenRouter is now the default provider for LLM + STT + TTS (Section 4.1, Section 13). (2) The data plan now uses **real official sources first** (NQR, NABARD PLP, data.gov.in) with a human-verified ingestion pipeline; synthetic data is only for things that are not public (Section 14, Phase 1B).

> **Version 3 changes:** Section 1 now contains the **full official problem statement description** (background, GIA issues, detailed description, expected solution) plus a requirement-to-spec checklist. Scope now includes a **mobile-friendly voice web app with kiosk mode** as a primary deliverable, extra profile fields (physical constraints, local opportunities), skill-gap output, and dashboard views for planning/placement/coordination.

> **Version 4 changes:** Added Section 0.1 **Decisions already made** (web app first, not a native Android app; MERN is allowed because the official text mandates no tech stack; Twilio is channel-only; Twilio trial constraints). Phase 3 is now explicitly the mobile-friendly **voice web app**. Section 10.3 lists the Twilio trial limits for calls.

> **How to use this file (for the human):** Put this file in the root of the project folder. In Antigravity, start the first chat with:
> *"Read PROJECT_SPEC.md fully. Summarise the problem statement and the plan back to me in simple words. Do NOT write any code yet. Then ask me any questions you have."*
> After that, build **one phase at a time** (see Section 12). Commit to git after every working step.

> **Instructions for the AI agent:** Treat this file as the source of truth. Re-read it whenever you are unsure. If something here conflicts with what you assume, ask the human before proceeding.

---

## 0. About the human and how to work with them

- The human is the **only coder** in a 4–5 member SIH team. Others do data collection, testing, PPT and research.
- The human knows the **MERN stack** (MongoDB, Express, React, Node). Prefer MERN and JavaScript everywhere. Do not introduce Python unless absolutely necessary and only after asking.
- The human is doing "vibe coding", so:
  - Build **one feature at a time**. Never generate the whole project in one go.
  - After each feature: tell the human **how to run it, how to test it, and what to expect**.
  - Keep code simple, commented at key places, and readable. Avoid clever abstractions.
  - When something fails, explain the cause in simple language (Hinglish is fine), then fix it.
  - Ask before making big decisions (changing stack, adding a paid service, deleting files).
  - Never run destructive terminal commands (delete folders, force push, drop database) without asking.
  - Never commit `.env` or API keys. Provide `.env.example` instead.
  - Suggest a `git commit` message after every working step.

---

### 0.1 Decisions already made (do not re-debate; ask the human if you think one should change)

1. **Deliverable form:** a **mobile-friendly, responsive web app (PWA) + backend**, not a native Android app. The official text asks for an "application" and "lightweight mobile or kiosk-based" solutions but does not mandate Android. A web app opens on any phone or kiosk browser with no install. If required later, it can be wrapped as an installable app.
2. **Build order (channels):** (1) backend brain (text) → (2) voice web app → (3) officer dashboard → (4) WhatsApp voice notes → (5) IVR/call (simulated first, real only if time). Web app comes first; WhatsApp and call are extra doors into the same backend.
3. **Tech stack:** the official problem statement does **not** mandate any stack. The human chose **MERN** (Node.js/Express, MongoDB, React). Do not introduce another language or framework without asking.
4. **Twilio is only the channel layer** (WhatsApp and calls). Speech-to-text, text-to-speech, LLM reasoning, recommendations, database and dashboard are **not** Twilio; they are our backend, OpenRouter (default), MongoDB and React.
5. **Twilio trial facts the code and plan must respect** (verify against current Twilio docs before relying on them):
   - The trial account expires about **30 days after sign-up**, so do not spend time on Twilio setup until the WhatsApp/call phase.
   - Messages and calls go only to **verified numbers (up to 5)**, and trial voice calls are restricted to the **sign-up country (India)**.
   - The **WhatsApp sandbox number and the Voice trial number are different**; the WhatsApp number cannot take calls.
   - Trial accounts have **restrictions on custom TwiML** (some verbs are blocked) and on WhatsApp templates. **Test early** whether `<Gather input="speech">` and free-form WhatsApp replies work on the trial account.
   - A publicly callable number (including a **1800 toll-free** number) is a **production/paid** telecom item and is out of scope for the prototype. The prototype uses the Twilio trial number for a live demo to verified phones, plus a browser simulation and a recorded call video as backup.
6. **Data:** one pilot district and 3-5 sectors, real official sources through the verified ingestion pipeline (Section 14), synthetic data only for non-public items.
7. **Honesty:** never claim jobs, seats, funding, demand or dialect support that we have not verified or tested (Sections 3 and 14).

---

## 1. The Hackathon Problem Statement (official details)

| Field | Value |
|---|---|
| Event | Smart India Hackathon (SIH) 2026 |
| Problem Statement ID | **26097** |
| Title | **AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under GIA component of PM-AJAY** |
| Organization | Ministry of Social Justice and Empowerment (MoSJE) |
| Department | Department of Social Justice and Empowerment |
| Category | Software |
| Theme | Agriculture, FoodTech & Rural Development |

### Description (official text from the SIH portal)

**Background**
- The Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) aims to reduce poverty among Scheduled Caste (SC) communities through livelihood promotion, skill development, and enterprise support under its Grant-in-Aid (GIA) component. A major challenge in implementation is the identification of appropriate skill training pathways that align with both the aspirations of beneficiaries and the actual livelihood opportunities available in their local regions.
- Many target beneficiaries face barriers such as low digital literacy, limited awareness of modern trades, language constraints, and difficulty navigating text-heavy digital systems. As a result, there is often a mismatch between enrolled training programs and the beneficiary's interests, capabilities, or local market demand, leading to high dropout rates and poor post-training employment outcomes.
- To improve inclusion and effectiveness, there is a need for an AI-enabled conversational system that can interact naturally in regional languages and dialects, understand beneficiary aspirations, assess skill gaps, and recommend suitable NSQF-aligned livelihood opportunities in and around the beneficiary.

**Basic issues under the GIA component**
- Lack of proper road map and planning of the Perspective Plans from execution to implementation
- Identification of the participants; trained and skilled financial consultants
- Job placement issue after the skilling programme
- Coordination issues among the corporation, Ministry/Departments
- Inadequate technical and support team at ground level

**Detailed description**
The proposed solution should be an AI-driven, multilingual, voice-based virtual livelihood assistant capable of conducting conversational interviews with beneficiaries from aspirational SC communities. Instead of relying on traditional form-filling methods, the system should use voice interactions to collect information such as:
- Educational background
- Existing or traditional family occupations
- Current livelihood activities
- Skills and interests
- Mobility and physical constraints
- Preference for self-employment or wage employment
- Local economic realities and opportunities

The assistant should support regional languages and dialects to ensure accessibility for users with low literacy or limited digital exposure. The interaction should feel **empathetic and conversational rather than administrative**.

The collected information should be analyzed using AI/ML-based profiling and recommendation mechanisms to identify:
- Suitable NSQF-aligned training programs
- Relevant trades and livelihood pathways
- Skill gaps requiring intervention
- Region-specific employment or enterprise opportunities

The system should also function effectively in low-connectivity and low-tech environments through deployment channels such as:
- IVR-based phone calls for feature phone users
- WhatsApp voice-note interfaces
- Lightweight mobile or kiosk-based solutions

**Expected solution**
An AI-powered multilingual voice assistant **application** designed to help SC beneficiaries under PM-AJAY identify suitable skill training and livelihood opportunities. The app will support regional languages and local dialects, allowing users to interact through simple voice conversations instead of text-based forms.

> Source: text supplied by the human from the official portal (SIH 2026, PS 26097). The `beneficiary's` apostrophe was repaired from a copy-paste encoding error. If the portal is updated, the human will update this section.

### Requirement checklist (official requirement -> where this spec covers it)

| Official requirement | Covered in |
|---|---|
| Voice dialogue instead of form-filling | Sections 8, 10 |
| Regional languages and dialects | Sections 4.1, 8 (language packs), 16 (accent testing) |
| Collect: education, traditional/family occupation, current livelihood, skills/interests, mobility **and physical constraints**, self vs wage preference, **local economic realities and opportunities** | Section 7 (Beneficiary), Section 8 (states) |
| Empathetic, conversational tone | Section 3 rule 12, Section 8 |
| AI/ML-based profiling and recommendation | Sections 8, 9, 15 |
| Output: NSQF-aligned programs, trades/pathways, **skill gaps**, region-specific employment/enterprise opportunities | Sections 9, 14 |
| IVR for feature phones | Section 10.3 |
| WhatsApp voice-note interface | Section 10.2 |
| Lightweight mobile or **kiosk** solution | Section 10.1 |
| Expected: a multilingual voice assistant **application** | Section 10.1 (mobile-friendly voice web app is a primary deliverable) |

### How the GIA "basic issues" relate to our solution (use in PPT)

| GIA issue | What our prototype does | Honest limit |
|---|---|---|
| No proper roadmap / planning of Perspective Plans | Dashboard shows aggregated interests, sector demand and training gaps by district, which can inform planning | Uses prototype/synthetic conversations; real planning needs real deployment data |
| Identifying skilled financial consultants | Bot's next step can advise contacting the local officer/bank; officer notes can record referrals | Not solved in the prototype; future scope (directory of consultants) |
| Job placement after skilling | Recommends pathways tied to local opportunities and tracks pathway status fields (referred / enrolled / completed / placed) | Status values are officer-entered or synthetic in the demo |
| Coordination among Corporation / Ministry / Departments | One shared officer dashboard with verified evidence and notes | Real inter-department integration is future scope |
| Inadequate technical/support team on the ground | Voice-first, assisted/kiosk mode lets a field worker help a beneficiary with no typing | Needs pilot testing with real field staff |

### Plain-language interpretation

- **Who is the user?** A person from an SC community, often with low literacy, poor internet and possibly only a basic phone. They should not need to type, read long text, or fill forms.
- **What is the problem?** It is hard for them (and for scheme officers) to decide *which training course or livelihood* suits this person given their education, current work, interests and local area.
- **What must we build?** A voice-first AI assistant. The person **speaks in their own language** (Hindi first) over **WhatsApp voice notes** or **a phone call (IVR)**. The assistant asks simple questions, builds a profile, and recommends **NSQF-aligned training programs** plus **local livelihood options**, replying **in voice**.
- **"Livelihood mapping"** = connecting a person's profile to livelihood options that make sense in *their district/area* (e.g. dairy, tailoring, mushroom farming, small shop), and giving officers an aggregated view of what people want and what training is needed where.
- **The official text also expects:** an *application* (not only a chatbot), **regional languages and dialects**, an **empathetic** tone, **skill-gap analysis**, awareness of **local economic realities**, and channels for **feature phones (IVR), WhatsApp voice notes, and lightweight mobile/kiosk** use.
- **Mismatch problem:** the background says training that does not match a person's interests, capabilities and local demand leads to dropouts and poor placement. So recommendations must weigh **aspiration + capability + local opportunity together**, not just education.
- **NSQF** = National Skills Qualification Framework (levels 1–10) that classifies qualifications by the knowledge/skill level. Recommendations must mention the NSQF level and avoid suggesting levels far above the person's education.

---

## 2. Product Goal and Scope

### Goal
> A beneficiary talks in their own language and gets a clear, explainable, realistic recommendation for training and livelihood — without typing or filling any form.

### MUST HAVE (MVP — build in this order)
1. **Backend "brain"** that works with **text input**: conversation → structured profile → recommendations.
2. **Mobile-friendly voice web app** (React PWA) with a **kiosk mode**: speak → bot replies with voice + text. The official expected solution is a multilingual voice assistant *application*, so this is a **primary deliverable** (Section 10.1) and also the backup for the live demo.
3. **Officer/Admin dashboard** (React): aggregated insights + list of conversations + a district/sector view (this represents "livelihood mapping").
4. **WhatsApp voice-note channel** (Twilio WhatsApp Sandbox): receive voice note → reply with voice + text.

### SHOULD HAVE (if time permits)
5. **IVR call flow** — first as a *simulated* flow (browser mic + call-flow diagram). Real telephony only if time remains (Twilio `<Gather input="speech">` with Hindi is the simplest path; verify current Twilio docs).
6. A **second regional language** beyond Hindi (chosen with the pilot district; English can be a third), using the same architecture. Dialect support = test Hindi STT on regional-accent samples and report accuracy honestly; do not claim dialect models we have not tested.

### OUT OF SCOPE (mention only as "future scope" in PPT)
- Real PM-AJAY / government APIs, beneficiary IDs, funding approval or eligibility decisions
- Real-time training seat availability
- More than 3 languages, dialect-specific model training, production telecom setup, full officer workflow engines

---

## 3. Design Principles / Rules the System Must Follow

1. **Never invent courses, jobs, schemes, funding or seats.** Recommend **only** from our own dataset (Mongo collections). The LLM chooses/ranks/explains; it does not create new items.
2. **LLM output must be validated.** If the LLM returns an ID that is not in the candidate list, discard it.
3. **Rules first, AI second.** Hard filters (education, age, sector, location) are done in plain JavaScript before the LLM sees candidates.
4. **Explain every recommendation** with a short "why" in simple language of the user.
5. **Confirm understanding** before recommending ("Aap 10th pass hain aur silai ka kaam karte hain, sahi?").
6. **Ask one question at a time.** Short sentences. Simple vocabulary.
7. **Never claim** that a job exists, a training seat is available, or funding will be given. Use phrases like *"yeh aapke liye ek achha option ho sakta hai"* and *"training centre se availability confirm karein"*.
8. **Consent first.** Before recording/processing voice, say that voice is being processed and get a yes. Keep only what is needed. Do not store raw audio longer than needed (delete after transcription).
9. **Mark data honestly (provenance).** Records imported from official sources must store `sourceUrl`, `retrievedAt` and `isDemo: false` **only after a human has verified them**. Every seeded record that is not verified real data must have `isDemo: true` (or `source: "SAMPLE"`) and the UI must show a small "DEMO DATA" label.
10. **Graceful failure.** If speech is not understood, ask to repeat; after 2 failures, offer simple options (numbers) or text.
11. **Low-tech friendly.** Short replies, compressed audio, text fallback along with audio.
12. **Empathetic, not administrative.** The official brief asks for a conversational, empathetic feel. Greet warmly, acknowledge answers ("achha, silai ka kaam aata hai, yeh toh achhi baat hai"), never sound like a form, never make the person feel judged for low education, and never ask for sensitive details (caste certificate, Aadhaar, bank details) in the conversation. Physical constraints are asked gently and are optional.

---

## 4. Tech Stack (MERN + APIs)

| Area | Choice |
|---|---|
| Runtime / Backend | Node.js 20+, Express |
| Database | MongoDB (Atlas free tier or local) with Mongoose |
| Frontend | React (Vite), Tailwind CSS optional, Recharts for charts |
| STT (speech to text) | Provider abstraction in `services/stt.js`. **Default: OpenRouter** `/api/v1/audio/transcriptions` (Whisper-family models). Optional swaps: Bhashini, Google Speech-to-Text. See Section 4.1. |
| TTS (text to speech) | Provider abstraction in `services/tts.js`. **Default: OpenRouter** `/api/v1/audio/speech`. Optional swaps: Bhashini, Google Cloud TTS. See Section 4.1. |
| LLM | Provider abstraction in `services/llm.js`. **Default: OpenRouter** chat completions (OpenAI-compatible), so one API key covers LLM + STT + TTS. Must support JSON-only output; JSON-mode support varies by model, so always validate. |
| WhatsApp | Twilio WhatsApp Sandbox + `twilio` Node SDK (alt: Meta WhatsApp Cloud API) |
| IVR | Twilio Voice with TwiML (`<Gather input="speech" language="hi-IN">`, `<Say language="hi-IN">`) — optional/simulated first |
| Audio conversion | `ffmpeg` via `fluent-ffmpeg` (WhatsApp voice notes are usually `.ogg` opus) |
| Uploads | `multer` |
| Local tunnel for webhooks | `ngrok` |
| Deployment (demo) | Backend on Render/Railway, frontend on Vercel/Netlify, DB on MongoDB Atlas |

**Important:** all external providers (STT, TTS, LLM) must be **swappable via `.env`** (e.g. `STT_PROVIDER=openrouter|bhashini|google`). Do not hardcode a single vendor across the codebase. Before integrating any provider, **check its current official docs** (pricing, limits, audio formats and API shape change over time) and tell the human what account/API key is needed.

### 4.1 OpenRouter as the default provider for LLM + STT + TTS

**Why:** one API key and one billing account for all three AI needs is the simplest setup for a solo coder. Bhashini/Google stay available as optional swaps behind the same interfaces.

| Need | Endpoint | Notes |
|---|---|---|
| LLM | `POST https://openrouter.ai/api/v1/chat/completions` | OpenAI-compatible. Model name from env. |
| STT | `POST https://openrouter.ai/api/v1/audio/transcriptions` | JSON body with **base64-encoded audio**; returns JSON with the transcribed text and usage. STT-capable models can be listed with `GET https://openrouter.ai/api/v1/models?output_modalities=transcription`. Whisper-family models (e.g. Whisper Large V3 Turbo) are available. |
| TTS | `POST https://openrouter.ai/api/v1/audio/speech` | OpenAI-compatible: body has model, input text, voice, response_format. **Response is raw audio bytes, not JSON.** |
| Audio via chat (optional) | `chat/completions` with an `input_audio` content part | Lets some models take audio directly and could remove the separate STT step. Use only if it is better for Hindi. |

**Rules for the agent:**
1. **Read the current OpenRouter docs before coding** (STT: `openrouter.ai/docs/guides/overview/multimodal/stt`, TTS: `openrouter.ai/docs/guides/overview/multimodal/tts`). Do not guess request body shapes or field names.
2. **Never hardcode model or voice names.** Use env variables. Candidate models are picked from the OpenRouter models page by filtering on output modality (speech / transcription) and Hindi support.
3. **TTS output format:** always set `response_format` explicitly. If omitted, the default is PCM, and some models accept only MP3. Never save PCM with an `.mp3` extension; convert with ffmpeg when needed (WhatsApp needs a supported audio format, check Twilio docs).
4. **TTS voice:** always send a voice, since some providers reject requests without one. The `speed` parameter is ignored by some providers.
5. **Check the HTTP status before treating a response as audio.** Non-200 responses return JSON error bodies.
6. **WhatsApp voice notes are usually `.ogg`.** Test whether the chosen STT model accepts `.ogg` directly; convert with ffmpeg only if it does not.
7. **Hindi quality is not guaranteed.** Phase 3 includes an audio benchmark (Section 12). If quality is poor for rural accents, switch the provider through `.env` (Bhashini or Google) without changing the rest of the code.
8. **Cost control:** pricing is per-use. Log audio seconds / tokens per conversation, cap turns per session, and provide a `MOCK_AI=true` mode that returns canned STT/LLM/TTS results so the human can develop the UI and flows without spending credits.
9. Keep the API key on the server only. Never expose it to the React frontend.

---

## 5. High-Level Architecture

```
            ┌───────────────┐   ┌────────────────┐   ┌────────────────┐
 Beneficiary│ WhatsApp voice│   │ Phone call (IVR)│   │ Browser mic demo│
            └──────┬────────┘   └───────┬─────────┘   └────────┬───────┘
                   │ webhook             │ webhook              │ HTTP
                   ▼                     ▼                      ▼
             ┌──────────────────────────────────────────────────────────┐
             │                 Express Backend (Node.js)                │
             │  channel adapters → conversation engine                  │
             │  STT → profile extraction (LLM) → recommender → TTS      │
             └───────┬───────────────────────────────┬──────────────────┘
                     │                               │
              ┌──────▼──────┐                 ┌──────▼──────┐
              │  MongoDB    │                 │  Dashboard   │
              │ courses,    │◄────────────────│  (React)     │
              │ livelihoods,│  aggregates     │  officer view│
              │ profiles,   │                 └──────────────┘
              │ conversations
              └─────────────┘
```

**Key idea:** the voice assistant is *not* a separate thing. It is the backend pipeline. WhatsApp, IVR and browser mic are just three "doors" into the same conversation engine.

Every channel adapter must do the same thing: convert the incoming message into `{ sessionId, channel, text | audio }`, call `conversationEngine.handleMessage(...)`, and send back `{ text, audio }`.

---

## 6. Folder Structure

```
project-root/
├── PROJECT_SPEC.md
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/            # env, db connection
│       ├── models/            # Course.js, Livelihood.js, Beneficiary.js, Conversation.js
│       ├── data/              # seed JSON files (courses.json, livelihoods.json) + seed script
│       ├── routes/
│       │   ├── chat.routes.js         # POST /api/chat/message (text/audio) - browser + testing
│       │   ├── whatsapp.routes.js     # POST /webhooks/whatsapp
│       │   ├── ivr.routes.js          # POST /webhooks/ivr/* (optional)
│       │   ├── dashboard.routes.js    # GET /api/dashboard/*
│       │   └── admin.routes.js        # seed / reset demo data (protected)
│       ├── services/
│       │   ├── conversationEngine.js  # state machine
│       │   ├── profileExtractor.js    # LLM -> structured JSON
│       │   ├── recommender.js         # filters + LLM ranking + validation
│       │   ├── stt.js                 # provider abstraction
│       │   ├── tts.js                 # provider abstraction
│       │   ├── llm.js                 # provider abstraction
│       │   ├── audio.js               # ffmpeg conversion helpers
│       │   └── messages.hi.js         # all Hindi bot lines in ONE file (easy for team to edit)
│       ├── utils/
│       └── tests/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   ├── VoiceDemo.jsx          # mic button, chat transcript, audio playback
│       │   ├── Dashboard.jsx          # charts + tables
│       │   └── Conversations.jsx      # list + detail (anonymised)
│       ├── components/
│       └── api/
└── docs/
    ├── call-flow.md                   # IVR flow diagram (mermaid)
    └── demo-script.md
```

---

### Additional folders for real-data ingestion (see Section 14)

```
backend/
├── data/
│   ├── raw/          # official PDFs/CSVs downloaded manually (NQR Q-Files, NABARD PLP, OGD files)
│   ├── staging/      # extracted JSON/CSV, verified:false — reviewed by a human
│   └── verified/     # human-approved JSON/CSV used by the import script
└── src/scripts/
    ├── extractQFiles.js      # NQR Q-File PDFs -> staging/courses.json
    ├── extractPlp.js         # NABARD PLP PDF  -> staging/livelihoods.json
    ├── importVerified.js     # verified/*.json -> MongoDB (isDemo:false + provenance)
    ├── seedDemoConversations.js
    └── benchmarkAudio.js     # STT/TTS Hindi test (Phase 3)
```

---

## 7. Data Models (Mongoose)

### Course (NSQF-aligned training) — seed ~30–50 records
```js
{
  _id, title, titleHi,
  sector,              // e.g. "Apparel", "Electronics", "Agriculture", "Retail", "Construction"
  nsqfLevel,           // 1..10
  minEducation,        // "none" | "5th" | "8th" | "10th" | "12th" | "graduate"
  durationHours,       // number
  jobRoles: [String],
  description, descriptionHi,
  tags: [String],      // e.g. ["silai","tailoring","women-friendly"]
  // + provenance fields (sourceName, sourceUrl, sourceDoc, retrievedAt, verified, isDemo ...) - see below
}
```

### Livelihood (local livelihood option) — seed ~15–25 records for ONE pilot district
```js
{
  _id, title, titleHi,
  type,                // "self-employment" | "wage" | "existing-trade-upgrade"
  district, state,     // pilot geography
  sector,
  relatedCourseIds: [ObjectId],
  requiredSkills: [String],
  minEducation,
  startupCostRange,    // string like "₹10k–₹50k (indicative)"
  needsAssets: [String],
  demandSignal,        // "high" | "medium" | "low" | "unknown"  (label as SIGNAL, not guarantee)
  supportNote,         // e.g. "Check PM-AJAY / bank / local scheme options with the officer" — no fake scheme claims
  // + provenance fields (see below)
}
```

### Provenance fields (required on every Course and Livelihood record)
```js
{
  sourceName,          // "NQR" | "NABARD PLP" | "OGD" | "MANUAL" | "SYNTHETIC"
  sourceUrl,           // page or document URL
  sourceDoc,           // file name of the downloaded PDF/CSV, plus page number if applicable
  sourceExcerpt,       // short text snippet the record was extracted from
  retrievedAt,         // date the human downloaded it
  verified: Boolean,   // true only after a human compared it with the source
  verifiedBy,          // teammate name/initials
  isDemo: Boolean      // true if synthetic or unverified
}
```

### Beneficiary (profile built from conversation)
```js
{
  _id, sessionId, channel, language,
  consentGiven: Boolean,
  name (optional), ageRange, gender (optional),
  state, district, villageOrBlock,
  education,           // same enum as minEducation
  currentWork, traditionalOccupation,
  skills: [String], interests: [String],
  workPreference,      // "wage" | "self" | "either" | "unknown"
  willingToMigrate: Boolean | null,
  travelRadiusKm: Number | null,
  physicalConstraints: [String],        // voluntary, e.g. "cannot stand for long" (optional, gently asked)
  localOpportunitiesReported: [String], // what the person says about work/demand around them ("USER REPORTED", not verified)
  incomeExpectation: String | null,
  fieldConfidence: { education: 0..1, ... },
  isDemo: Boolean, createdAt
}
```

### Conversation
```js
{
  _id, sessionId, beneficiaryId, channel, language,
  state,               // current step of the state machine
  turns: [{ role: "user"|"bot", text, at, audioRef?: String }],
  recommendations: [{ type: "course"|"livelihood", refId, reason, skillGap, nextStep, fitFlags, rank }],
  status: "in_progress" | "completed" | "abandoned",
  createdAt, updatedAt
}
```
Raw audio: **do not persist** beyond processing (delete temp files). Store transcript only.

---

## 8. Conversation Design (Hindi first)

### State machine
```
START → CONSENT → LANGUAGE (optional) → ASK_LOCATION → ASK_AGE → ASK_EDUCATION
→ ASK_CURRENT_WORK → ASK_SKILLS → ASK_INTEREST → ASK_WORK_PREFERENCE
→ ASK_MOBILITY_AND_CONSTRAINTS → ASK_LOCAL_OPPORTUNITIES → CONFIRM_PROFILE → RECOMMEND → FOLLOWUP (questions / "kuch aur dikhao") → END
```
- If the user gives multiple answers in one voice note, the extractor fills multiple fields and the engine **skips** already-answered states.
- If a required field is missing, ask **one** short question for it.
- **CONFIRM_PROFILE** reads back the profile in one or two simple sentences and asks "sahi hai?". If "nahi", ask which part is wrong and correct it.
- **ASK_MOBILITY_AND_CONSTRAINTS:** willingness to move, travel distance, and (gently, optional) any physical limitation.
- **ASK_LOCAL_OPPORTUNITIES:** ask what work or business the person sees around them ("aapke gaon/aas-paas mein kaunsa kaam achha chalta hai?"). Store as `localOpportunitiesReported` (USER REPORTED) and use it as a *signal* next to our verified data, never as proof of demand.
- All bot sentences live in per-language files (`messages.hi.js`, `messages.en.js`, later `messages.<lang>.js`) so non-coder teammates can edit wording without touching logic. The engine must be language-agnostic: it only asks the message layer for a line by key.
- Tone: follow Rule 12 (empathetic, conversational). Keep an "acknowledgement line" before each next question.

### Example (target behaviour)
> **User (voice):** "Main 10th pass hoon, gaon mein rehta hoon, silai aati hai. Kuch kamana chahta hoon par gaon chhodna nahi chahta."
> **Bot:** "Namaste. Main samajh gaya: aap 10th pass hain, silai aati hai, aur apne gaon ke paas hi kaam karna chahte hain. Kya yeh sahi hai?"
> **User:** "Haan."
> **Bot (after recommend):** "Aapke liye 3 training aur 2 kaam ke vikalp hain. Pehla: Tailoring/Sewing Machine Operator training (NSQF level 3). Yeh isliye theek hai kyunki aapko silai aati hai aur yeh ghar ke paas kiya ja sakta hai. … Training centre se seat ki jaankari zaroor confirm karein."

### Profile extraction (LLM)
- Input: latest transcript + current partial profile.
- Output: **strict JSON only** matching the Beneficiary schema fields + `confidence` per field + `missingFields[]`.
- Must handle Hindi/Hinglish, spelling noise from STT, and colloquial words (e.g. "dasvi pass" = 10th, "silai" = tailoring, "dudh ka kaam" = dairy).
- Validate with a JSON schema (e.g. `zod`/`ajv`). On invalid JSON, retry once, then ask the user to repeat.

---

## 9. Recommendation Engine

Pipeline in `recommender.js`:

1. **Hard filters (plain JS):**
   - `course.minEducation` ≤ user's education
   - `course.nsqfLevel` reasonable for education (e.g. avoid level > 4 for ≤ 8th pass unless explicitly relevant)
   - Livelihood district/state matches the user's district (fallback: same state, marked as "nearby area")
   - Respect `workPreference` and `willingToMigrate` when known
2. **Candidate pool:** top 10–15 courses + 5–8 livelihoods after filters (optionally pre-ranked by tag/keyword overlap with skills/interests).
3. **LLM ranking:** send the profile + candidate list (with IDs). Ask for JSON: top 3 courses and top 2 livelihoods, each with a short Hindi `reason` (max 2 sentences), plus `skillGap` and `nextStep`.
4. **Validation:** every returned ID must exist in the candidate list. Drop any that do not. If fewer than needed, fill from the rule-based ranking.
5. **Safe wording:** attach a fixed disclaimer line to every result (availability to be confirmed with training centre / officer; no guarantee of job or funding).
6. **Empty result handling:** if nothing matches, say so honestly and ask a follow-up question or suggest speaking to a local officer. Never force a recommendation.
7. **Skill gap and fit flags** (the official brief asks for skill-gap analysis and warns about aspiration/local-demand mismatch): for each recommendation compute
   - `skillGap`: what the person still needs (compare their stated skills/education with the course's job roles and entry requirements; unknown stays unknown),
   - `fitFlags`: `{ aspirationMatch, educationMatch, mobilityMatch, localOpportunityMatch }` each `"good" | "partial" | "unknown"`, derived by plain rules where possible. Show the flags in the dashboard and use them to warn about poor-fit recommendations (dropout risk).
8. Save recommendations in `Conversation.recommendations` (used by dashboard).

---

## 10. Channels

### 10.1 Mobile-friendly voice web app + kiosk mode (build first; primary deliverable and demo backup)
- React page with a big mic button (`MediaRecorder`), shows transcript bubbles, plays the bot's audio reply, also shows text.
- Endpoint: `POST /api/chat/message` with `multipart/form-data` (`audio` file) or JSON (`text`) + `sessionId`.
- Response: `{ sessionId, botText, botAudioUrl, state, profileSummary?, recommendations? }`.
- Include a "type instead" text box for debugging and a "start over" button.
- **Mobile-first PWA:** installable, works well on a phone browser, big touch targets, minimal text, icons plus labels, works on slow networks (small payloads, audio compressed, clear loading state).
- **Language selector** with large buttons (Hindi, English, second regional language), also spoken aloud on first screen.
- **Kiosk mode** (`?kiosk=1`): full-screen, one big "Bolna shuru karein" button, on-screen text kept large, auto-resets after the conversation ends or after inactivity, and a "field worker assisted" toggle so an officer can help a beneficiary without typing. Never shows other users' data.
- Show the recommendation as simple cards (icon, title, NSQF level, one-line reason) in addition to reading it aloud.

### 10.2 WhatsApp (Twilio Sandbox)
- Webhook: `POST /webhooks/whatsapp` (Twilio sends `application/x-www-form-urlencoded`; use `express.urlencoded`).
- Flow:
  1. Read `From`, `Body`, `NumMedia`, `MediaUrl0`, `MediaContentType0`.
  2. If audio: download media (Twilio media URLs may require Basic Auth with Account SID/Auth Token — check current docs), convert `.ogg` → `.wav` (16 kHz mono) with ffmpeg. **But first test whether the chosen STT model accepts `.ogg` directly; if it does, skip the conversion.**
  3. STT → text → `conversationEngine.handleMessage({ sessionId: From, channel: "whatsapp", text })`.
  4. TTS → audio file (set `response_format` explicitly; convert with ffmpeg if the provider returns PCM) saved to a temp public folder served over HTTPS (ngrok/Render URL).
  5. Reply via TwiML `<Message>` with body text + `<Media>` audio URL. **Always send text along with audio** in case audio fails. Check Twilio docs for supported outbound audio formats for WhatsApp.
  6. Immediately (or first) send a quick text "Aapki baat sun raha hoon…" because processing can take 5–10 s. If Twilio's webhook timeout is a risk, respond fast and send the final message asynchronously via Twilio REST API.
- Sandbox notes: each tester must first send the sandbox join code from their phone. Production would need a WhatsApp Business account, business verification and approved templates (mention in PPT only).
- Delete temp audio files after processing.

### 10.3 IVR (optional; simulate first)
- **Simulated IVR (must do):** `docs/call-flow.md` with a mermaid diagram of the call flow (language menu → consent → questions → recommendations → repeat/exit) + the browser mic page labelled "IVR simulation".
- **Real IVR (if time):** Twilio Voice webhook `POST /webhooks/ivr/start` returns TwiML with `<Gather input="speech" language="hi-IN" action="/webhooks/ivr/answer">` and `<Say language="hi-IN">`. Twilio's speech result can go straight to the conversation engine (no separate STT). Trial accounts can call only verified numbers and Indian number availability may be limited — check current Twilio/Exotel docs and tell the human the limitations before starting.
- **Twilio trial limits for calls (see Section 0.1):** verified numbers only (max 5), calls within India only, the Voice trial number is separate from the WhatsApp sandbox number, and some TwiML verbs may be blocked. Before writing IVR code, the human checks the Console's "Try out Voice" page (dial the trial number from a verified phone) and Twilio's "Custom TwiML during trial" reference, then tells the agent whether `<Gather>` speech works. If it does not, fall back to the simulated IVR (browser page + call-flow diagram + recorded call video).
- **Public number:** a real callable 1800/toll-free number needs an Indian telecom/IVR provider (paid, KYC). Not part of the prototype; mention as production step in the PPT.

---

## 11. Officer / Admin Dashboard (the "livelihood mapping" part)

Pages:
1. **Overview:** total conversations, completed profiles, top recommended courses, top livelihoods, channel split (WhatsApp / browser / IVR-sim), language split.
2. **Mapping view:** by **district/block** and **sector** — chart or simple table showing interest/demand per sector and most-requested courses (training gap). If time permits, a simple map or heatmap-style grid.
3. **Education & work preference distribution:** bar/pie charts.
4. **Conversations list + detail:** anonymised (show partial name/phone hash, not full phone number), profile summary, recommendations with reasons, "DEMO" badge where applicable.
5. **Officer notes (optional):** a verification checklist per case — "training availability confirmed?", "eligibility verified by officer?", note field. This shows human-in-the-loop.
6. **Planning and placement view (addresses the GIA issues):**
   - *Perspective-plan insights:* aggregated sector interest vs available training by district/block, top unmet training needs, and a list of poor-fit flags (aspiration vs local opportunity mismatch) that indicate dropout risk.
   - *Pathway status tracker:* per case, `referred → enrolled → completed → placed/started enterprise`. In the prototype these are officer-entered or synthetic and must be labelled DEMO.
   - *Coordination:* a shareable, anonymised summary export (CSV/PDF) that different departments can use.

Endpoints (examples):
```
GET /api/dashboard/summary
GET /api/dashboard/by-sector
GET /api/dashboard/by-district
GET /api/dashboard/education
GET /api/conversations            (paginated, anonymised)
GET /api/conversations/:id
PATCH /api/conversations/:id/officer-note
POST /api/admin/seed-demo         (creates ~100 synthetic conversations flagged isDemo:true)
```
- Seed script must generate **realistic synthetic conversations** so the dashboard looks meaningful in the demo, clearly labelled DEMO DATA.
- Protect admin/dashboard routes with a simple login (e.g. env-based admin credentials + JWT) — enough for a prototype.

---

## 12. Build Phases (do ONE at a time; stop and let the human test after each)

### Phase 0 — Setup
- Create repo, `backend/` and `frontend/`, `.gitignore`, `.env.example`, README with run instructions.
- Connect MongoDB, health-check route `GET /api/health`.
- **Done when:** `npm run dev` starts backend and frontend without errors.

### Phase 1 — Data models and seed pipeline
- Create Mongoose models (with the provenance fields from Section 7) and a generic **import script** that loads JSON from `backend/data/verified/`.
- Create tiny example files so the pipeline can be tested (format in Section 14.6).
- **Done when:** `npm run import:verified` fills MongoDB and a `GET /api/courses` test route returns data with provenance fields.

### Phase 1B — Real data ingestion (runs in parallel with the human/teammates collecting files)
- The human/teammates manually download official files into `backend/data/raw/` (Section 14.2). **Do not bulk-scrape websites.**
- Write `extractQFiles.js` and `extractPlp.js`: parse PDF text (e.g. `pdf-parse` or `pdfjs-dist`), use the LLM to turn it into JSON that matches our schema, and write to `backend/data/staging/` with `verified: false`, plus `sourceDoc`, page number and `sourceExcerpt` for each record.
- Export staging data to CSV so non-coder teammates can review it in a spreadsheet, correct it, and mark `verified=TRUE`. Then convert the reviewed CSV back to `data/verified/*.json`.
- **Done when:** at least the pilot sectors' courses and the pilot district's livelihood options are imported with `isDemo:false` and complete provenance, and any record without verification remains `isDemo:true`.

### Phase 2 — Text brain
- Implement `llm.js`, `profileExtractor.js`, `conversationEngine.js`, `recommender.js`, `messages.hi.js`.
- `POST /api/chat/message` with **text only**.
- Add tests / a script `npm run chat-cli` to talk to the bot in the terminal.
- **Done when:** a Hindi/Hinglish text conversation reaches recommendations correctly and invalid LLM output is handled.

### Phase 3 — Voice web app (mobile-friendly, kiosk mode)
- **First run the audio benchmark** (`npm run benchmark:audio`): feed 10-15 Hindi recordings from teammates (include noisy, soft-voice and mixed Hindi-English samples) through the chosen STT model and print transcript + latency; synthesize ~5 typical bot sentences through TTS and save the files so a human can listen. The human decides go/no-go for the provider and records the decision in the README.
- Implement `stt.js`, `tts.js`, `audio.js` (OpenRouter by default, per Section 4.1); extend `/api/chat/message` to accept audio.
- Support `MOCK_AI=true` so the UI can be built without spending credits.
- Build the mobile-friendly voice web app per Section 10.1 (`VoiceDemo.jsx` and supporting components): language selector with big buttons, consent screen, mic button, spoken + text replies, recommendation cards, and kiosk mode (`?kiosk=1`).
- **Done when:** speaking Hindi in the browser produces a spoken Hindi reply with the same recommendations logic.

### Phase 4 — Dashboard
- Aggregation endpoints + Dashboard/Conversations pages + demo seed generator + simple login.
- **Done when:** dashboard shows charts for real + demo conversations and the DEMO label is visible.

### Phase 5 — WhatsApp
- Twilio sandbox webhook, ngrok setup guide in README, ffmpeg conversion, audio reply + text reply, temp-file cleanup.
- **Done when:** sending a Hindi voice note from a real phone gets a text + voice reply.

### Phase 6 — IVR (simulated, then optional real)
- `docs/call-flow.md` with diagram; label mic page as IVR simulation; optional Twilio Voice TwiML routes.

### Phase 7 — Hardening and demo
- Error handling, rate limiting, input validation, consent flow polish, logging without PII.
- Deploy (backend + frontend + Atlas). Record a **backup demo video**.
- Write `docs/demo-script.md`.
- **Feature freeze** before this phase; only bug fixes.

---

## 13. Environment Variables (`backend/.env.example`)

```
PORT=5000
MONGODB_URI=
JWT_SECRET=
ADMIN_USER=
ADMIN_PASSWORD=

# AI providers (swap without code changes). Default: OpenRouter for all three.
LLM_PROVIDER=openrouter
STT_PROVIDER=openrouter
TTS_PROVIDER=openrouter
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_LLM_MODEL=        # pick from the OpenRouter models page; must handle JSON output well
OPENROUTER_STT_MODEL=        # a transcription-capable model (e.g. a Whisper-family model)
OPENROUTER_TTS_MODEL=        # a speech-capable model
OPENROUTER_TTS_VOICE=        # a voice supported by the chosen TTS model
OPENROUTER_TTS_FORMAT=mp3    # set explicitly; PCM is the default when omitted

# Optional alternates (only if switching provider after the Hindi benchmark)
BHASHINI_API_KEY=
GOOGLE_API_KEY=

# Dev safety
MOCK_AI=false                # true = canned STT/LLM/TTS responses, no API spend
MAX_TURNS_PER_SESSION=30

# Twilio (WhatsApp / IVR)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PUBLIC_BASE_URL=          # ngrok or deployed URL, used for audio media links

# Behaviour
DEFAULT_LANGUAGE=hi
DELETE_AUDIO_AFTER_PROCESSING=true
```

---

## 14. Data Strategy — Real Official Sources First, Synthetic Only Where Unavoidable

There is **no single ready-to-import verified database** that contains both NSQF courses and local livelihood options. So we combine a few official public sources through a **human-verified ingestion pipeline**. Everything not publicly available is synthetic and clearly labelled.

### 14.1 Source map

| Need | Source | What it gives | How to get it | Goes into |
|---|---|---|---|---|
| NSQF courses / qualifications | **NQR** (`nqr.gov.in`, run by NCVET) | Official register of NSQF-aligned qualifications across sectors, searchable by sector/level; each has a Q-File PDF with title, code, NSQF level, entry requirements, awarding body | Use the qualification search, download Q-File PDFs for the pilot sectors **manually**. A bulk export/API was not confirmed, so do not assume one exists. | `Course` |
| District livelihood potential and unit costs | **NABARD Potential Linked Credit Plan (PLP)** (`nabard.org` → Potential Linked Plans; choose year, state, district) | District-level assessment of potential in agriculture, allied activities and rural economy in physical and financial terms | Download the pilot district's latest PLP PDF | `Livelihood` (and `demandSignal` notes) |
| Training centre counts by district | **data.gov.in (OGD)** | District-wise skill centre datasets (PMKVY, JSS, NAPS, ITI), mostly published from Parliament question replies; state-specific; often file download only, API frequently unavailable | Search for the pilot state; download CSV if a suitable dataset exists, otherwise skip | Optional `TrainingCentreStat` or notes on courses |
| Jobs (optional) | **NCS** (`ncs.gov.in`) | Public job search | Bulk export not verified. Use only small, permitted, cached samples, or skip | Optional |
| Not public | Beneficiary records, funding status, live seat availability, real conversations | Restricted | **Synthetic only**, labelled DEMO DATA | Beneficiary, Conversation, Outcome |
| Not yet checked | ODOP, PLFS, Census district data, state skill portals | Possible extra local signals | Team may explore later | Optional `MarketSignal` |

**Interpretation limits (must appear in PPT and UI):**
- NABARD PLP figures are **potential/credit estimates**, prepared from public sources and stakeholder consultation, not guaranteed demand or profit. Show them as "potential signal".
- NQR gives qualifications, **not live batches or seats**. Always show "availability to be confirmed with the training centre".
- Qualifications can be revised or replaced; store `retrievedAt` and show it.

### 14.2 Ingestion workflow (human-in-the-loop)

1. **Choose the pilot district and 3-5 sectors** (human decides). Prefer a district whose latest NABARD PLP is available.
2. **Manual download** of the source files into `backend/data/raw/`. Respect each site's terms of use. Do not bulk-scrape; do not hammer servers. Use an official export/API if one exists.
3. **Extract** with `extractQFiles.js` / `extractPlp.js`: PDF text -> LLM -> schema-shaped JSON in `backend/data/staging/`, with `sourceDoc`, page number and `sourceExcerpt` for every record. The LLM must extract only what is in the document; unknown fields stay `null`.
4. **Human review:** export staging to CSV, teammates compare each row with the source PDF, fix errors and set `verified=TRUE` and `verifiedBy`.
5. **Import** verified rows with `importVerified.js` (`isDemo:false`, provenance filled). Rows not verified stay `isDemo:true` or are not imported.
6. **Never** mark a record verified automatically. Never let the LLM fill in NSQF levels, durations or costs that are not in the document.

### 14.3 Where synthetic data is allowed

Only for: beneficiaries, conversations (for the dashboard), officer notes, outcomes, and anything else the government does not publish. Every synthetic record must have `isDemo:true` and the UI must show a visible **DEMO DATA** label. Never present synthetic data as real.

### 14.4 Pilot scope

- **One district, 3-5 sectors** (e.g. tailoring/apparel, dairy and allied, electrician, retail, construction). This limits the extraction and review workload and keeps recommendations specific.
- PPT can state: "Scale-up: repeat the same ingestion pipeline for more districts."

### 14.5 Review spreadsheet columns (for teammates)

`id, title, titleHi, sector, nsqfLevel, minEducation, durationHours, jobRoles, sourceName, sourceUrl, sourceDoc, page, retrievedAt, verified (TRUE/FALSE), verifiedBy, notes`
For livelihoods: `id, title, titleHi, type, district, state, sector, minEducation, startupCostRange, demandSignal, sourceName, sourceUrl, sourceDoc, page, retrievedAt, verified, verifiedBy, notes`

### 14.6 Example record format (ILLUSTRATIVE — placeholders, not real data)

```json
{
  "courses": [
    {
      "title": "EXAMPLE_QUALIFICATION_TITLE",
      "titleHi": "",
      "sector": "EXAMPLE_SECTOR",
      "nsqfLevel": 3,
      "minEducation": "5th",
      "durationHours": null,
      "jobRoles": ["EXAMPLE_JOB_ROLE"],
      "sourceName": "NQR",
      "sourceUrl": "https://www.nqr.gov.in/",
      "sourceDoc": "example_qfile.pdf",
      "sourceExcerpt": "",
      "retrievedAt": "YYYY-MM-DD",
      "verified": false,
      "isDemo": true
    }
  ],
  "livelihoods": [
    {
      "title": "EXAMPLE_LIVELIHOOD",
      "type": "self-employment",
      "district": "PILOT_DISTRICT",
      "state": "PILOT_STATE",
      "sector": "EXAMPLE_SECTOR",
      "minEducation": "none",
      "startupCostRange": null,
      "demandSignal": "unknown",
      "sourceName": "NABARD PLP",
      "sourceUrl": "https://www.nabard.org/",
      "sourceDoc": "example_plp.pdf",
      "sourceExcerpt": "",
      "retrievedAt": "YYYY-MM-DD",
      "verified": false,
      "isDemo": true
    }
  ]
}
```

---

## 15. Prompts (starting templates — refine during Phase 2)

### 15.1 Profile extraction prompt (system)
```
You extract a structured profile from a short Hindi/Hinglish transcript of a rural beneficiary.
Return ONLY valid JSON. No explanations, no markdown.
Fields: ageRange, education (none|5th|8th|10th|12th|graduate), currentWork, traditionalOccupation,
skills[], interests[], workPreference (wage|self|either|unknown), willingToMigrate (true|false|null),
district, state, villageOrBlock, confidence{field:0..1}, missingFields[].
If a value is not stated, use null. Do not guess. Understand colloquial terms
(e.g., "dasvi"=10th, "silai"=tailoring, "khet ka kaam"=farm work, "dudh ka kaam"=dairy).
```

### 15.2 Recommendation prompt (system)
```
You are a livelihood counsellor for rural India. You will receive a beneficiary profile and a list of
CANDIDATE courses and livelihoods, each with an id. Choose the best 3 courses and 2 livelihoods ONLY from
the candidates. Never invent items. For each, give a "reason" in simple Hindi (max 2 short sentences)
mentioning the person's education, skills, location or preference. Also give "skillGap" and "nextStep".
Never promise jobs, funding or seats. Return ONLY valid JSON:
{ "courses":[{"id":"","reason":"","skillGap":"","nextStep":""}],
  "livelihoods":[{"id":"","reason":"","skillGap":"","nextStep":""}] }
```

---

## 16. Testing Checklist (non-coder teammates can help)

- [ ] 20+ different Hindi test sentences covering: low education, high education, women, farmers, artisans, unclear answers, mixed Hindi-English, very short answers
- [ ] Noisy audio / different accents / quiet speaker
- [ ] User says "nahi", "galat", "phir se bolo", or goes off-topic
- [ ] User gives all information in a single voice note
- [ ] LLM returns invalid JSON or an unknown ID → system recovers
- [ ] No candidates found → honest message, no forced recommendation
- [ ] STT/TTS/LLM API failure → text fallback and friendly error
- [ ] Consent refused → conversation ends politely, nothing stored
- [ ] Temp audio files deleted
- [ ] STT/TTS benchmark done on 10-15 Hindi samples; provider go/no-go decision written in README
- [ ] TTS output format matches what WhatsApp accepts (no PCM saved as mp3)
- [ ] `MOCK_AI=true` mode works end to end
- [ ] Every Course/Livelihood shown to users has a source and retrieval date; unverified records show DEMO DATA
- [ ] Recommendations never include an item that is not in MongoDB
- [ ] Bot tone check: teammates rate 10 conversations for "empathetic, not like a form"
- [ ] Physical-constraint and local-opportunity questions work, and skipping them is allowed
- [ ] Mobile phone browser test (real low-end Android) and kiosk mode auto-reset
- [ ] Skill gap and fit flags shown for each recommendation; unknown values shown as unknown
- [ ] Hindi test set includes regional-accent speakers; report accuracy per speaker honestly
- [ ] Dashboard numbers match database

---

## 17. Security, Privacy, Ethics (state in PPT and follow in code)

- Explicit consent before voice processing; minimal data collection; no Aadhaar or bank details are ever asked.
- Encrypt in transit (HTTPS); secrets only in `.env`; role-restricted dashboard; anonymise phone numbers in the UI.
- No raw audio retention; transcripts only, with a retention/delete option.
- Mention alignment with India's data-protection law (DPDP Act 2023) as a design intent, and that production deployment would follow the department's own security and hosting rules.
- Use only synthetic or consented data in the demo; label it.
- The assistant supports decisions; **officers remain the authority** for eligibility and funding.

---

## 18. Demo Plan (2–3 minutes)

1. 20 sec — problem: low-literacy beneficiaries, forms, language barrier.
2. 60 sec — **live WhatsApp voice note in Hindi** → bot confirms profile → replies with voice + text recommendations (course + NSQF level + livelihood + reason).
3. 30 sec — show the **browser mic** version or **IVR simulation** and the call-flow diagram.
4. 40 sec — **dashboard**: aggregated interests and training gaps by district/sector (livelihood mapping).
5. 20 sec — trust and safety: consent, no fake data, officer verification, DEMO labels.
6. Have a **pre-recorded backup video** of the same flow.

---

## 19. Things to Mention as "Future Scope" (not to be built now)

- Authenticated integration with PM-AJAY portal/state systems, real beneficiary and training-batch data
- Live training seat availability and placement tracking
- More Indian languages and dialect-specific speech models
- Real IVR via an Indian telecom/IVR provider and Bhashini-based speech models
- Officer verification workflows, referral tracking and outcome analytics
- Offline-first field app for CSC/field officers

---

## 20. First Tasks for the Agent (start here)

1. Read this whole file and **summarise the problem statement and plan in simple Hinglish** for the human. Do not write code yet.
2. List any **questions/assumptions** (e.g. pilot district, whether the human already has an OpenRouter API key with credits (plus Twilio; Bhashini optional), whether the pilot district's NABARD PLP and the NQR Q-Files for the pilot sectors are available, MongoDB local vs Atlas).
3. Propose a very short plan for **Phase 0 and Phase 1** and wait for approval.
4. Then implement Phase 0, stop, show how to run/test, and wait.