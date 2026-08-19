import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Flame, 
  MessageSquareCode, 
  Layers, 
  Zap, 
  LineChart, 
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getStudentProgress, getQuizzes } from '../services/api';

export default function StudentDashboard({ user }) {
  const [progress, setProgress] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, qRes] = await Promise.all([
          getStudentProgress(),
          getQuizzes()
        ]);
        setProgress(pRes.data.summary);
        setQuizzes(qRes.data.quizzes || []);
      } catch (err) {
        console.warn('Student Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Student Learning Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">
              Welcome back, <span className="gradient-text">{user?.name || 'Rohan'}</span> 🚀
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Ask doubts anytime to IBM BOB, generate instant flashcard decks from your textbook chapters, and take adaptive quizzes tailored to your weak topics.
            </p>
          </div>

          {/* Streak Widget */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl self-start md:self-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 animate-bounce text-amber-400" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-white font-outfit">{progress?.currentStreakDays || 5} Days</h4>
              <p className="text-[11px] text-amber-400 font-semibold">Active Learning Streak 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link
          to="/doubt-solver"
          className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 glass-card-hover space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">AI Doubt Solver (F4)</h3>
            <p className="text-xs text-slate-400 mt-1">Get step-by-step explanations in plain language within syllabus scope.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-400 pt-2">
            Ask Question <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          to="/flashcards"
          className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 glass-card-hover space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">Flashcards & Summary (F5)</h3>
            <p className="text-xs text-slate-400 mt-1">Paste any chapter text to get instant revision cards & summaries.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-400 pt-2">
            Generate Deck <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          to="/quizzes"
          className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 glass-card-hover space-y-3 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">Adaptive Quizzes (F6)</h3>
            <p className="text-xs text-slate-400 mt-1">Take assigned quizzes with instant AI auto-grading feedback.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 pt-2">
            Start Quiz <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

      </div>

      {/* Main Grid: Assigned Quizzes & Weak Topic Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Assigned Quizzes */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Assigned Quizzes
            </h3>
            <Link to="/quizzes" className="text-xs font-semibold text-emerald-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {quizzes.slice(0, 3).map((q, idx) => (
              <div key={q._id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{q.topic}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="capitalize text-emerald-400 font-semibold">{q.difficulty}</span>
                    <span>• {q.questions?.length || 4} Questions</span>
                  </div>
                </div>
                <Link
                  to={`/quizzes?id=${q._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Attempt Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Weak Topic Focus */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-400" /> Weak Area Focus
          </h3>
          <p className="text-xs text-slate-400">
            IBM BOB analyzed your previous quiz scores and identified key areas for revision:
          </p>

          <div className="space-y-2">
            {progress?.weakTopics?.map((topic, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span>🎯 {topic}</span>
                <Link to="/doubt-solver" className="text-[11px] underline text-indigo-400 hover:text-white">
                  Ask Doubt
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
