import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, BookOpen, FileCheck2, BarChart3, Clock, Users, ArrowRight,
  Plus, Zap, Database, AlertTriangle, Crosshair, Network, TrendingUp,
  Activity, Bot, Send, ChevronRight, CheckCircle2, Eye, Flame
} from 'lucide-react';
import { getLessons, getQuizzes, getTeacherAnalytics } from '../services/api';

// ── Sparkline ─────────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────
function MetricCard({ label, value, sub, subColor, icon: Icon, iconColor, borderColor, bgColor, sparkData, sparkColor }) {
  return (
    <div className={`glass-card p-5 rounded-2xl border ${borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
          <Icon className={`${iconColor}`} style={{ width: '18px', height: '18px' }} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-2xl font-extrabold text-white font-outfit leading-none">{value}</h3>
          <p className={`text-[11px] font-semibold mt-1 ${subColor}`}>{sub}</p>
        </div>
        {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
      </div>
    </div>
  );
}

// ── Mastery Heatmap Bar ────────────────────────────────────────────────
function MasteryBar({ topic, score, studentCount }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 80 ? 'from-emerald-500 to-teal-400' : score >= 65 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-pink-400';
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400';
  const label = score >= 80 ? 'Proficient' : score >= 65 ? 'Developing' : 'At Risk';

  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-200">{topic}</span>
          <span className="ml-2 text-[10px] text-slate-500">{studentCount} students</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${textColor === 'text-emerald-400' ? 'bg-emerald-500/10' : textColor === 'text-amber-400' ? 'bg-amber-500/10' : 'bg-rose-500/10'} ${textColor}`}>
            {label}
          </span>
          <span className={`font-bold ${textColor}`}>{score}%</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${anim}%`, filter: 'drop-shadow(0 0 4px currentColor)' }} />
      </div>
    </div>
  );
}

// ── At-Risk Student Row ────────────────────────────────────────────────
function StudentRiskRow({ initials, name, score, topics, status, onDispatch, dispatched }) {
  const isAtRisk = score < 70;
  return (
    <tr className="hover:bg-slate-900/40 transition-colors border-b border-slate-800/50 last:border-0">
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${isAtRisk ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {initials}
          </div>
          <span className="text-xs font-bold text-white">{name}</span>
        </div>
      </td>
      <td className="p-3">
        <span className={`text-xs font-bold ${isAtRisk ? 'text-rose-400' : score < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{score}%</span>
      </td>
      <td className="p-3 text-[11px] text-slate-400 max-w-[140px] truncate">{topics}</td>
      <td className="p-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isAtRisk ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : score < 80 ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
          {status}
        </span>
      </td>
      <td className="p-3 text-right">
        {dispatched ? (
          <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1 justify-end border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Dispatched
          </span>
        ) : (
          <button onClick={() => onDispatch(name)}
            className={`px-3 py-1.5 rounded-xl text-white text-[10px] font-bold inline-flex items-center gap-1 transition-all shadow-sm ${isAtRisk ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
            <Send className="w-2.5 h-2.5" /> {isAtRisk ? 'Remediate' : 'Challenge'}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Timeline Item ──────────────────────────────────────────────────────
function TimelineItem({ icon: Icon, color, title, sub, time, last }) {
  const cMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  };
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${cMap[color]}`}>
          <Icon style={{ width: '13px', height: '13px' }} />
        </div>
        {!last && <div className="w-px flex-1 bg-slate-800/80 mt-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function TeacherDashboard({ user }) {
  const displayName = user?.name || 'Educator';
  const firstName = displayName.split(' ')[0];
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatchedStudents, setDispatchedStudents] = useState(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [lRes, qRes, aRes] = await Promise.all([getLessons(), getQuizzes(), getTeacherAnalytics()]);
        setLessons(lRes.data.lessons || []);
        setQuizzes(qRes.data.quizzes || []);
        setAnalytics(aRes.data.analytics || null);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDispatch = (name) => {
    setDispatchedStudents(prev => new Set([...prev, name]));
  };

  const TOPIC_DATA = analytics?.topicPerformance || [
    { topic: 'Ohm\'s Law & Resistance', score: 84, students: 42 },
    { topic: 'Parallel Circuits', score: 61, students: 42 },
    { topic: 'Chemical Bonding', score: 78, students: 40 },
    { topic: 'Periodic Table Trends', score: 55, students: 42 },
    { topic: 'Quadratic Equations', score: 89, students: 38 },
    { topic: 'Photosynthesis', score: 72, students: 41 },
  ];

  const STUDENTS_AT_RISK = [
    { initials: 'RG', name: 'Rohan Gupta', score: 58, topics: 'Parallel Circuits, Chemical Bonding', status: 'Critical' },
    { initials: 'AM', name: 'Ananya Mehta', score: 64, topics: 'Periodic Table Trends', status: 'Needs Support' },
    { initials: 'PV', name: 'Pooja Verma', score: 88, topics: 'Calvin Cycle', status: 'Proficient' },
    { initials: 'KS', name: 'Kartik Sharma', score: 73, topics: 'Quadratic Equations', status: 'Developing' },
  ];

  const AI_TIMELINE = [
    { icon: BookOpen, color: 'indigo', title: '5-Day Lesson Plan generated', sub: 'Electrostatics — Class 10 Science · IBM Granite 13B', time: '10 mins ago' },
    { icon: Zap, color: 'emerald', title: '4 Quizzes auto-graded', sub: '128 submissions processed with AI NLP feedback', time: '1h ago' },
    { icon: Send, color: 'rose', title: 'Remediation dispatched to 3 students', sub: 'Parallel Circuits micro-lesson sent', time: '2h ago' },
    { icon: BarChart3, color: 'purple', title: 'Analytics report refreshed', sub: 'Class cohort mastery map updated', time: '3h ago' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-8"
        style={{ boxShadow: '0 0 80px -30px rgba(99,102,241,0.35)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-56 h-56 bg-rose-600/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Educator Command Center · IBM watsonx.ai
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">
              Hello, <span className="gradient-text">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              IBM BOB (Granite 13B) is ready to transform your curriculum into structured lesson plans, adaptive quizzes, and multilingual materials in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/action-center"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all">
              <Crosshair className="w-4 h-4 text-rose-200" /> Action Center
            </Link>
            <Link to="/curriculum-twin"
              className="px-4 py-2.5 rounded-xl glass-card border border-slate-700 hover:border-indigo-500/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all">
              <Network className="w-4 h-4 text-indigo-400" /> Concept Map
            </Link>
            <Link to="/lesson-planner"
              className="px-4 py-2.5 rounded-xl glass-card border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4 text-emerald-400" /> Lesson Plan
            </Link>
            <Link to="/quiz-builder"
              className="px-4 py-2.5 rounded-xl glass-card border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all">
              <Zap className="w-4 h-4 text-amber-400" /> Auto Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Time Saved This Week" value={`${analytics?.timeSavedHoursThisWeek || '14.2'} hrs`}
          sub="↓ 65% reduction in paperwork" subColor="text-emerald-400"
          icon={Clock} iconColor="text-emerald-400" borderColor="border-emerald-500/20 hover:border-emerald-500/40"
          bgColor="bg-emerald-500/10" sparkData={[8, 10, 9, 12, 11, 14, 14.2]} sparkColor="#10b981" />
        <MetricCard label="Enrolled Students" value={analytics?.totalStudents || '42'}
          sub="Class 10 — Sec A &amp; B" subColor="text-indigo-400"
          icon={Users} iconColor="text-indigo-400" borderColor="border-indigo-500/20 hover:border-indigo-500/40"
          bgColor="bg-indigo-500/10" sparkData={[38, 39, 40, 40, 41, 41, 42]} sparkColor="#6366f1" />
        <MetricCard label="Class Average Score" value={`${analytics?.classAverageScore || '84.5'}%`}
          sub="+4.2% from last month" subColor="text-blue-400"
          icon={TrendingUp} iconColor="text-blue-400" borderColor="border-blue-500/20 hover:border-blue-500/40"
          bgColor="bg-blue-500/10" sparkData={[78, 79, 80, 81, 82, 83, 84.5]} sparkColor="#3b82f6" />
        <MetricCard label="Interventions Needed" value={analytics?.conceptGaps?.length || '7'}
          sub="Students at risk detected" subColor="text-rose-400"
          icon={AlertTriangle} iconColor="text-rose-400" borderColor="border-rose-500/20 hover:border-rose-500/40"
          bgColor="bg-rose-500/10" sparkData={[3, 5, 4, 6, 5, 7, 7]} sparkColor="#f43f5e" />
      </div>

      {/* ── Action Center Alert ── */}
      <div className="p-5 rounded-3xl border border-rose-500/25 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ boxShadow: '0 0 40px -15px rgba(244,63,94,0.3)' }}>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 uppercase tracking-wider animate-pulse">
                🔴 Action Required
              </span>
              <span className="text-[11px] text-slate-400">IBM BOB Detected Critical Gaps</span>
            </div>
            <h3 className="text-sm font-bold text-white">{analytics?.conceptGaps?.length || 3} Curriculum Concepts Need Urgent Intervention</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Repeated misconceptions in Parallel Resistance &amp; Periodic Table Trends. Review cohort breakdown and dispatch 1-click remediation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link to="/curriculum-twin"
            className="px-4 py-2.5 rounded-xl glass-card border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:border-indigo-500/40">
            <Eye className="w-3.5 h-3.5 text-indigo-400" /> View Graph
          </Link>
          <Link to="/action-center"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all">
            Open Action Center <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Mastery Heatmap */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Topic Mastery Heatmap
            </h3>
            <Link to="/analytics" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {TOPIC_DATA.map((t, i) => (
              <MasteryBar key={i} topic={t.topic} score={t.score || t.avgScore || 70} studentCount={t.students || t.studentCount || 42} />
            ))}
          </div>
        </div>

        {/* Right Panel: AI Timeline + Lessons */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Recent Actions Timeline */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                <Bot className="w-4.5 h-4.5 text-indigo-400" style={{ width: '18px', height: '18px' }} />
                Recent IBM BOB Actions
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="pt-1">
              {AI_TIMELINE.map((item, i) => (
                <TimelineItem key={i} {...item} last={i === AI_TIMELINE.length - 1} />
              ))}
            </div>
          </div>

          {/* Recent Lesson Plans */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-indigo-400" style={{ width: '18px', height: '18px' }} />
                Recent Lesson Plans
              </h3>
              <Link to="/lesson-planner" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {lessons.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">No lesson plans created yet.</p>
                  <Link to="/lesson-planner" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" /> Create your first plan
                  </Link>
                </div>
              ) : (
                lessons.slice(0, 3).map((item, idx) => (
                  <div key={item._id || idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{item.subject}</h4>
                      <p className="text-[10px] text-slate-400">📅 5-Day Plan · 🌐 {item.language === 'en' ? 'English' : 'Multilingual'}</p>
                    </div>
                    <Link to="/lesson-planner" className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-all">
                      Open
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── At-Risk Student Interventions Table ── */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Student Interventions — "Who Needs Help?"
          </h3>
          <Link to="/analytics" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
            Full Table <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Student', 'Avg Score', 'Weak Topics', 'Status', 'Action'].map((h, i) => (
                  <th key={h} className={`py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STUDENTS_AT_RISK.map((s) => (
                <StudentRiskRow key={s.name} {...s} onDispatch={handleDispatch} dispatched={dispatchedStudents.has(s.name)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
