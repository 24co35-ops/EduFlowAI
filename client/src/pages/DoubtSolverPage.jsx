import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  BookOpen,
  Zap,
  Lightbulb,
  HelpCircle,
  ListChecks
} from 'lucide-react';
import API from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

export default function DoubtSolverPage({ user }) {
  const displayName = user?.name || 'Student';

  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'bob',
      text: `Hello ${displayName}! 👋 I am your EduFlow AI Tutor powered by IBM BOB (watsonx.ai Granite Chat). \n\nAsk me any doubt from your syllabus, and I'll explain it step-by-step!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [syllabusScope, setSyllabusScope] = useState('Class 10 Science & Technology Curriculum');
  const [botThinking, setBotThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botThinking]);

  const handleSendMessage = async (e, customAction = 'standard', customMessage = null) => {
    if (e) e.preventDefault();
    const question = customMessage || inputText.trim();
    if (!question || botThinking) return;

    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: customAction !== 'standard' ? `[${customAction.toUpperCase()}]: ${question}` : question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setBotThinking(true);

    try {
      const res = await API.post('/student/doubt', {
        message: question,
        syllabusScope,
        history: messages.slice(-6),
        action: customAction
      });

      const botReply = res.data?.reply || 'I could not generate a response. Please try again.';
      
      setMessages(prev => [...prev, {
        id: 'msg-bot-' + Date.now(),
        sender: 'bob',
        text: botReply,
        _aiMetadata: res.data?._aiMetadata,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'msg-err-' + Date.now(),
        sender: 'bob',
        text: `⚠️ Connection error. Please check that the server is running and try again.\n\nError: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setBotThinking(false);
    }
  };

  const PRESET_QUESTIONS = [
    'Explain Photosynthesis formula',
    'What is Ohm Law V=IR?',
    'Explain Newton Third Law',
    'Difference between Series & Parallel circuits',
    'What are acids and bases?'
  ];

  const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')?.text?.replace(/^\[.*?\]:\s*/, '') || 'Ohm Law';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" /> Feature F4: AI Doubt Solver
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">AI Student Doubt Solver</h1>
          <p className="text-xs text-slate-400">Curriculum-aligned live doubt tutor powered by IBM watsonx.ai Granite</p>
        </div>

        {/* Scope Tag */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 self-start sm:self-auto">
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
                  className={`p-4 rounded-2xl text-xs space-y-1.5 border shadow-sm max-w-[80%] ${
                    isUser
                      ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                      <Sparkles className="w-3 h-3" /> IBM BOB Granite Tutor
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>
                  {msg._aiMetadata && (
                    <div className="pt-1">
                      <AIEvidenceBadge metadata={msg._aiMetadata} compact={true} />
                    </div>
                  )}
                  <div className={`text-[9px] mt-1 ${isUser ? 'text-emerald-200' : 'text-slate-600'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <span>IBM BOB is synthesizing explanation...</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:'0ms'}}/>
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:'150ms'}}/>
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:'300ms'}}/>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Action Chips (Simplify, Example, Quiz Me) */}
        <div className="px-6 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex-shrink-0">Tutor Actions:</span>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'simplify', lastUserMessage)}
            disabled={botThinking}
            className="px-3 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-[11px] font-semibold text-indigo-200 flex items-center gap-1 transition-all flex-shrink-0 disabled:opacity-40"
          >
            <Zap className="w-3 h-3 text-indigo-400" /> Simplify Concept
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'example', lastUserMessage)}
            disabled={botThinking}
            className="px-3 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-[11px] font-semibold text-emerald-200 flex items-center gap-1 transition-all flex-shrink-0 disabled:opacity-40"
          >
            <Lightbulb className="w-3 h-3 text-emerald-400" /> Give Real-World Example
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'quiz_me', lastUserMessage)}
            disabled={botThinking}
            className="px-3 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-[11px] font-semibold text-purple-200 flex items-center gap-1 transition-all flex-shrink-0 disabled:opacity-40"
          >
            <ListChecks className="w-3 h-3 text-purple-400" /> Quiz Me on This
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Quick Topics:</span>
          {PRESET_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(chip);
              }}
              disabled={botThinking}
              className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-all flex-shrink-0 disabled:opacity-40"
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
            disabled={botThinking}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || botThinking}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {botThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{botThinking ? 'Thinking...' : 'Ask'}</span>
          </button>
        </form>

      </div>

    </div>
  );
}
