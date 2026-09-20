import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, Volume2, Maximize } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';

const API_BASE = 'http://localhost:5000/api';

export default function VoiceDemo() {
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [kioskMode, setKioskMode] = useState(false);
  const [error, setError] = useState(null);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const chatEndRef = useRef(null);
  const audioPlayer = useRef(new Audio());

  useEffect(() => {
    // Check for kiosk mode in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('kiosk') === '1') {
      setKioskMode(true);
    }

    // Initial greeting on load
    sendTextMessage('start');
    
    return () => {
      audioPlayer.current.pause();
    };
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, recommendations]);

  const sendTextMessage = async (text) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/chat/message`, {
        sessionId,
        text,
        language: 'hi'
      });
      handleBotResponse(res.data);
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
      
      // Stop previous audio if playing
      audioPlayer.current.pause();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone permission denied or not available.');
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
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    formData.append('language', 'hi');

    try {
      const res = await axios.post(`${API_BASE}/chat/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Add user's transcribed text to chat
      if (res.data.userText) {
        setTurns(prev => [...prev, { role: 'user', text: res.data.userText }]);
      }
      
      handleBotResponse(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to process audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBotResponse = (data) => {
    if (!sessionId && data.sessionId) {
      setSessionId(data.sessionId);
    }
    
    // Don't duplicate user text if it was a text message (we handle that differently), 
    // but we already handled the audio transcription above.
    
    // Add bot text
    if (data.botText) {
      setTurns(prev => [...prev, { role: 'bot', text: data.botText }]);
    }
    
    if (data.recommendations && data.recommendations.length > 0) {
      setRecommendations(data.recommendations);
    }

    // Handle TTS
    if (data.botAudioUrl) {
      audioPlayer.current.src = `http://localhost:5000${data.botAudioUrl}`;
      audioPlayer.current.play().catch(e => console.log('Autoplay blocked:', e));
    } else if (data.botText) {
      // Fallback to browser TTS if backend didn't provide audio
      fallbackBrowserTTS(data.botText);
    }
  };

  const fallbackBrowserTTS = (text) => {
    // Only use browser TTS if speech synthesis is available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Set to Hindi
      utterance.rate = 0.9; // Slightly slower for clarity
      
      // Try to find a Google Hindi voice if available, else use default
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('hi-IN'));
      if (hiVoice) utterance.voice = hiVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${kioskMode ? 'fixed inset-0 overflow-hidden' : ''}`}>
      
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold">PM-AJAY Sahayak</h1>
          <p className="text-indigo-200 text-xs mt-1">Aapki awaaz, aapka vikas</p>
        </div>
        {kioskMode && (
          <button onClick={enterFullScreen} className="p-2 bg-indigo-700 rounded-full hover:bg-indigo-800 transition">
            <Maximize size={20} />
          </button>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 text-center text-sm font-medium">
          {error}
        </div>
      )}

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        {turns.length === 0 && !isLoading && (
          <div className="text-center text-slate-400 mt-20">
            <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Awaaz se baat karne ke liye mic dabayein...</p>
          </div>
        )}
        
        {turns.map((turn, idx) => (
          <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              turn.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
            }`}>
              <p className="text-[15px] leading-relaxed font-medium">
                {turn.text}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-tl-sm shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={20} />
              <span className="text-slate-500 text-sm font-medium animate-pulse">Soch raha hoon...</span>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" />
              Aapke liye sujhav:
            </h2>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Voice Controls (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 pointer-events-none">
        <div className="max-w-md mx-auto flex justify-center pointer-events-auto relative">
          
          {/* Ripple Effect when recording */}
          {isRecording && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading && !isRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/40' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/40'
            } ${isLoading && !isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <Square size={36} className="text-white fill-current" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-center mt-4 text-slate-500 text-sm font-medium pointer-events-auto">
          {isRecording ? 'Bolne ke baad dabayein...' : 'Baat karne ke liye dabayein'}
        </p>
      </div>
    </div>
  );
}
