"use client";

import React, { useState, useRef, useEffect } from 'react';
import Avatar from '@/components/Avatar';
import ActivityPanel, { LogEntry } from '@/components/ActivityPanel';
import SummaryScreen from '@/components/SummaryScreen';

type AvatarState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function Home() {
  const [state, setState] = useState<AvatarState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isEndingCall, setIsEndingCall] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStarted) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
  useEffect(() => {
    setSessionId(`sess_${Math.random().toString(36).substring(2, 9)}`);
  }, []);
  
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Avatar Lip Sync Refs
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const ttsDataArrayRef = useRef<Uint8Array | null>(null);
  const ttsAnimRef = useRef<number | null>(null);

  const addLog = (type: LogEntry['type'], content: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, content }]);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob, mimeType);
      };

      mediaRecorder.start();
      setState('listening');
      addLog('info', 'Listening... Click "Stop & Send" when done.');
    } catch (err) {
      console.error("Microphone error:", err);
      addLog('info', "Microphone access denied.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
      addLog('info', 'Processing audio...');
    }
  };

  const processAudio = async (audioBlob: Blob, mimeType: string = 'audio/webm') => {
    try {
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const formData = new FormData();
      formData.append("audio", audioBlob, `recording.${ext}`);
      formData.append("session_id", sessionId);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/conversation`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
      addLog('user', data.transcript);
      
      if (data.tools && data.tools.length > 0) {
        data.tools.forEach((t: string) => {
          let prettyTool = `Executing ${t}...`;
          let type: LogEntry['type'] = 'tool';
          
          if (t === 'identify_user') prettyTool = 'identify_user';
          else if (t === 'fetch_slots') prettyTool = 'fetch_slots';
          else if (t === 'book_appointment') {
            prettyTool = 'Appointment booked';
            type = 'success';
          }
          else if (t === 'retrieve_appointments') prettyTool = 'retrieve_appointments';
          else if (t === 'cancel_appointment') {
            prettyTool = 'Appointment cancelled';
            type = 'success';
          }
          else if (t === 'modify_appointment') prettyTool = 'modify_appointment';
          
          addLog(type, prettyTool);
        });
      }
      
      addLog('ai', data.reply);
      
      if (data.audio_base64) {
        playTTSBase64(data.audio_base64);
      } else {
        setState('idle');
      }
      
    } catch (error) {
      console.error("Error processing audio:", error);
      addLog('info', `Error processing audio/network issue.`);
      setState('idle');
    }
  };

  const updateLipSync = () => {
    if (ttsAnalyserRef.current && ttsDataArrayRef.current) {
      ttsAnalyserRef.current.getByteFrequencyData(ttsDataArrayRef.current as any);
      let sum = 0;
      for (let i = 0; i < ttsDataArrayRef.current.length; i++) {
        sum += ttsDataArrayRef.current[i];
      }
      const avg = sum / ttsDataArrayRef.current.length;
      const scale = Math.min(Math.max((avg / 128), 0.0), 1.0);
      
      const mouth = document.getElementById('avatar-mouth');
      if (mouth) {
        mouth.setAttribute('d', `M 42 75 Q 50 ${75 + (scale * 18)} 58 75`);
      }
    }
    ttsAnimRef.current = requestAnimationFrame(updateLipSync);
  };

  const setupTTSAudioContext = (audioEl: HTMLAudioElement) => {
    if (!ttsAudioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      ttsAudioContextRef.current = ctx;
      ttsAnalyserRef.current = analyser;
      ttsDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    if (ttsAudioContextRef.current.state === 'suspended') {
      ttsAudioContextRef.current.resume();
    }
  };

  const playTTSBase64 = (base64Audio: string) => {
    if (!ttsAudioRef.current) return;
    
    setState('speaking');
    const audio = ttsAudioRef.current;
    audio.src = `data:audio/mp3;base64,${base64Audio}`;
    
    audio.onplay = () => {
      setupTTSAudioContext(audio);
      updateLipSync();
    };
    
    audio.onended = () => {
      if (ttsAnimRef.current) cancelAnimationFrame(ttsAnimRef.current);
      const mouth = document.getElementById('avatar-mouth');
      if (mouth) mouth.setAttribute('d', 'M 42 75 Q 50 75 58 75');
      setState('idle');
    };
    
    audio.play().catch(e => {
      console.error("Audio playback failed:", e);
      setState('idle');
    });
  };

  const endConversation = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());

    addLog('info', 'Generating summary...');
    setState('processing');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/conversation/${sessionId}/summary`, {
        method: "POST"
      });
      const data = await res.json();
      addLog('success', "Summary generated (check console)");
      
      if (!data.timestamp) {
        data.timestamp = new Date().toLocaleString('en-GB', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true
        }).toUpperCase().replace(',', '');
      }
      
      setSummaryData(data);
      setState('idle');
    } catch(err) {
      console.error(err);
      setState('idle');
    }
  };

  if (!callStarted) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-6 max-w-md">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-5xl mb-4">
            📞
          </div>
          <h1 className="text-3xl font-bold text-slate-800">MyKare Assistant</h1>
          <p className="text-slate-500 mb-4">Call our AI voice assistant to book, check, or cancel your appointments.</p>
          <button 
            onClick={() => {
              setCallStarted(true);
              setDuration(0);
            }}
            className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-xl transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-3"
          >
            <span>📞</span> Start Call
          </button>
        </div>
      {summaryData && (
        <SummaryScreen 
          summary={summaryData} 
          duration={duration} 
          toolCallsCount={logs.filter(l => l.type === 'tool' || l.type === 'success').length}
          onClose={() => setSummaryData(null)} 
        />
      )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        <audio ref={ttsAudioRef} className="hidden" />
        
        {/* Left Column: Controls & Transcript */}
        <div className="flex flex-col gap-6 w-full">
          {/* Avatar & Call Controls */}
          <div className="flex flex-col items-center gap-6 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 w-full">
          
          <div className="flex flex-col items-center mb-2">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📞</span> Healthcare Voice Assistant
            </h1>
            <div className="text-slate-500 font-medium mt-2 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              Call Status: Connected • {formatDuration(duration)}
            </div>
          </div>

          <Avatar state={state} />
          
          {/* Status Indicator */}
          <div className="text-lg font-semibold flex items-center justify-center h-8 my-2">
            {state === 'idle' && <span className="text-slate-500">⚪ Ready</span>}
            {state === 'listening' && <span className="text-green-500 animate-pulse">🟢 Listening...</span>}
            {state === 'processing' && <span className="text-yellow-500 animate-pulse">🟡 Processing...</span>}
            {state === 'speaking' && <span className="text-blue-500 animate-pulse">🔵 Speaking...</span>}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
            {state === 'idle' && (
              <button 
                onClick={startListening}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>🎤</span> Start Speaking
              </button>
            )}

            {state === 'listening' && (
              <button 
                onClick={stopListening}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-lg transition-colors shadow-md hover:shadow-lg animate-pulse"
              >
                Stop & Send
              </button>
            )}

            <button 
              disabled={isEndingCall}
              onClick={async () => {
                setIsEndingCall(true);
                await endConversation();
                setIsEndingCall(false);
                setCallStarted(false);
              }}
              className={`w-full px-6 py-4 rounded-full font-bold transition-colors mt-2 flex items-center justify-center gap-2 ${
                isEndingCall ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              {isEndingCall ? (
                <>⏳ Generating Summary...</>
              ) : (
                <><span>☎️</span> End Call</>
              )}
            </button>
          </div>
        </div>

        {/* Conversation Transcript Panel */}
        {logs.filter(l => l.type === 'user' || l.type === 'ai').length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 w-full">
            <h3 className="font-semibold text-slate-700 mb-4 px-2 border-b border-slate-100 pb-2">Conversation Transcript</h3>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto px-2">
              {logs
                .filter(log => log.type === 'user' || log.type === 'ai')
                .map((log, i) => (
                  <div key={i} className={`flex flex-col ${log.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-semibold text-slate-400 mb-1">
                      {log.type === 'user' ? 'User' : 'Assistant'}
                    </span>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${
                      log.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      {log.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Activity Panel */}
      <div className="flex justify-center w-full sticky top-8">
        <ActivityPanel logs={logs} />
      </div>

      </div>

      {summaryData && (
        <SummaryScreen 
          summary={summaryData} 
          duration={duration} 
          toolCallsCount={logs.filter(l => l.type === 'tool' || l.type === 'success').length}
          onClose={() => setSummaryData(null)} 
        />
      )}
    </main>
  );
}
