"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface LanguageOption {
  code: string;
  label: string;
  native: string;
  locale: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 22 Scheduled Indian Languages + English
const languagesList: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English (EN)', locale: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी (HI)', locale: 'hi-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు (TE)', locale: 'te-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ (KN)', locale: 'kn-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ் (TA)', locale: 'ta-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা (BN)', locale: 'bn-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी (MR)', locale: 'mr-IN' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી (GU)', locale: 'gu-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം (ML)', locale: 'ml-IN' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ (PA)', locale: 'pa-IN' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ (OR)', locale: 'or-IN' },
  { code: 'ur', label: 'Urdu', native: 'اردو (UR)', locale: 'ur-IN' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া (AS)', locale: 'as-IN' },
  { code: 'ks', label: 'Kashmiri', native: 'کأشُر (KS)', locale: 'ks-IN' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली (NE)', locale: 'ne-IN' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम् (SA)', locale: 'sa-IN' },
  { code: 'sd', label: 'Sindhi', native: 'सिंधी (SD)', locale: 'sd-IN' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी (KOK)', locale: 'kok-IN' },
  { code: 'brx', label: 'Bodo', native: 'बोडो (BRX)', locale: 'brx-IN' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी (DOI)', locale: 'doi-IN' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली (MAI)', locale: 'mai-IN' },
  { code: 'mni', label: 'Manipuri', native: 'মণিপুরী (MNI)', locale: 'mni-IN' },
  { code: 'sat', label: 'Santali', native: 'சந்தாலி (SAT)', locale: 'sat-IN' }
];

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [language, setLanguage] = useState<string>('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = languagesList.find(l => l.code === language) || languagesList[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Close language dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize greeting based on selected language
  useEffect(() => {
    if (isOpen) {
      let greetingText = '';
      if (language === 'hi') {
        greetingText = 'नमस्ते कमिश्नर साहब। मैं आपका ग्रिडलॉक एआई ऑफिसर हूँ। अवैध पार्किंग हॉटस्पॉट, देरी की बचत, या गश्त प्राथमिकताओं के बारे में मुझसे पूछें।';
      } else if (language === 'te') {
        greetingText = 'నమస్కారం కమిషనర్ గారు. నేను మీ గ్రిడ్‌లాక్ AI ఆఫీసర్‌ని. ట్రాఫిక్ హాట్‌స్పాట్‌లు, ఆలస్యం నివారణ లేదా ప్రాధాన్యత గల పెట్రోలింగ్ గురించి నన్ను అడగండి.';
      } else if (language === 'kn') {
        greetingText = 'ನಮಸ್ಕಾರ ಕಮೀಷನರ್ ಅವರೇ. ನಾನು ನಿಮ್ಮ ಗ್ರಿಡ್‌ಲಾಕ್ AI ಆಫೀಸರ್. ಅಕ್ರಮ ಪಾರ್ಕಿಂಗ್ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು, ವಿಳಂಬ ಉಳಿತಾಯ ಅಥವಾ ಗಸ್ತು ಆದ್ಯತೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.';
      } else if (language === 'ta') {
        greetingText = 'வணக்கம் ஆணையர் அவர்களே. நான் உங்கள் கிரிட்லாக் AI அதிகாரி. சட்டவிரோத பார்க்கிங், போக்குவரத்து தாமதம் பற்றி என்னிடம் கேளுங்கள்.';
      } else {
        greetingText = `Hello Commissioner. I am your Gridlock AI Officer. Ask me about illegal parking hotspots, projected delay savings, or which zones need priority patrol action. [Language: ${currentLangObj.label}]`;
      }
      
      setMessages([
        {
          sender: 'ai',
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, language]);

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
      utterance.pitch = 1.05;
      utterance.lang = currentLangObj.locale;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // Auto-detect script to respond in the appropriate language
    const isTe = language === 'te' || q.match(/(ఎలా|ఏ|జోన్|తనిఖీ|రద్దీ|హాట్‌స్పాట్|సమయం|ఆదా|పరిష్కారం|గారు|నమస్కారం)/);
    const isKn = language === 'kn' || q.match(/(ಹೇಗೆ|ಯಾವ|ವಲಯ|ಪರಿಶೀಲಿಸಬೇಕು|ರದ್ದತಿ|ಹಾಟ್‌ಸ್ಪಾಟ್|ಸಮಯ|ಉಳಿಸಲಾಗಿದೆ|ಅವರೇ|ನಮಸ್ಕಾರ)/);
    const isTa = language === 'ta' || q.match(/(எப்படி|எந்த|ஆய்வு|நெரிசல்|ஹாட்ஸ்பாட்|நேரம்|சேமிக்க|ஆணையர்|வணக்கம்)/);
    const isHi = language === 'hi' || q.match(/(कहाँ|ज़ोन|निरीक्षण|देरी|बचत|हॉटस्पॉट|भीड़|गश्त|नमस्ते|हेलो|कमिश्नर|bheed|bhid|jam|kaise|theek|kya|kahan|per|hai|kis|jaga|thik)/);

    // Q1: Solution / How to fix
    if (q.includes('theek') || q.includes('thik') || q.includes('kaise') || q.includes('kya kare') || 
        q.includes('kya karen') || q.includes('solution') || q.includes('fix') || q.includes('resolve') || 
        q.includes('clearance') || q.includes('action') || q.includes('hata') || q.includes('పరిష్కారం') || 
        q.includes('ఎలా') || q.includes('హేಗೆ') || q.includes('ಸರಿಪಡಿಸಲು') || q.includes('எப்படி') || q.includes('சரிசெய்ய')) {
      
      if (isTe) {
        return "సుబేదార్ చత్రం రోడ్ వద్ద అక్రమ పార్కింగ్ ను వెంటనే క్లియర్ చేయడానికి అక్కడకు క్రేన్లు మరియు నివారణ బలగాలను పంపించండి.";
      }
      if (isKn) {
        return "ಸುಬೇದಾರ್ ಚತ್ರಂ ರಸ್ತೆಯ ಅಕ್ರಮ ಪಾರ್ಕಿಂಗ್ ತೆರವುಗೊಳಿಸಲು ತಕ್ಷಣವೇ ಟೋಯಿಂಗ್ ಕ್ರೇನ್ ಕಳುಹಿಸಿ ಮತ್ತು ಸಂಚಾರ ಸುಗಮಗೊಳಿಸಿ.";
      }
      if (isTa) {
        return "சுபேதார் சத்ரம் சாலையின் நெரிசலைச் சரிசெய்ய உடனடியாக கிறேன் அனுப்பி அங்குள்ள சட்டவிரோத பார்க்கிங்கை அகற்றவும்.";
      }
      if (isHi) {
        return "सूबेदार चतरम रोड की भीड़ ठीक करने के लिए तुरंत क्रेन भेजकर अवैध पार्किंग हटवाएं और ट्रैफिक पुलिस बल तैनात करें।";
      }
      return "Deploy towing units to Subedar Chatram Road immediately to clear illegal double-parking and restore the blocked lane.";
    }

    // Q2: Where is the most bheed / crowd / jam
    if (q.includes('bheed') || q.includes('bhid') || q.includes('jam') || q.includes('crowd') || 
        q.includes('congestion') || q.includes('traffic') || q.includes('రద్దీ') || q.includes('రద్దీగా') || 
        q.includes('ರದ್ದತಿ') || q.includes('ರಸ್ತೆ') || q.includes('நெரிசல்') || q.includes('போக்குவரத்து')) {
      
      if (isTe) {
        return "అత్యంత రద్దీగా ఉండే ప్రాంతం సుబేదార్ చత్రం రోడ్, ఇక్కడ సగటు ఆలస్యం సమయం 18.4 నిమిషాలుగా నమోదైంది.";
      }
      if (isKn) {
        return "ಅತಿ ಹೆಚ್ಚು ಟ್ರಾಫಿಕ್ ರದ್ದತಿ ಸುಬೇದಾರ್ ಚತ್ರಂ ರಸ್ತೆಯಲ್ಲಿದೆ, ಅಲ್ಲಿ ಸರಾಸರಿ 18.4 ನಿಮಿಷಗಳ ವಿಳಂಬವಿದೆ.";
      }
      if (isTa) {
        return "சுபேதார் சத்ரம் சாலையில் மிக அதிக நெரிசல் உள்ளது, அங்கு சராசரியாக 18.4 நிமிடங்கள் தாமதம் ஏற்படுகிறது.";
      }
      if (isHi) {
        return "सबसे ज्यादा भीड़ सूबेदार चतरम रोड (Subedar Chatram Road) पर है, जहां 18.4 मिनट की औसत देरी दर्ज की गई है।";
      }
      return "Subedar Chatram Road has the highest congestion, causing an average BPR delay of 18.4 minutes.";
    }

    // Q3: Inspect first
    if (q.includes('inspect') || q.includes('first') || q.includes('priority') || q.includes('pehle') || 
        q.includes('pahle') || q.includes('మొదట') || q.includes('తనిఖీ') || q.includes('ಮೊದಲು') || 
        q.includes('ಪರಿಶೀಲಿಸಬೇಕು') || q.includes('முதலில்') || q.includes('ஆய்வு')) {
      
      if (isTe) {
        return "మెట్రో స్టేషన్ ఈస్ట్ ఎగ్జిట్ ను మొదట తనిఖీ చేయండి. దీని ఇంపాక్ట్ స్కోర్ 91/100.";
      }
      if (isKn) {
        return "ಮೆಟ್ರೋ ಸ್ಟೇಷನ್ ಈಸ್ಟ್ ಎಕ್ಸಿಟ್ ಅನ್ನು ಮೊದಲು ಪರಿಶೀಲಿಸಬೇಕು. ಇದರ ಇಂಪ್ಯಾಕ್ಟ್ ಸ್ಕೋರ್ 91/100 ಆಗಿದೆ.";
      }
      if (isTa) {
        return "மெட்ரோ ஸ்டேஷன் கிழக்கு வெளியேறும் பகுதியை முதலில் ஆய்வு செய்யவும். அதன் தாக்க மதிப்பு 91/100.";
      }
      if (isHi) {
        return "मेट्रो स्टेशन ईस्ट एग्जिट को सबसे पहले देखना चाहिए। इसका इम्पैक्ट स्कोर 91/100 है।";
      }
      return "Inspect Metro Station East Exit first. It has the highest impact score of 91/100.";
    }

    // Q4: Savings
    if (q.includes('delay') || q.includes('saved') || q.includes('mitigat') || q.includes('economic') || 
        q.includes('ఆదా') || q.includes('సమయం') || q.includes('ಉಳಿಸಲಾಗಿದೆ') || q.includes('சேமிக்க') || q.includes('சேமிப்பு')) {
      
      if (isTe) {
        return "నేడు మొత్తం 2,840 నిమిషాల సమయం ఆదా అయింది, దీనివల్ల ₹4.24 లక్షల ఆర్థిక నష్టం నివారించబడింది.";
      }
      if (isKn) {
        return "ಇಂದು ಒಟ್ಟು 2,840 ನಿಮಿಷಗಳ ಸಮಯ ಉಳಿಸಲಾಗಿದೆ, ಇದರ ಮೌಲ್ಯ ₹4.24 ಲಕ್ಷ ಆರ್ಥಿಕ ಉಳಿತಾಯವಾಗಿದೆ.";
      }
      if (isTa) {
        return "இன்று 2,840 நிமிடங்கள் தாமதம் சேமிக்கப்பட்டு, ₹4.24 லட்சம் பொருளாதார இழப்பு தடுக்கப்பட்டுள்ளது.";
      }
      if (isHi) {
        return "पिछले 24 घंटों में 2,840 मिनट की देरी बचाई गई है, जिससे ₹4.24 लाख का आर्थिक नुकसान टाला गया है।";
      }
      return "Commuters saved 2,840 minutes of delay today, preventing ₹4.24L in economic losses.";
    }

    // Q5: Blindspots
    if (q.includes('blindspot') || q.includes('patrol') || q.includes('gashth') || 
        q.includes('gasht') || q.includes('బ్లాइंडస్పాట్') || q.includes('బ్లైండ్‌స్పాట్') || 
        q.includes('ಬ್ಲೈಂಡ್‌ಸ್ಪಾಟ್') || q.includes('பிளைண்ட்ஸ்பாட்')) {
      
      if (isTe) {
        return "శివాజీనగర్ జంక్షన్ అత్యంత ప్రాధాన్యత కలిగిన గస్తీ బ్లైండ్‌స్పాట్. అక్కడ గస్తీ పెంచండి.";
      }
      if (isKn) {
        return "ಶಿವಾಜಿನಗರ ಜಂಕ್ಷನ್ ನಮ್ಮ ಪ್ರಮುಖ ಗಸ್ತು ಬ್ಲೈಂಡ್‌ಸ್ಪಾಟ್ ಆಗಿದೆ. ಗಸ್ತು ನಿಯೋಜನೆ ಹೆಚ್ಚಿಸಿ.";
      }
      if (isTa) {
        return "சிவாஜிநகர் சந்திப்பு மிக முக்கியமான பிளைண்ட்ஸ்பாட் ஆகும். அங்கு ரோந்துப் பணியை அதிகரிக்கவும்.";
      }
      if (isHi) {
        return "शिवाजीनगर जंक्शन सबसे बड़ा गश्त ब्लाइंडस्पॉट है, जहां गश्त बढ़ाना आवश्यक है।";
      }
      return "Shivajinagar Junction is our highest priority blindspot with a 2.8x mismatch ratio.";
    }

    // Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('வணக்கம்') || q.includes('ನಮಸ್ಕಾರ') || q.includes('నమస్కారం')) {
      if (isTe) return "నమస్కారం కమిషనర్ గారు. నేను మీకు ఎలా సహాయపడగలను?";
      if (isKn) return "ನಮಸ್ಕಾರ ಕಮೀಷನರ್ ಅವರೇ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
      if (isTa) return "வணக்கம் ஆணையர் அவர்களே. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?";
      if (isHi) return "नमस्ते कमिश्नर साहब। मैं ग्रिडलॉक एआई असिस्टेंट हूँ। आदेश दें।";
      return "Hello Commissioner. Standing by for dispatch instructions.";
    }

    // Generic fallbacks in chosen languages
    if (isTe) {
      return "నేను లైవ్ ట్రాఫిక్ క్లస్టర్లను విశ్లేషిస్తున్నాను. అత్యవసర గస్తీ కోసం సుబేదార్ చత్రం రోడ్ ను ప్రాధాన్యతగా తీసుకోండి.";
    }
    if (isKn) {
      return "ನಾವು ಸಂಚಾರ ದಟ್ಟಣೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ. ಸುಬೇದಾರ್ ಚತ್ರಂ ರಸ್ತೆಗೆ ಗಸ್ತು ಕಳುಹಿಸಲು ಆದ್ಯತೆ ನೀಡಿ.";
    }
    if (isTa) {
      return "போக்குவரத்து நெரிசலை ஆய்வு செய்து வருகிறேன். சுபேதார் சத்ரம் சாலையில் ரோந்துப் பணிகளை மேற்கொள்ள முன்னுரிமை கொடுங்கள்.";
    }
    if (isHi) {
      return "सूबेदार चतरम रोड सबसे बड़ा हॉटस्पॉट है (18.4 मिनट विलंब)। वहां क्रेन भेजकर अवैध पार्किंग साफ करवाएं।";
    }
    return `Understood. Analyzing live dataset coordination for [${currentLangObj.label}]. Recommend reviewing the congestion sandbox metrics.`;
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
          recognition.lang = currentLangObj.locale;

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
            runVoiceSimulation();
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch (e) {
          console.error('Speech recognition failed to start:', e);
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
      let simulatedQuery = "Which zone should we inspect first?";
      if (language === 'hi') simulatedQuery = "पहले किस ज़ोन का निरीक्षण करना चाहिए?";
      else if (language === 'te') simulatedQuery = "మనం మొదట ఏ జోన్‌ను తనిఖీ చేయాలి?";
      else if (language === 'kn') simulatedQuery = "ನಾವು ಮೊದಲು ಯಾವ ವಲಯವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು?";
      else if (language === 'ta') simulatedQuery = "நாம் முதலில் எந்தப் பகுதியை ஆய்வு செய்ய வேண்டும்?";
      
      handleSend(simulatedQuery);
    }, 2500);
  };

  const suggestedQuestions = (() => {
    if (language === 'hi') {
      return ["पहले किस ज़ोन का निरीक्षण करना चाहिए?", "कुल कितनी देरी की बचत हुई है?", "सीबीडी में हॉटस्पॉट दिखाएं", "कोई गश्त ब्लाइंडस्पॉट है?"];
    }
    if (language === 'te') {
      return ["మనం మొదట ఏ జోన్‌ను తనిఖీ చేయాలి?", "మొత్తం ఎంత సమయం ఆదా అయింది?", "CBD లో హాట్‌స్పాట్‌లను చూపించు", "ఏదైనా పెట్రోలింగ్ బ్లైండ్‌స్పాట్ ఉందా?"];
    }
    if (language === 'kn') {
      return ["ನಾವು ಮೊದಲು ಯಾವ ವಲಯವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು?", "ಒಟ್ಟು ಎಷ್ಟು ಸಮಯ ಉಳಿಸಲಾಗಿದೆ?", "CBD ಯಲ್ಲಿ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ತೋರಿಸಿ", "ಯಾವುದೇ ಗಸ್ತು ಬ್ಲೈಂಡ್‌ಸ್ಪಾಟ್ ಇದೆಯೇ?"];
    }
    if (language === 'ta') {
      return ["நாம் முதலில் எந்தப் பகுதியை ஆய்வு செய்ய வேண்டும்?", "மொத்தம் எவ்வளவு நேரம் சேமிக்கப்பட்டுள்ளது?", "சிபிடியில் உள்ள ஹாட்ஸ்பாட்களைக் காட்டு", "ஏதேனும் ரோந்து பிளைண்ட்ஸ்பாட் உள்ளதா?"];
    }
    return ["Which zone should we inspect first?", "What is the total delay saved?", "Show hotspots in CBD", "Any patrol blindspots?"];
  })();

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
            {/* Custom Indian Scheduled Languages Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 uppercase"
                title="Select from 22 Scheduled Languages of India"
              >
                <span>{currentLangObj.label} ({currentLangObj.code.toUpperCase()})</span>
                <span className="material-symbols-outlined text-[12px] leading-none">expand_more</span>
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#16171A] border border-[#22252A] rounded-xl shadow-2xl overflow-y-auto max-h-[300px] z-50 p-1 flex flex-col gap-0.5">
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1 select-none border-b border-white/5 mb-1">
                    Scheduled Languages
                  </div>
                  {languagesList.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className={`flex items-center justify-between px-3 py-1.5 text-xs rounded transition-colors text-left cursor-pointer w-full ${
                        language === lang.code
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-[#F4F4F5] hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.label} ({lang.code.toUpperCase()})</span>
                      <span className="text-[9px] opacity-60 font-mono">{lang.native.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                {language === 'hi' ? 'सुन रहा हूँ... (बोलना शुरू करें)' : 
                 language === 'te' ? 'వింటున్నాను... (మాట్లాడండి)' : 
                 language === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ... (ಮಾತನಾಡಿ)' : 
                 language === 'ta' ? 'கேட்டுக்கொண்டிருக்கிறேன்... (பேசவும்)' : 
                 'LISTENING (Speak now...)'}
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
                {language === 'hi' ? 'रद्द करें' : 
                 language === 'te' ? 'రద్దు చేయి' : 
                 language === 'kn' ? 'ರದ್ದುಗೊಳಿಸಿ' : 
                 language === 'ta' ? 'ரத்துசெய்' : 
                 'Cancel'}
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Panel */}
        <div className="p-3 border-t border-[#22252A] bg-black/10">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 px-1">
            {language === 'hi' ? 'सुझाए गए प्रश्न' : 
             language === 'te' ? 'సూచించిన ప్రశ్నలు' : 
             language === 'kn' ? 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು' : 
             language === 'ta' ? 'பரிந்துரைக்கப்பட்ட கேள்விகள்' : 
             'Suggested Inquiries'}
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
                ? (language === 'hi' ? "सुन रहा हूँ..." : 
                   language === 'te' ? "వింటున్నాను..." : 
                   language === 'kn' ? "ಕೇಳುತ್ತಿದ್ದೇನೆ..." : 
                   language === 'ta' ? "கேட்டுக்கொண்டிருக்கிறேன்..." : 
                   "Listening...") 
                : (language === 'hi' ? "प्रश्न पूछें..." : 
                   language === 'te' ? "ప్రశ్న అడగండి..." : 
                   language === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ..." : 
                   language === 'ta' ? "கேள்வி கேட்கவும்..." : 
                   "Ask AI Traffic Officer...")
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
            title={language === 'hi' ? "बोलें" : 
                   language === 'te' ? "మాట్లాడండి" : 
                   language === 'kn' ? "ಮಾತನಾಡಿ" : 
                   language === 'ta' ? "பேசவும்" : 
                   "Speak"}
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
