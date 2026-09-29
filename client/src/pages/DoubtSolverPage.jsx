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
  ListChecks,
  ShieldCheck
} from 'lucide-react';
import API from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

export default function DoubtSolverPage({ user }) {
  const displayName = user?.name || 'Student';

  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'bob',
      text: `Hello ${displayName}! 👋 I am your EduFlow AI Tutor powered by IBM BOB (watsonx.ai Granite Chat). \n\nAsk me any doubt from your syllabus, and I will construct a calibrated, step-by-step explanation grounded in course textbook chapters!`,
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
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
              <Bot className="w-3.5 h-3.5" /> [ GROUNDED DIALOGUE LEDGER • FEATURE F4 ]
            </div>
            <h1 className="serif-display text-3xl font-bold">
              AI Student Doubt <span className="serif-italic">Solver</span>
            </h1>
            <p className="text-xs text-[#4A5364]">
              Curriculum-aligned live doubt tutor powered by IBM watsonx.ai Granite 13B &amp; 20B with grounded citations.
            </p>
          </div>

          {/* Scope Tag */}
          <div className="flex items-center gap-2 bg-[#EFE9DD] px-3 py-2 border border-[rgba(20,28,43,0.2)] text-xs mono-label text-[#141C2B] self-start sm:self-auto">
            <BookOpen className="w-3.5 h-3.5 text-[#2C4A8F]" />
            <span>[ {syllabusScope} ]</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] flex flex-col h-[650px] text-[#141C2B]">
        
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
                  className={`w-8 h-8 border border-[rgba(20,28,43,0.2)] flex items-center justify-center text-xs mono-label font-bold flex-shrink-0 ${
                    isUser
                      ? 'bg-[#141C2B] text-[#EFE9DD]'
                      : 'bg-[#EFE9DD] text-[#2C4A8F]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 text-xs space-y-2 border max-w-[80%] ${
                    isUser
                      ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                      : 'bg-[#EFE9DD] text-[#141C2B] border-[rgba(20,28,43,0.16)]'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mono-label text-[10px] text-[#2C4A8F]">
                      <Sparkles className="w-3 h-3" /> [ IBM BOB GRANITE TUTOR ]
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
                  <div className={`mono-label text-[9px] mt-1 ${isUser ? 'text-[#767E8C]' : 'text-[#767E8C]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Thinking Indicator */}
          {botThinking && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-8 h-8 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] text-[#2C4A8F] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] text-xs mono-label text-[#2C4A8F] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>[ IBM BOB SYNTHESIZING GROUNDED CITATION... ]</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Action Chips (Simplify, Example, Quiz Me) */}
        <div className="px-6 py-2.5 bg-[#E5DED0] border-t border-[rgba(20,28,43,0.16)] flex items-center gap-2 overflow-x-auto">
          <span className="mono-label text-[10px] text-[#767E8C] flex-shrink-0">[ TUTOR ACTIONS: ]</span>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'simplify', lastUserMessage)}
            disabled={botThinking}
            className="btn-outline text-[10px] py-1 px-2.5 flex items-center gap-1 flex-shrink-0 disabled:opacity-40"
          >
            <Zap className="w-3 h-3 text-[#2C4A8F]" /> [ Simplify Concept ]
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'example', lastUserMessage)}
            disabled={botThinking}
            className="btn-outline text-[10px] py-1 px-2.5 flex items-center gap-1 flex-shrink-0 disabled:opacity-40"
          >
            <Lightbulb className="w-3 h-3 text-[#2C4A8F]" /> [ Real-World Analogy ]
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(null, 'quiz_me', lastUserMessage)}
            disabled={botThinking}
            className="btn-outline text-[10px] py-1 px-2.5 flex items-center gap-1 flex-shrink-0 disabled:opacity-40"
          >
            <ListChecks className="w-3 h-3 text-[#2C4A8F]" /> [ Quiz Me on This ]
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2 bg-[#EFE9DD] border-t border-[rgba(20,28,43,0.12)] flex items-center gap-2 overflow-x-auto">
          <span className="mono-label text-[10px] text-[#767E8C] flex-shrink-0">[ QUICK TOPICS: ]</span>
          {PRESET_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(null, 'standard', chip)}
              disabled={botThinking}
              className="mono-label text-[10px] px-2 py-0.5 border border-[rgba(20,28,43,0.16)] hover:bg-[#E5DED0] transition-colors flex-shrink-0 disabled:opacity-40 text-[#141C2B]"
            >
              [ {chip} ]
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#E5DED0] border-t border-[rgba(20,28,43,0.16)] flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={botThinking}
            placeholder="[ Type your syllabus question or concept doubt... ]"
            className="flex-1 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] px-4 py-2.5 text-xs mono-label text-[#141C2B] placeholder:text-[#767E8C] focus:outline-none focus:border-[#141C2B]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || botThinking}
            className="btn-filled text-[10px] px-4 py-2.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" /> [ ASK IBM BOB ]
          </button>
        </form>

      </div>

    </div>
  );
}
