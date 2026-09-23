<div align="center">
  <img src="frontend/public/favicon.jpg" alt="Sahayak Logo" width="120" height="120" style="border-radius: 20%; margin-bottom: 20px;" />
  
  # Sahayak (सहायक)
  ### *A better next step for rural livelihoods.*

  <p align="center">
    An AI-powered, voice-first career guidance platform designed specifically for rural India.<br/>
    Built for <b>Smart India Hackathon (SIH) 2026</b>.
  </p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 🌟 Vision
In rural India, access to personalized career counseling is a luxury. **Sahayak** bridges this gap by acting as a 24/7 AI-powered counselor. It engages users in their native language (Hindi or English) via a seamless voice-first interface, understands their background, and recommends NSQF-certified training programs and viable local livelihood options.

## ✨ Key Features

- 🎙️ **Voice-First AI Interface:** Eliminates the literacy barrier. Users talk to Sahayak just like a human counselor. No typing required.
- 🗣️ **Multilingual & Context-Aware:** Fluent in Hindi and English with a soft, empathetic, and culturally aware tone.
- 🎯 **Smart Recommender Engine:** Maps user profiles to a curated dataset of NSQF-aligned courses and livelihood opportunities, outputting actionable next steps, required skills, and cost ranges.
- 📱 **Mobile-Optimized:** A beautiful, responsive, rust-and-navy UI tailored for low-end mobile devices common in rural areas.
- 📊 **Officer Dashboard:** A secure admin panel for officials to monitor conversations, track beneficiaries by district, and analyze demographic data in real-time.
- 🛡️ **Enterprise Security:** Hardened with Helmet.js, Express Rate Limiting, and JWT authentication to prevent abuse and API exhaustion.

---

## 🏗️ Architecture & Tech Stack

Sahayak uses a decoupled architecture for maximum scalability:

### **Frontend (Vite + React)**
- **Styling:** Tailwind CSS (custom rust/navy design system)
- **Icons:** Lucide React
- **Charts:** Recharts (for the Officer Dashboard)
- **Routing:** React Router DOM
- **Deployment:** Netlify Ready (`netlify.toml` configured)

### **Backend (Node.js + Express)**
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI Integrations:** 
  - **LLM:** OpenRouter (`gpt-4o-mini` for conversational intelligence)
  - **STT (Speech-to-Text):** Groq (Ultra-fast transcription)
  - **TTS (Text-to-Speech):** OpenRouter (`alloy` voice for empathetic delivery)
- **Security:** Helmet, Express-Rate-Limit, CORS
- **Deployment:** Render Ready

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sahayak.git
cd sahayak
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example` and add your MongoDB URI and API keys.

```bash
# Seed the database with 50 courses & livelihoods
npm run import:verified 

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the Vite development server
npm run dev
```

---

## 🔒 Security & Rate Limiting
To protect cloud credits and prevent spam, Sahayak is equipped with strict rate limiting:
- **Voice/Chat API:** 25 requests per minute.
- **General APIs:** 150 requests per 15 minutes.
- **CORS:** Locked to specific frontend URLs in production.

## 🔜 Roadmap (Phase 5)
- [ ] **WhatsApp Integration:** Bring Sahayak to WhatsApp via Twilio, allowing users to get counseling via voice notes on the app they already use daily.
- [ ] **IVR Support:** Fallback feature for feature-phone users without internet access.

---

<div align="center">
  <i>Crafted with ❤️ for SIH 2026. Empowering rural India, one conversation at a time.</i>
</div>