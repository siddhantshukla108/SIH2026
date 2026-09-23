import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, BookOpen, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

export default function VoiceDemo() {
  // Read saved language from localStorage, default to 'Hindi'
  const savedLang = localStorage.getItem('sahayak_language') || 'Hindi';
  
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(savedLang);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const chatEndRef = useRef(null);
  const audioPlayer = useRef(new Audio());
  const hasInitialized = useRef(false);

  useEffect(() => {
    return () => audioPlayer.current.pause();
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Send start with the language read at mount time
      sendTextMessage('start', savedLang);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const sendTextMessage = async (text, langOverride, forceNewSession = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const lang = (langOverride || selectedLanguage).toLowerCase();
      const payload = { 
        sessionId: forceNewSession ? null : sessionId, 
        text, 
        language: lang 
      };
      const res = await axios.post(`${API_BASE}/chat/message`, payload);
      if (text !== 'start') setTurns(prev => [...prev, { role: 'user', text }]);
      handleBotResponse(res.data);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
      audioPlayer.current.pause();
    } catch (err) {
      setError('Microphone permission denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    if (sessionId) formData.append('sessionId', sessionId);
    formData.append('language', selectedLanguage.toLowerCase());

    try {
      const res = await axios.post(`${API_BASE}/chat/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.userText) setTurns(prev => [...prev, { role: 'user', text: res.data.userText }]);
      handleBotResponse(res.data);
    } catch (err) {
      setError('Failed to process audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBotResponse = (data) => {
    if (!sessionId && data.sessionId) setSessionId(data.sessionId);
    if (data.botText) setTurns(prev => [...prev, { role: 'bot', text: data.botText }]);
    
    // Fallback to text synthesis if no audio URL is provided
    if (data.botAudioUrl) {
      audioPlayer.current.src = `${BACKEND_URL}${data.botAudioUrl}`;
      audioPlayer.current.play().catch(e => console.log('Autoplay blocked:', e));
    } else if (data.botText) {
      fallbackBrowserTTS(data.botText);
    }
  };

  const restartChat = () => {
    // Save current language and reload the page for a fully clean session
    localStorage.setItem('sahayak_language', selectedLanguage);
    window.location.reload();
  };

  const handleLanguageChange = (lang) => {
    if (lang === selectedLanguage) return;
    // Save new language to localStorage and reload the page
    localStorage.setItem('sahayak_language', lang);
    window.location.reload();
  };

  const fallbackBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Always use hi-IN voice — it has the softest, thinnest female tone
      // and can read English text naturally with an Indian accent
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col">
      
      {/* Top status bar */}
      <div className="flex justify-between items-center px-4 sm:px-8 lg:px-12 py-3 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 text-gray-500 font-medium text-[10px] sm:text-xs">
          <ShieldCheck size={14} className="text-[var(--color-sahayak-rust)]" />
          A trusted guide for your next step
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center bg-gray-100 p-0.5 sm:p-1 rounded-full text-[10px] sm:text-xs font-medium border border-gray-200/60">
          {['Hindi', 'English'].map(lang => (
            <button 
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-all duration-200 ${selectedLanguage === lang ? 'bg-white shadow-sm text-[var(--color-sahayak-sidebar)] font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col lg:flex-row items-center lg:items-center justify-start lg:justify-between w-full mx-auto flex-1 px-4 sm:px-8 lg:px-12 pt-2 pb-12 lg:py-0 transition-all duration-500 ease-in-out ${isChatExpanded ? 'max-w-7xl' : 'max-w-6xl'}`}>
        
        {/* ───── Left: Text & CTA ───── */}
        <div className={`lg:w-1/2 w-full text-center lg:text-left z-10 transition-all duration-500 ease-in-out ${isChatExpanded ? 'opacity-0 scale-95 hidden' : 'opacity-100 scale-100 block'}`}>
          
          {/* Badge – w-fit keeps it compact */}
          <div className="w-fit inline-flex items-center gap-2 bg-[var(--color-sahayak-rust-light)] text-[var(--color-sahayak-rust)] px-4 py-1.5 rounded-full font-bold text-[10px] tracking-[0.15em] mb-5 mx-auto lg:mx-0">
            <Sparkles size={12} /> MADE FOR THE JOURNEY AHEAD
          </div>
          
          {/* Main heading */}
          <h1 className="font-serif text-4xl md:text-[2.6rem] lg:text-[2.8rem] xl:text-[3.5rem] font-black leading-[1.08] mb-5 text-[var(--color-sahayak-sidebar)]">
            A clearer path to{' '}
            <br className="hidden lg:block"/>
            <span className="text-[var(--color-sahayak-rust)] relative inline-block">
              work
              <svg className="absolute -bottom-1 left-0 w-full h-2.5 text-[var(--color-sahayak-yellow)] opacity-50" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,12 Q50,0 100,12" stroke="currentColor" strokeWidth="6" fill="none" />
              </svg>
            </span>{' '}starts with a{' '}
            <br className="hidden lg:block"/>
            conversation.
          </h1>
          
          {/* Subtext */}
          <p className="text-gray-500 text-sm lg:text-[15px] max-w-[420px] mx-auto lg:mx-0 mb-7 leading-relaxed">
            Sahayak listens to what you know, what you enjoy, and where you want to go. Then it finds training and livelihood options that fit your life.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mx-auto lg:mx-0">
            <button 
              onClick={restartChat}
              className="bg-[var(--color-sahayak-sidebar)] hover:bg-[var(--color-sahayak-sidebar-hover)] text-white pl-6 pr-5 py-3 rounded-xl font-semibold flex items-center gap-3 text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 group"
            >
              Start with your voice 
              <span className="bg-white/15 p-1.5 rounded-lg group-hover:bg-white/25 transition-colors">
                <Mic size={14} />
              </span>
            </button>
            <button className="bg-white hover:bg-gray-50 text-[var(--color-sahayak-sidebar)] border border-gray-200 pl-6 pr-5 py-3 rounded-xl font-semibold flex items-center gap-3 text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Talk to Sahayak
              <BookOpen size={15} />
            </button>
          </div>

          {/* Bottom micro-text */}
          <div className="flex items-center gap-6 mt-6 text-xs text-gray-400 font-medium mx-auto lg:mx-0">
            <div className="flex items-center gap-1.5"><Mic size={13} /> No typing needed</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 size={13} /> Your pace, your choice</div>
          </div>
        </div>

        {/* ───── Right: Chat Widget ───── */}
        <div className={`relative flex items-center justify-center py-4 mb-6 lg:mb-0 transition-all duration-500 ease-in-out ${isChatExpanded ? 'w-full max-w-4xl mx-auto h-[75vh]' : 'lg:w-[45%] w-full max-w-[400px]'}`}>
          
          {/* Decorative concentric rings */}
          {!isChatExpanded && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] rounded-full border border-gray-200/40 -z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] rounded-full border border-gray-200/20 -z-10"></div>
            </>
          )}

          <div className={`bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-visible border border-gray-100/80 flex flex-col w-full relative z-10 transition-all duration-500 ${isChatExpanded ? 'h-full' : 'min-h-[400px] flex-1 lg:flex-none lg:h-[400px]'}`}>
            
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-sahayak-yellow)] to-amber-400 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-sahayak-sidebar)]">Sahayak</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Your guide</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div>
                  <span className="text-emerald-500 font-semibold text-[11px] uppercase tracking-wider">Listening</span>
                </div>
                
                {/* Expand/Minimize Toggle */}
                <button 
                  onClick={() => setIsChatExpanded(!isChatExpanded)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors ml-1"
                  title={isChatExpanded ? "Minimize chat" : "Expand chat"}
                >
                  {isChatExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shrink-0 border-b border-red-100">
                <AlertTriangle size={12} /> {error}
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {turns.length === 0 && !isLoading && (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-gray-300 text-xs font-medium">Click the microphone to start</p>
                </div>
              )}
              
              {turns.map((turn, idx) => (
                <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-[85%] px-4 py-2.5 ${
                    turn.role === 'user' 
                      ? 'bg-[var(--color-sahayak-darkblue)] text-white rounded-2xl rounded-tr-sm shadow-sm' 
                      : 'bg-[var(--color-sahayak-beige)] text-[var(--color-sahayak-sidebar)] rounded-2xl rounded-tl-sm'
                  }`}>
                    <p className="text-[13px] font-medium leading-relaxed">
                      {turn.text}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-message">
                  <div className="bg-[var(--color-sahayak-beige)] rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                    <Loader2 className="animate-spin text-gray-400" size={14} />
                    <span className="text-gray-500 text-xs font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Floating side badge */}
            {turns.length > 2 && (
              <div className="absolute -left-5 top-[42%] bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 text-[10px] font-semibold text-gray-600 animate-slide-up z-20 hidden xl:flex">
                <Sparkles size={12} className="text-[var(--color-sahayak-rust)]" />
                That helps me understand your path.
              </div>
            )}

            {/* "Tap to speak" Input Bar */}
            <div className="px-4 pb-4 pt-2 bg-white shrink-0">
              <div className="bg-[var(--color-sahayak-beige)] rounded-2xl py-2 pl-4 pr-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex gap-[3px] items-end ${isRecording ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="w-[3px] h-3 bg-[var(--color-sahayak-rust)] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-[3px] h-4 bg-[var(--color-sahayak-rust)] rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                    <div className="w-[3px] h-3 bg-[var(--color-sahayak-rust)] rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                  <span className="text-[var(--color-sahayak-sidebar)] font-semibold text-[13px]">
                    {isRecording ? 'Listening...' : 'Tap to speak'}
                  </span>
                </div>
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading && !isRecording}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-300 scale-105' 
                      : 'bg-[var(--color-sahayak-rust)] text-white shadow-md shadow-[var(--color-sahayak-rust-light)] hover:scale-110 hover:shadow-lg'
                  } disabled:opacity-50`}
                >
                  {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom floating badge – positioned outside the card */}
          <div className="absolute -bottom-1 left-0 bg-white p-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5 z-20 animate-slide-up hidden lg:flex" style={{animationDelay: '0.5s'}}>
            <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
              <CheckCircle2 size={13} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--color-sahayak-sidebar)] leading-tight">A plan that fits</p>
              <p className="text-[9px] text-gray-400 font-medium">Built around your life</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
