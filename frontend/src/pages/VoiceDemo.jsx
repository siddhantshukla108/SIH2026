import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mic, Square, Loader2, Volume2, Maximize, RotateCcw, Send, CheckCircle2, Sparkles, AlertTriangle, Lock } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import ThemeToggle from '../components/ThemeToggle';

const API_BASE = 'http://localhost:5000/api';

export default function VoiceDemo() {
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [kioskMode, setKioskMode] = useState(false);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const chatEndRef = useRef(null);
  const audioPlayer = useRef(new Audio());

  const hasInitialized = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('kiosk') === '1') setKioskMode(true);
    return () => audioPlayer.current.pause();
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendTextMessage('start');
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, recommendations]);

  const sendTextMessage = async (text) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/chat/message`, { sessionId, text, language: 'auto' });
      if (text !== 'start') setTurns(prev => [...prev, { role: 'user', text }]);
      handleBotResponse(res.data);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setTextInput('');
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) sendTextMessage(textInput);
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
        stream.getTracks().forEach(track => track.stop()); // cleanup
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
    formData.append('language', 'auto');

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
    if (data.recommendations?.length > 0) setRecommendations(data.recommendations);

    if (data.botAudioUrl) {
      audioPlayer.current.src = `http://localhost:5000${data.botAudioUrl}`;
      audioPlayer.current.play().catch(e => console.log('Autoplay blocked:', e));
    } else if (data.botText) {
      fallbackBrowserTTS(data.botText);
    }
  };

  const fallbackBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Default to Hindi fallback
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const prefVoice = voices.find(v => v.lang.includes('hi'));
      if (prefVoice) utterance.voice = prefVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartOver = () => {
    setSessionId(null);
    setTurns([]);
    setRecommendations([]);
    setError(null);
    audioPlayer.current.pause();
    sendTextMessage('start'); // Auto-restart
  };

  // Screen: Chat Interface
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col font-['Outfit'] ${kioskMode ? 'fixed inset-0 overflow-hidden' : ''}`}>
      
      {/* Header (Glassmorphism) */}
      <header className="glass sticky top-0 z-20 px-4 md:px-6 py-3 md:py-4 shadow-sm flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-indigo-600 p-1.5 md:p-2 rounded-xl shadow-md">
            <Sparkles size={20} className="text-white hidden md:block" />
            <Sparkles size={16} className="text-white md:hidden" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">PM-AJAY Sahayak</h1>
            <p className="text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Aapki awaaz, aapka vikas</p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 items-center">
          <ThemeToggle />
          {!kioskMode && (
            <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-700 transition text-sm font-semibold shadow-sm border border-slate-200 dark:border-slate-700 mr-1 md:mr-2" title="Officer Login">
              <Lock size={14} /> Admin
            </Link>
          )}
          <button onClick={handleStartOver} className="p-2 md:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition shadow-sm" title="Start Over">
            <RotateCcw size={18} className="md:w-5 md:h-5" />
          </button>
          {kioskMode && (
            <button onClick={() => document.documentElement.requestFullscreen()} className="p-2 md:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition shadow-sm" title="Fullscreen">
              <Maximize size={18} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 flex justify-center items-center gap-2 text-sm font-medium border-b border-red-100 animate-slide-up">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-52">
        {turns.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 mt-20 animate-slide-up">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Volume2 size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-medium">Awaaz se baat karne ke liye niche mic dabayein</p>
          </div>
        )}
        
        {turns.map((turn, idx) => (
          <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{animationDelay: '0.1s'}}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              turn.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm bg-gradient-to-br from-indigo-500 to-indigo-600' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
            }`}>
              <p className="text-[16px] leading-relaxed font-medium">
                {turn.text}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="glass border border-slate-200 dark:border-slate-700 rounded-2xl p-4 rounded-tl-sm shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Soch raha hoon...</span>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-8 animate-slide-up">
            <div className="flex items-center gap-2 mb-6 px-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full"><CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" /></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Aapke liye sujhav</h2>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Controls Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 to-transparent pt-16 pointer-events-none z-20">
        
        <div className="max-w-md mx-auto flex justify-center pointer-events-auto relative mb-2 md:mb-4">
          {/* Animated pulsing ring when recording */}
          {isRecording && <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-ring z-0"></div>}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading && !isRecording}
            className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isRecording 
                ? 'bg-rose-500 text-white scale-110 shadow-rose-500/40' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white shadow-indigo-600/30'
            } disabled:opacity-50 disabled:hover:scale-100`}
          >
            {isRecording ? <Square size={32} className="md:w-10 md:h-10" fill="currentColor" /> : <Mic size={36} className="md:w-12 md:h-12" />}
          </button>
        </div>
        
        {/* Type instead box - Hidden in Kiosk Mode */}
        {!kioskMode && (
          <div className="max-w-md mx-auto pointer-events-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mt-6 mb-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <form onSubmit={handleTextSubmit} className="flex items-center">
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type instead (for testing)..." 
                className="flex-1 py-3 px-5 outline-none text-slate-700 dark:text-slate-200 font-medium bg-transparent"
                disabled={isLoading || isRecording}
              />
              <button 
                type="submit" 
                disabled={!textInput.trim() || isLoading || isRecording}
                className="p-3 mr-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-all"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
