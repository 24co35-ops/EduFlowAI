import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Flame, MessageSquareCode, Layers, Zap, ArrowRight,
  CheckCircle2, Target, Brain, BookOpen, TrendingUp, Clock,
  Activity, Star, ChevronRight, Play, Bot, Lightbulb, Award, ShieldCheck
} from 'lucide-react';
import { getStudentProgress, getQuizzes } from '../services/api';
import RemediationModal from '../components/RemediationModal';

// ── Animated Donut Ring ─────────────────────────────────────────────────
function DonutRing({ pct, label, icon: Icon, delay = 0 }) {
  const [animated, setAnimated] = useState(0);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(20,28,43,0.1)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#2C4A8F" strokeWidth="6"
            strokeLinecap="square"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono-label text-sm font-bold text-[#141C2B]">{animated}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F]">
          <Icon className="w-3 h-3" />
        </div>
        <span className="mono-label text-[10px] text-[#4A5364]">{label}</span>
      </div>
    </div>
  );
}

// ── Inline Mini Sparkline ───────────────────────────────────────────────
function Sparkline({ data, color = '#2C4A8F' }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" points={pts} />
    </svg>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, icon: Icon, sparkData }) {
  return (
    <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="mono-label text-[10px] text-[#767E8C]">{label}</span>
        <div className="w-8 h-8 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#141C2B]">
          <Icon style={{ width: '15px', height: '15px' }} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="serif-display text-2xl font-bold leading-none">{value}</h3>
          <p className="mono-label text-[10px] text-[#4A5364] mt-1.5">{sub}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sparkData && <Sparkline data={sparkData} color="#2C4A8F" />}
          {trend && (
            <span className="mono-label text-[9px] text-[#2C4A8F]">
              [ {trend} ]
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Activity Feed Item ─────────────────────────────────────────────────
function FeedItem({ icon: Icon, title, sub, time }) {
  return (
    <div className="flex items-start gap-3 p-2.5 border-b border-[rgba(20,28,43,0.1)] last:border-0">
      <div className="w-6 h-6 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#2C4A8F]">
        <Icon style={{ width: '12px', height: '12px' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="mono-label text-xs text-[#141C2B] leading-tight">{title}</p>
        <p className="text-[10px] text-[#4A5364] mt-0.5 leading-tight">{sub}</p>
      </div>
      <span className="mono-label text-[9px] text-[#767E8C] flex-shrink-0">{time}</span>
    </div>
  );
}

// ── Quiz Row ───────────────────────────────────────────────────────────
function QuizRow({ quiz, idx }) {
  const diff = quiz.difficulty || 'medium';
  return (
    <div className="p-3.5 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border border-[rgba(20,28,43,0.2)] bg-[#E5DED0] flex items-center justify-center mono-label text-xs font-bold text-[#141C2B]">
          Q{idx + 1}
        </div>
        <div>
          <h4 className="mono-label text-xs text-[#141C2B]">{quiz.topic}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="tag-proficient text-[9px]">[ {diff.toUpperCase()} ]</span>
            <span className="text-[10px] text-[#767E8C] mono-label">{quiz.questions?.length || 4} Qs</span>
          </div>
        </div>
      </div>
      <Link
        to={`/quizzes?id=${quiz._id}`}
        className="btn-outline text-[10px] py-1 px-3 inline-flex items-center gap-1.5"
      >
        <Play style={{ width: '10px', height: '10px' }} /> [ START ]
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
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
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
    { icon: Bot, title: 'IBM BOB answered your question', sub: 'Ohm\'s Law — Step-by-step explanation generated', time: '5m ago' },
    { icon: CheckCircle2, title: 'Quiz submitted — 88%', sub: 'Electrostatics Basics · 8/10 correct', time: '1h ago' },
    { icon: Layers, title: 'Flashcard deck generated', sub: 'Chapter 12: Periodic Table — 24 cards', time: '2h ago' },
    { icon: Award, title: 'Mastery badge earned', sub: 'Proficient in Chemical Reactions', time: '3h ago' },
    { icon: Target, title: 'Mastery check completed', sub: 'Parallel Resistance — Concept recovery confirmed', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Archival Welcome Ledger Header ── */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
              <Sparkles className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>[ SCHOLAR STUDY LEDGER • IBM WATSONX.AI GROUNDED ]</span>
            </div>
            <h1 className="serif-display text-3xl sm:text-4xl font-bold">
              Good {timeOfDay}, <span className="serif-italic">{firstName}</span>
            </h1>
            <p className="text-xs text-[#4A5364] max-w-lg leading-relaxed">
              Your personalized AI learning companion is active. Ask grounded questions, generate chapter flashcards, and verify mastery with deterministic proof.
            </p>
          </div>

          {/* Streak ledger */}
          <div className="flex items-center gap-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] px-4 py-3">
            <div className="w-10 h-10 border border-[rgba(20,28,43,0.2)] bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#EFE9DD]" />
            </div>
            <div>
              <h4 className="serif-display text-xl font-bold">{streak} Days</h4>
              <p className="mono-label text-[10px] text-[#2C4A8F]">[ ACTIVE STREAK ]</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="AI SESSIONS TODAY" value="8" sub="+2 from yesterday" trend="+2" icon={Bot}
          sparkData={[3, 5, 4, 7, 6, 8, 8]} />
        <KPICard label="MASTERY INDEX" value="88%" sub="+5% verified gain" trend="+5%" icon={Brain}
          sparkData={[72, 75, 78, 80, 83, 85, 88]} />
        <KPICard label="COMPETENCIES VERIFIED" value="42" sub="3 new this week" trend="+3" icon={CheckCircle2}
          sparkData={[30, 33, 35, 37, 38, 40, 42]} />
        <KPICard label="STUDY STREAK" value={`${streak}d`} sub="Continuous progress" trend="ACTIVE" icon={Flame}
          sparkData={[3, 4, 4, 5, 5, 6, 7]} />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Progress + Quizzes */}
        <div className="lg:col-span-8 space-y-6">

          {/* Subject Progress Rings */}
          <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
              <h3 className="serif-display text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2C4A8F]" /> 01. Subject Competency Ledger
              </h3>
              <Link to="/analytics" className="mono-label text-[10px] text-[#2C4A8F] hover:underline">
                [ FULL REPORT → ]
              </Link>
            </div>
            <div className="flex items-center justify-around py-3 flex-wrap gap-4">
              <DonutRing pct={78} label="Physics" icon={Zap} delay={0} />
              <DonutRing pct={85} label="Chemistry" icon={Lightbulb} delay={200} />
              <DonutRing pct={62} label="Mathematics" icon={BookOpen} delay={400} />
              <DonutRing pct={91} label="Biology" icon={Activity} delay={600} />
              <DonutRing pct={74} label="English" icon={Star} delay={800} />
            </div>
          </div>

          {/* Next Best Action Banner */}
          <div className="p-5 bg-[#E5DED0] border border-[#141C2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-[#EFE9DD]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="mono-label text-[9px] text-[#2C4A8F]">[ RECOMMENDED ACTION ]</span>
                  <span className="mono-label text-[10px] text-[#767E8C]">IBM BOB DIAGNOSTIC</span>
                </div>
                <h3 className="serif-display text-base font-bold text-[#141C2B]">
                  Parallel Resistance — Closed-Loop Mastery Check
                </h3>
                <p className="text-xs text-[#4A5364]">
                  4 targeted questions to confirm conceptual recovery · Updates your Prerequisite Graph.
                </p>
              </div>
            </div>
            <Link to="/mastery-check" className="btn-filled text-[10px] flex-shrink-0">
              [ Take Check ] <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Actions 3-Col */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/doubt-solver', icon: MessageSquareCode, label: 'AI Doubt Solver', sub: 'IBM BOB grounded live Q&A', cta: 'Ask Doubt' },
              { to: '/flashcards', icon: Layers, label: 'Smart Flashcards', sub: 'Curriculum text → study deck', cta: 'Open Deck' },
              { to: '/quizzes', icon: Zap, label: 'Adaptive Quizzes', sub: 'Deterministic scoring & AI loops', cta: 'Start Quiz' },
            ].map(({ to, icon: Icon, label, sub, cta }) => (
              <Link key={to} to={to} className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3 block hover:border-[#141C2B] transition-colors">
                <div className="w-8 h-8 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F]">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="mono-label text-xs text-[#141C2B]">{label}</h3>
                  <p className="text-[10px] text-[#4A5364] mt-1">{sub}</p>
                </div>
                <div className="mono-label text-[10px] text-[#2C4A8F] pt-1">
                  [ {cta} → ]
                </div>
              </Link>
            ))}
          </div>

          {/* Assigned Quizzes */}
          <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
              <h3 className="serif-display text-xl font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#2C4A8F]" /> 02. Assigned Assessment Tasks
              </h3>
              <Link to="/quizzes" className="mono-label text-[10px] text-[#2C4A8F] hover:underline">
                [ VIEW ALL → ]
              </Link>
            </div>
            <div className="space-y-2.5">
              {quizzes.length === 0 ? (
                <div className="p-5 bg-[#EFE9DD] border border-dashed border-[rgba(20,28,43,0.2)] text-center space-y-2">
                  <p className="text-xs text-[#767E8C]">No quizzes currently pending.</p>
                  <Link to="/flashcards" className="btn-outline text-[10px]">
                    <Layers className="w-3 h-3" /> [ Practice Flashcards ]
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
          <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,28,43,0.16)]">
              <h3 className="serif-display text-base font-bold flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#2C4A8F]" />
                Recent IBM BOB Activity
              </h3>
              <span className="mono-label text-[9px] text-[#2C4A8F]">[ LOGGED ]</span>
            </div>
            <div className="pt-1">
              {ACTIVITY_FEED.map((item, i) => <FeedItem key={i} {...item} />)}
            </div>
          </div>

          {/* Weak Area Remediation */}
          <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
            <h3 className="serif-display text-base font-bold flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#2C4A8F]" />
              Remediation Target Ledger
            </h3>
            <p className="text-[11px] text-[#4A5364]">Click below to generate a calibrated 3-minute explanation with practice questions:</p>
            <div className="space-y-2">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#2C4A8F]" />
                    <span className="mono-label text-[11px] text-[#141C2B] truncate max-w-[130px]">{topic}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTopicForRemediation(topic)}
                    className="btn-filled text-[9px] py-1 px-2"
                  >
                    [ Fix It ]
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly XP Progress */}
          <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
            <h3 className="serif-display text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2C4A8F]" />
              Weekly Effort Log
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Mon', xp: 80 }, { label: 'Tue', xp: 60 }, { label: 'Wed', xp: 95 },
                { label: 'Thu', xp: 40 }, { label: 'Fri', xp: 70 }, { label: 'Sat', xp: 85 }, { label: 'Sun', xp: 55 },
              ].map(({ label, xp }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="mono-label text-[10px] text-[#767E8C] w-7 text-right">{label}</span>
                  <div className="flex-1 ledger-bar-bg">
                    <div className="ledger-bar-fill" style={{ width: `${xp}%` }} />
                  </div>
                  <span className="mono-label text-[10px] text-[#141C2B] w-10 text-right">{xp} XP</span>
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
