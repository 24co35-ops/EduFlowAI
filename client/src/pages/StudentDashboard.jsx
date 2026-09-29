import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Flame, MessageSquareCode, Layers, Zap, ArrowRight,
  CheckCircle2, Target, Brain, BookOpen, TrendingUp, Clock,
  Activity, Star, ChevronRight, Play, Bot, Lightbulb, Award
} from 'lucide-react';
import { getStudentProgress, getQuizzes } from '../services/api';
import RemediationModal from '../components/RemediationModal';

// ── Animated Donut Ring ─────────────────────────────────────────────────
function DonutRing({ pct, color, label, icon: Icon, delay = 0 }) {
  const [animated, setAnimated] = useState(0);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  const colorMap = {
    indigo: { stroke: '#6366f1', glow: 'rgba(99,102,241,0.5)', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    purple: { stroke: '#a855f7', glow: 'rgba(168,85,247,0.5)', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    emerald: { stroke: '#10b981', glow: 'rgba(16,185,129,0.5)', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amber: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.5)', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    cyan: { stroke: '#06b6d4', glow: 'rgba(6,182,212,0.5)', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={c.stroke} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)',
              filter: `drop-shadow(0 0 6px ${c.glow})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-extrabold ${c.text} font-outfit leading-none`}>{animated}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-6 h-6 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
        </div>
        <span className="text-xs font-semibold text-slate-300">{label}</span>
      </div>
    </div>
  );
}

// ── Inline Mini Sparkline ───────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, icon: Icon, color, sparkData }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', spark: '#6366f1', glow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', spark: '#10b981', glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', spark: '#f59e0b', glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', spark: '#a855f7', glow: 'hover:border-purple-500/40 hover:shadow-purple-500/10' },
  };
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className={`glass-card p-5 rounded-2xl border border-slate-800/80 ${c.glow} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.text}`} style={{ width: '18px', height: '18px' }} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-2xl font-extrabold text-white font-outfit leading-none">{value}</h3>
          <p className={`text-[11px] font-semibold mt-1 ${c.text}`}>{sub}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sparkData && <Sparkline data={sparkData} color={c.spark} />}
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Activity Feed Item ─────────────────────────────────────────────────
function FeedItem({ icon: Icon, color, title, sub, time }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-900/60 transition-all">
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[color]}`}>
        <Icon style={{ width: '13px', height: '13px' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white leading-tight">{title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{sub}</p>
      </div>
      <span className="text-[10px] text-slate-500 flex-shrink-0">{time}</span>
    </div>
  );
}

// ── Quiz Row ───────────────────────────────────────────────────────────
function QuizRow({ quiz, idx }) {
  const diff = quiz.difficulty || 'medium';
  const colors = { easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  const dc = colors[diff] || colors.medium;
  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-all flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 font-outfit">
          Q{idx + 1}
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">{quiz.topic}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize ${dc}`}>{diff}</span>
            <span className="text-[10px] text-slate-500">{quiz.questions?.length || 4} Qs</span>
          </div>
        </div>
      </div>
      <Link
        to={`/quizzes?id=${quiz._id}`}
        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 group-hover:shadow-emerald-500/30"
      >
        <Play style={{ width: '11px', height: '11px' }} /> Start
      </Link>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function StudentDashboard({ user }) {
  const displayName = user?.name || 'Student';
  const firstName = displayName.split(' ')[0];
  const [progress, setProgress] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicForRemediation, setSelectedTopicForRemediation] = useState(null);
  const [timeOfDay] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, qRes] = await Promise.all([getStudentProgress(), getQuizzes()]);
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

  const streak = progress?.currentStreakDays || 7;
  const weakTopics = progress?.weakTopics || ['Parallel Resistance', 'Chemical Bonding'];

  const ACTIVITY_FEED = [
    { icon: Bot, color: 'indigo', title: 'IBM BOB answered your question', sub: 'Ohm\'s Law — Step-by-step explanation generated', time: '5m ago' },
    { icon: CheckCircle2, color: 'emerald', title: 'Quiz submitted — 88%', sub: 'Electrostatics Basics · 8/10 correct', time: '1h ago' },
    { icon: Layers, color: 'purple', title: 'Flashcard deck generated', sub: 'Chapter 12: Periodic Table — 24 cards', time: '2h ago' },
    { icon: Award, color: 'amber', title: 'Mastery badge earned!', sub: 'Proficient in Chemical Reactions', time: '3h ago' },
    { icon: Target, color: 'indigo', title: 'Mastery check completed', sub: 'Parallel Resistance — Concept recovery confirmed', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Hero Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/30 p-8"
        style={{ boxShadow: '0 0 60px -20px rgba(99,102,241,0.3)' }}>
        {/* Ambient orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Powered by IBM watsonx.ai
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">
              {timeOfDay}, <span className="gradient-text">{firstName}</span> 🎓
            </h1>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Your personalized AI learning companion is ready. Ask IBM BOB any question, generate flashcards from chapters, and track your mastery in real-time.
            </p>
          </div>

          {/* Streak widget */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-3 bg-slate-900/80 border border-amber-500/25 px-5 py-4 rounded-2xl backdrop-blur-sm"
              style={{ boxShadow: '0 0 30px -10px rgba(245,158,11,0.3)' }}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center animate-bounce">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-white font-outfit">{streak} Days</h4>
                <p className="text-[11px] text-amber-400 font-bold">Active Streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="AI Sessions Today" value="8" sub="↑ +2 from yesterday" trend="+2" icon={Bot} color="indigo"
          sparkData={[3, 5, 4, 7, 6, 8, 8]} />
        <KPICard label="Mastery Score" value="88%" sub="↑ +5% this week" trend="+5%" icon={Brain} color="purple"
          sparkData={[72, 75, 78, 80, 83, 85, 88]} />
        <KPICard label="Concepts Mastered" value="42" sub="3 new this week" trend="+3" icon={CheckCircle2} color="emerald"
          sparkData={[30, 33, 35, 37, 38, 40, 42]} />
        <KPICard label="Learning Streak" value={`${streak}d`} sub="Keep it going!" trend="🔥" icon={Flame} color="amber"
          sparkData={[3, 4, 4, 5, 5, 6, 7]} />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Progress + Quizzes */}
        <div className="lg:col-span-8 space-y-6">

          {/* Subject Progress Rings */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Learning Progress
              </h3>
              <Link to="/analytics" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Full Report <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center justify-around py-2">
              <DonutRing pct={78} color="indigo" label="Physics" icon={Zap} delay={0} />
              <DonutRing pct={85} color="emerald" label="Chemistry" icon={Lightbulb} delay={200} />
              <DonutRing pct={62} color="amber" label="Mathematics" icon={BookOpen} delay={400} />
              <DonutRing pct={91} color="purple" label="Biology" icon={Activity} delay={600} />
              <DonutRing pct={74} color="cyan" label="English" icon={Star} delay={800} />
            </div>
          </div>

          {/* Next Best Action Banner */}
          <div className="p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ boxShadow: '0 0 40px -15px rgba(99,102,241,0.4)' }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 animate-subtle-glow">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 uppercase tracking-wider">
                    Next Best Action
                  </span>
                  <span className="text-[11px] text-slate-400">IBM BOB Recommendation</span>
                </div>
                <h3 className="text-sm font-bold text-white">Parallel Resistance — Closed-Loop Mastery Check</h3>
                <p className="text-xs text-slate-400">4 targeted questions to confirm conceptual recovery · Updates your Learning Graph instantly</p>
              </div>
            </div>
            <Link to="/mastery-check"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 flex-shrink-0 hover:shadow-indigo-500/40">
              Take Check <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/doubt-solver', icon: MessageSquareCode, color: 'indigo', label: 'AI Doubt Solver', sub: 'IBM BOB answers instantly', cta: 'Ask Question' },
              { to: '/flashcards', icon: Layers, color: 'purple', label: 'Smart Flashcards', sub: 'Paste chapter → instant deck', cta: 'Generate Deck' },
              { to: '/quizzes', icon: Zap, color: 'emerald', label: 'Adaptive Quizzes', sub: 'AI grading with remediation', cta: 'Start Quiz' },
            ].map(({ to, icon: Icon, color, label, sub, cta }) => {
              const cMap = {
                indigo: { bg: 'bg-indigo-500/8', border: 'border-indigo-500/20 hover:border-indigo-500/50', icon: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', cta: 'text-indigo-400', shadow: 'hover:shadow-indigo-500/10' },
                purple: { bg: 'bg-purple-500/8', border: 'border-purple-500/20 hover:border-purple-500/50', icon: 'bg-purple-500/10 border-purple-500/20 text-purple-400', cta: 'text-purple-400', shadow: 'hover:shadow-purple-500/10' },
                emerald: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20 hover:border-emerald-500/50', icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', cta: 'text-emerald-400', shadow: 'hover:shadow-emerald-500/10' },
              };
              const c = cMap[color];
              return (
                <Link key={to} to={to}
                  className={`glass-card p-5 rounded-2xl border ${c.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.shadow} space-y-3 block group`}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{label}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                  </div>
                  <div className={`flex items-center text-xs font-bold ${c.cta} group-hover:gap-2 transition-all`}>
                    {cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Assigned Quizzes */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" /> Assigned Quizzes
              </h3>
              <Link to="/quizzes" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {quizzes.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto">
                    <Zap className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">No quizzes assigned yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Your teacher will assign quizzes soon</p>
                  </div>
                  <Link to="/flashcards" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                    <Layers className="w-3.5 h-3.5" /> Practice with flashcards instead
                  </Link>
                </div>
              ) : (
                quizzes.slice(0, 3).map((q, idx) => <QuizRow key={q._id || idx} quiz={q} idx={idx} />)
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed + Weak Areas */}
        <div className="lg:col-span-4 space-y-6">

          {/* IBM BOB AI Activity Feed */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                <Bot className="w-4.5 h-4.5 text-indigo-400" style={{ width: '18px', height: '18px' }} />
                IBM BOB Activity
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1 pt-1">
              {ACTIVITY_FEED.map((item, i) => <FeedItem key={i} {...item} />)}
            </div>
          </div>

          {/* Weak Area Remediation */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-purple-400" style={{ width: '18px', height: '18px' }} />
              Weak Area Focus
            </h3>
            <p className="text-[11px] text-slate-400 -mt-2">IBM BOB detected gaps. Click Remediate to generate a targeted micro-module:</p>
            <div className="space-y-2.5">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                      <Target className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-purple-200 truncate max-w-[130px]">{topic}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTopicForRemediation(topic)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-md shadow-purple-600/20">
                    <Zap className="w-2.5 h-2.5" /> Fix It
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick XP Progress  */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-400" style={{ width: '18px', height: '18px' }} />
              Weekly XP
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Mon', xp: 80 }, { label: 'Tue', xp: 60 }, { label: 'Wed', xp: 95 },
                { label: 'Thu', xp: 40 }, { label: 'Fri', xp: 70 }, { label: 'Sat', xp: 85 }, { label: 'Sun', xp: 55 },
              ].map(({ label, xp }, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 w-7 text-right">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${xp}%`, transitionDelay: `${i * 60}ms`, filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' }} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300 w-8">{xp} XP</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <RemediationModal
        isOpen={Boolean(selectedTopicForRemediation)}
        onClose={() => setSelectedTopicForRemediation(null)}
        initialTopic={selectedTopicForRemediation || 'Ohm Law'}
      />
    </div>
  );
}
