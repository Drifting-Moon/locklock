"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting based on selected language
  useEffect(() => {
    if (isOpen) {
      const greetingText = language === 'hi'
        ? 'नमस्ते कमिश्नर साहब। मैं आपका ग्रिडलॉक एआई ऑफिसर हूँ। अवैध पार्किंग हॉटस्पॉट, देरी की बचत, या गश्त प्राथमिकताओं के बारे में मुझसे पूछें।'
        : 'Hello Commissioner. I am your Gridlock AI Officer. Ask me about illegal parking hotspots, projected delay savings, or which zones need priority patrol action.';
      
      setMessages([
        {
          sender: 'ai',
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, language]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Cancel Speech Synthesis when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05; // Clean clear pitch
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // Auto-detect Hindi or Hinglish keywords
    const isHi = language === 'hi' || q.match(/(कहाँ|ज़ोन|निरीक्षण|देरी|बचत|हॉटस्पॉट|भीड़|गश्त|नमस्ते|हेलो|कमिश्नर|क्रेन|रोड|bheed|bhid|jam|kaise|theek|kya|kahan|per|hai|kis|jaga|thik)/);

    // 1. "How to fix" / Solution / Action
    if (q.includes('theek') || q.includes('thik') || q.includes('kaise') || q.includes('kya kare') || q.includes('kya karen') || q.includes('solution') || q.includes('fix') || q.includes('resolve') || q.includes('clearance') || q.includes('action') || q.includes('hata')) {
      if (q.includes('bheed') || q.includes('jam') || q.includes('crowd') || q.includes('hotspot') || q.includes('subedar') || q.includes('road')) {
        return isHi
          ? "सूबेदार चतरम रोड की भीड़ ठीक करने के लिए तुरंत क्रेन भेजकर अवैध पार्किंग हटवाएं और ट्रैफिक पुलिस बल तैनात करें।"
          : "Deploy towing units to Subedar Chatram Road immediately to clear illegal double-parking and restore the blocked lane.";
      }
      return isHi
        ? "भीड़भाड़ को ठीक करने के लिए संबंधित हॉटस्पॉट पर क्रेन/टोइंग वाहन भेजें और उल्लंघन करने वाली गाड़ियों का चालान करें।"
        : "Deploy towing dispatch units to the targeted hotspot, clear double-parked vehicles, and issue citations.";
    }

    // 2. "Where is the most bheed / crowd / jam"
    if (q.includes('bheed') || q.includes('bhid') || q.includes('jam') || q.includes('crowd') || q.includes('congestion') || q.includes('traffic')) {
      if (q.includes('kahan') || q.includes('where') || q.includes('kis') || q.includes('kaun') || q.includes('per') || q.includes('pe')) {
        return isHi
          ? "सबसे ज्यादा भीड़ सूबेदार चतरम रोड (Subedar Chatram Road) पर है, जहां 18.4 मिनट की औसत देरी दर्ज की गई है।"
          : "Subedar Chatram Road has the highest congestion, causing an average BPR delay of 18.4 minutes.";
      }
      return isHi
        ? "सूबेदार चतरम रोड सबसे बड़ा हॉटस्पॉट है (4,188 उल्लंघन)। इसके बाद कामराज रोड (1,449 उल्लंघन) का नंबर आता है।"
        : "Subedar Chatram Road is the top bottleneck with 4,188 violations, followed by Kamaraj Road with 1,449 violations.";
    }

    // 3. Inspect first / priorities
    if (q.includes('inspect') || q.includes('first') || q.includes('priority') || q.includes('pehle') || q.includes('pahle') || q.includes('inspect first') || q.includes('inspect_first') || q.includes('निरीक्षण') || q.includes('पहले')) {
      return isHi 
        ? "मेट्रो स्टेशन ईस्ट एग्जिट को सबसे पहले देखना चाहिए। इसका इम्पैक्ट स्कोर 91/100 है।"
        : "Inspect Metro Station East Exit first. It has the highest impact score of 91/100.";
    }
    
    // 4. Delay saved / economic savings
    if (q.includes('delay') || q.includes('saved') || q.includes('mitigat') || q.includes('economic') || q.includes('deery') || q.includes('deeri') || q.includes('देरी') || q.includes('बचत') || q.includes('bachat') || q.includes('faida') || q.includes('nuksan')) {
      return isHi
        ? "पिछले 24 घंटों में 2,840 मिनट की देरी बचाई गई है, जिससे ₹4.24 लाख का आर्थिक नुकसान टाला गया है।"
        : "Commuters saved 2,840 minutes of delay today, preventing ₹4.24L in economic losses.";
    }

    // 5. Blindspots / Patrols
    if (q.includes('blindspot') || q.includes('patrol') || q.includes('gashth') || q.includes('gasht') || q.includes('gश्त') || q.includes('ब्लाइंडस्पॉट')) {
      return isHi
        ? "शिवाजीनगर जंक्शन सबसे बड़ा गश्त ब्लाइंडस्पॉट है, जहां गश्त बढ़ाना आवश्यक है।"
        : "Shivajinagar Junction is our highest priority blindspot with a 2.8x mismatch ratio.";
    }

    // Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('नमस्ते') || q.includes('हेलो')) {
      return isHi
        ? "नमस्ते कमिश्नर साहब। मैं ग्रिडलॉक एआई असिस्टेंट हूँ। आदेश दें।"
        : "Hello Commissioner. Standing by for dispatch instructions.";
    }
    
    // Fallback
    return isHi
      ? "सूबेदार चतरम रोड सबसे बड़ा हॉटस्पॉट है (18.4 मिनट विलंब)। वहां क्रेन भेजकर अवैध पार्किंग साफ करवाएं।"
      : "Subedar Chatram Road has the highest bottleneck (18.4m delay). Recommend deploying enforcement wardens to clear it.";
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      const responseText = getAIResponse(textToSend);
      const aiMsg: Message = {
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      speakText(responseText);
    }, 1200);
  };

  const startVoiceRecording = () => {
    if (isListening || isThinking) return;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

          recognition.onstart = () => {
            setIsListening(true);
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
          };

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
              handleSend(transcript);
            }
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            // Fallback voice simulation
            runVoiceSimulation();
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch (e) {
          console.error('Speech recognition failed:', e);
        }
      }
    }

    runVoiceSimulation();
  };

  const runVoiceSimulation = () => {
    setIsListening(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTimeout(() => {
      setIsListening(false);
      const simulatedQuery = language === 'hi' 
        ? "पहले किस ज़ोन का निरीक्षण करना चाहिए?" 
        : "Which zone should we inspect first?";
      handleSend(simulatedQuery);
    }, 2500);
  };

  const suggestedQuestions = language === 'hi'
    ? [
        "पहले किस ज़ोन का निरीक्षण करना चाहिए?",
        "कुल कितनी देरी की बचत हुई है?",
        "सीबीडी में हॉटस्पॉट दिखाएं",
        "कोई गश्त ब्लाइंडस्पॉट है?"
      ]
    : [
        "Which zone should we inspect first?",
        "What is the total delay saved?",
        "Show hotspots in CBD",
        "Any patrol blindspots?"
      ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-[#16171A] border border-[#22252A] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px] animate-pulse">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-none">AI Traffic Assistant</h3>
              <p className="text-white/70 text-[11px] mt-1 font-mono">Gridlock Intel Core v2.1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button 
              onClick={() => {
                const nextLang = language === 'en' ? 'hi' : 'en';
                setLanguage(nextLang);
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors mr-1 uppercase cursor-pointer"
              title="Switch language between English & Hindi"
            >
              {language === 'en' ? 'English (EN)' : 'हिंदी (HI)'}
            </button>

            {/* Audio Toggle */}
            <button 
              onClick={() => {
                const nextMute = !isMuted;
                setIsMuted(nextMute);
                if (nextMute && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>

            {/* Close Button */}
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] max-h-[400px] bg-black/20">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#22252A] border border-white/5 text-[#F4F4F5] rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}
          
          {/* Thinking State */}
          {isThinking && (
            <div className="flex flex-col items-start">
              <div className="bg-[#22252A] border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
              </div>
            </div>
          )}
          
          {/* Listening State Overlay/Visualizer */}
          {isListening && (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center gap-3">
              <p className="text-blue-400 text-xs font-mono animate-pulse">
                {language === 'hi' ? 'सुन रहा हूँ... (बोलना शुरू करें)' : 'LISTENING (Speak now...)'}
              </p>
              
              {/* CSS Bouncing Bar Waveform */}
              <div className="flex items-center gap-1.5 h-8">
                <div className="w-1 bg-blue-500 rounded-full h-3 animate-[pulse_0.5s_infinite_alternate]"></div>
                <div className="w-1 bg-blue-400 rounded-full h-6 animate-[pulse_0.4s_infinite_alternate_0.1s]"></div>
                <div className="w-1 bg-blue-300 rounded-full h-4 animate-[pulse_0.6s_infinite_alternate_0.2s]"></div>
                <div className="w-1 bg-blue-400 rounded-full h-7 animate-[pulse_0.3s_infinite_alternate_0.3s]"></div>
                <div className="w-1 bg-blue-500 rounded-full h-2 animate-[pulse_0.5s_infinite_alternate_0.4s]"></div>
              </div>
              
              <button 
                onClick={() => setIsListening(false)}
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] rounded font-semibold font-mono cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Panel */}
        <div className="p-3 border-t border-[#22252A] bg-black/10">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 px-1">
            {language === 'hi' ? 'सुझाए गए प्रश्न' : 'Suggested Inquiries'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isListening || isThinking}
                className="bg-[#22252A] hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs px-2.5 py-1.5 rounded-full transition-colors cursor-pointer text-left truncate max-w-full disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Input Area */}
        <div className="p-4 border-t border-[#22252A] flex gap-3 items-center">
          {/* Input text */}
          <input
            type="text"
            placeholder={
              isListening 
                ? (language === 'hi' ? "सुन रहा हूँ..." : "Listening...") 
                : (language === 'hi' ? "प्रश्न पूछें..." : "Ask AI Traffic Officer...")
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputValue);
            }}
            disabled={isListening || isThinking}
            className="flex-1 bg-black/40 border border-[#22252A] text-sm text-zinc-200 px-4 py-2.5 rounded-full outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
          />

          {/* Microphone button */}
          <button
            onClick={startVoiceRecording}
            disabled={isListening || isThinking}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
            }`}
            title={language === 'hi' ? "बोलें" : "Speak"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          {/* Send button */}
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isListening || isThinking}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#22252A] text-white disabled:text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
