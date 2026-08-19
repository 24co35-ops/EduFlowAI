import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  MessageSquareCode, 
  CheckCircle2, 
  HelpCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function DoubtSolverPage({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'bob',
      text: `Hello ${user?.name || 'there'}! 👋 I am your EduFlow AI Tutor powered by IBM BOB (watsonx.ai Granite Chat). \n\nAsk me any doubt from your syllabus, and I'll explain it step-by-step!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [syllabusScope, setSyllabusScope] = useState('Class 10 Science & Technology Curriculum');
  const [botThinking, setBotThinking] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;

    socket.on('bot_status', (data) => {
      if (data.status === 'thinking') {
        setBotThinking(true);
      }
    });

    socket.on('receive_message', (data) => {
      setBotThinking(false);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botThinking]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setBotThinking(true);

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        message: inputText,
        syllabusScope,
        history: messages.slice(-5)
      });
    }

    setInputText('');
  };

  const handlePresetQuestion = (qText) => {
    setInputText(qText);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" /> Feature F4: IBM watsonx.ai Granite Chat
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">AI Student Doubt Solver</h1>
          <p className="text-xs text-slate-400">Curriculum-aligned live doubt tutor powered by IBM BOB</p>
        </div>

        {/* Scope Tag */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-medium">{syllabusScope}</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[650px] shadow-2xl">
        
        {/* Chat Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs space-y-1.5 border shadow-sm ${
                    isUser
                      ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                      <Sparkles className="w-3 h-3" /> IBM BOB Tutor
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Thinking Indicator */}
          {botThinking && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>IBM BOB is processing your syllabus query...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Suggestions:</span>
          {[
            'Explain Photosynthesis formula',
            'What is Ohm Law V=IR?',
            'Explain Newton Third Law',
            'Difference between Series & Parallel'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetQuestion(chip)}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors flex-shrink-0"
            >
              💡 {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or doubt here..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || botThinking}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
