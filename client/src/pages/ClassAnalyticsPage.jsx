import React, { useState, useEffect } from 'react';
import {
  BarChart3, AlertTriangle, Users, TrendingUp, Award, CheckCircle2, Sparkles,
  Zap, Send, UserCheck, Check, Activity, Bot, ChevronRight, ArrowUp, ArrowDown,
  Filter, Download, RefreshCw, Eye, BookOpen
} from 'lucide-react';
import { getTeacherAnalytics, getAttempts } from '../services/api';

// ── SVG Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data, colors }) {
  const max = Math.max(...data.map(d => d.value));
  const w = 340, h = 130, barW = 32, gap = (w - data.length * barW) / (data.length + 1);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 24}`} style={{ overflow: 'visible' }}>
      <defs>
        {data.map((_, i) => (
          <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity="0.3" />
          </linearGradient>
        ))}
      </defs>
      {data.map((d, i) => {
        const x = gap + i * (barW + gap);
        const bh = (d.value / max) * h;
        const y = h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="5"
              fill={`url(#bar-grad-${i})`}
              style={{ filter: `drop-shadow(0 0 6px ${colors[i % colors.length]}88)` }} />
            <text x={x + barW / 2} y={h + 16} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={colors[i % colors.length]} fontFamily="Inter, sans-serif">
              {d.value}%
            </text>
          </g>
        );
      })}
      {/* Grid lines */}
      {[25, 50, 75, 100].map(pct => {
        const y = h - (pct / max) * h;
        return (
          <line key={pct} x1={0} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
        );
      })}
    </svg>
  );
}

// ── Animated Donut ────────────────────────────────────────────────────
function DonutStat({ value, max = 100, label, color, size = 90 }) {
  const [anim, setAnim] = useState(0);
  const r = (size / 2) - 9;
  const circ = 2 * Math.PI * r;
  const dash = (anim / max) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnim(value), 400);
    return () => clearTimeout(t);
  }, [value]);

  const colorMap = {
    indigo: { stroke: '#6366f1', glow: 'rgba(99,102,241,0.5)', text: 'text-indigo-400' },
    emerald: { stroke: '#10b981', glow: 'rgba(16,185,129,0.5)', text: 'text-emerald-400' },
    amber: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.5)', text: 'text-amber-400' },
    rose: { stroke: '#f43f5e', glow: 'rgba(244,63,94,0.5)', text: 'text-rose-400' },
    purple: { stroke: '#a855f7', glow: 'rgba(168,85,247,0.5)', text: 'text-purple-400' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.stroke} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${c.glow})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-extrabold ${c.text} font-outfit leading-none`}>{value}</span>
          <span className="text-[10px] text-slate-500 mt-0.5">{max !== 100 ? `/${max}` : '%'}</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Heatmap Cell ──────────────────────────────────────────────────────
function HeatCell({ value }) {
  const bg = value >= 85 ? 'bg-emerald-500/60 border-emerald-500/40' :
    value >= 70 ? 'bg-teal-500/40 border-teal-500/30' :
    value >= 55 ? 'bg-amber-500/40 border-amber-500/30' :
    value >= 40 ? 'bg-orange-500/40 border-orange-500/30' :
    'bg-rose-500/50 border-rose-500/40';
  const textColor = value >= 70 ? 'text-white' : value >= 50 ? 'text-amber-100' : 'text-rose-100';
  return (
    <td className={`border ${bg} text-center py-2 px-1`}>
      <span className={`text-[10px] font-bold ${textColor}`}>{value}%</span>
    </td>
  );
}

// ── KPI Summary Card ──────────────────────────────────────────────────
function SummaryCard({ label, value, delta, icon: Icon, color, trend }) {
  const cMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20 hover:border-indigo-500/40', text: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20 hover:border-emerald-500/40', text: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20 hover:border-amber-500/40', text: 'text-amber-400' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20 hover:border-rose-500/40', text: 'text-rose-400' },
  };
  const c = cMap[color] || cMap.indigo;
  const isUp = trend === 'up';

  return (
    <div className={`glass-card p-5 rounded-2xl border ${c.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border.split(' ')[0]} flex items-center justify-center`}>
          <Icon className={c.text} style={{ width: '18px', height: '18px' }} />
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-white font-outfit leading-none">{value}</h3>
      {delta && (
        <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {delta}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function ClassAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchedStudents, setDispatchedStudents] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, attRes] = await Promise.all([getTeacherAnalytics(), getAttempts()]);
        setAnalytics(aRes.data.analytics);
        setAttempts(attRes.data.attempts || []);
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDispatch = (name) => {
    setDispatchedStudents(prev => new Set([...prev, name]));
  };

  // Demo topic perf data
  const TOPICS = analytics?.topicPerformance || [
    { topic: "Ohm's Law", score: 84, students: 42 },
    { topic: 'Parallel Circuits', score: 61, students: 42 },
    { topic: 'Chemical Bonding', score: 78, students: 40 },
    { topic: 'Periodic Table', score: 55, students: 42 },
    { topic: 'Quadratic Eqns', score: 89, students: 38 },
    { topic: 'Photosynthesis', score: 72, students: 41 },
    { topic: 'Newton\'s Laws', score: 91, students: 42 },
  ];

  const WEAK_ALERTS = analytics?.weakTopicAlerts || [
    {
      topic: 'Parallel Resistance Circuits',
      failureRate: '38%',
      recommendation: 'Students conflate parallel vs series resistance formulas. Recommend 15-min visual simulation activity + targeted 3-question diagnostic.'
    },
    {
      topic: 'Periodic Table Trends',
      failureRate: '44%',
      recommendation: 'Ionization energy misconceptions detected. Deploy interactive periodic table exploration with guided annotation worksheet.'
    },
  ];

  const HEATMAP_STUDENTS = ['Rohan G.', 'Ananya M.', 'Pooja V.', 'Kartik S.', 'Priya K.'];
  const HEATMAP_TOPICS = ['Circuits', 'Bonding', 'Periodic', 'Newton', 'Algebra'];
  const HEATMAP_DATA = [
    [58, 70, 45, 80, 66],
    [64, 55, 40, 72, 78],
    [88, 92, 85, 90, 81],
    [73, 68, 78, 60, 85],
    [79, 83, 71, 88, 92],
  ];

  const MONTHLY_SCORES = [
    { label: 'Jul', value: 76 }, { label: 'Aug', value: 79 },
    { label: 'Sep', value: 81 }, { label: 'Oct', value: 80 },
    { label: 'Nov', value: 84 }, { label: 'Dec', value: 84.5 },
  ];

  const STUDENTS_AT_RISK = [
    { initials: 'RG', name: 'Rohan Gupta', score: 58, topics: 'Parallel Circuits, Chemical Bonding', status: 'Critical', attempts: 3 },
    { initials: 'AM', name: 'Ananya Mehta', score: 64, topics: 'Periodic Table Trends', status: 'Needs Support', attempts: 2 },
    { initials: 'PK', name: 'Priya Kapoor', score: 69, topics: 'Newton\'s Laws', status: 'Developing', attempts: 1 },
    { initials: 'PV', name: 'Pooja Verma', score: 88, topics: 'Calvin Cycle', status: 'Proficient', attempts: 4 },
    { initials: 'KS', name: 'Kartik Sharma', score: 73, topics: 'Quadratic Equations', status: 'Developing', attempts: 2 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'heatmap', label: 'Mastery Heatmap' },
    { id: 'students', label: 'Student Table' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Feature F8 · Classroom Learning Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Analytics &amp; Insights</h1>
          <p className="text-xs text-slate-400">Answer "Who Needs Help?", track mastery heatmaps, and dispatch targeted IBM Granite interventions</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-2 rounded-xl glass-card border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5 hover:border-slate-600 transition-all">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="px-3 py-2 rounded-xl glass-card border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5 hover:border-slate-600 transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-xl glass-card border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5 hover:border-slate-600 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Enrolled Students" value={analytics?.totalStudents || 42} delta="+2 this semester" trend="up" icon={Users} color="indigo" />
        <SummaryCard label="Quizzes Completed" value={analytics?.quizzesCompleted || 128} delta="92% completion rate" trend="up" icon={CheckCircle2} color="emerald" />
        <SummaryCard label="Class Average" value={`${analytics?.classAverageScore || 84.5}%`} delta="+4.2% from last month" trend="up" icon={TrendingUp} color="amber" />
        <SummaryCard label="Time Saved Prep" value={`${analytics?.timeSavedHoursThisWeek || 14.2} hrs`} delta="IBM BOB auto-grading" trend="up" icon={Award} color="rose" />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800/80 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Donuts + Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Donut Summaries */}
            <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
              <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-indigo-400" style={{ width: '18px', height: '18px' }} />
                Class Health Overview
              </h3>
              <div className="grid grid-cols-2 gap-5 place-items-center py-2">
                <DonutStat value={analytics?.classAverageScore || 84.5} label="Class Avg Score" color="indigo" />
                <DonutStat value={92} label="Completion Rate" color="emerald" />
                <DonutStat value={analytics?.totalStudents || 42} max={50} label="Students Enrolled" color="amber" />
                <DonutStat value={analytics?.quizzesCompleted || 128} max={150} label="Quizzes Done" color="purple" />
              </div>
            </div>

            {/* Monthly Score Chart */}
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-400" style={{ width: '18px', height: '18px' }} />
                  Monthly Average Score Trend
                </h3>
                <span className="text-[10px] text-slate-500 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Class 10 · Science</span>
              </div>
              <BarChart
                data={MONTHLY_SCORES}
                colors={['#6366f1', '#818cf8', '#a5b4fc', '#6366f1', '#818cf8', '#6366f1']}
              />
            </div>
          </div>

          {/* Weak Area Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-950/5 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-outfit">Curriculum Weak Area Alerts</h3>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">{WEAK_ALERTS.length} Critical</span>
              </div>
              <div className="space-y-3">
                {WEAK_ALERTS.map((alert, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-300">{alert.topic}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                        Fail: {alert.failureRate}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> IBM Granite Recommendation:
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{alert.recommendation}</p>
                    </div>
                    <button className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all">
                      <Send className="w-3 h-3" /> Dispatch Remediation to Class
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions Stream */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                <Bot className="w-4.5 h-4.5 text-indigo-400" style={{ width: '18px', height: '18px' }} />
                Recent Student Submissions
              </h3>
              <div className="space-y-2.5">
                {attempts.length === 0 ? (
                  [...Array(4)].map((_, i) => {
                    const DEMO = [
                      { name: 'Rohan Gupta', topic: 'Electrostatics Basics', pct: 68, score: 7, max: 10 },
                      { name: 'Pooja Verma', topic: 'Chemical Bonding', pct: 90, score: 9, max: 10 },
                      { name: 'Ananya Mehta', topic: 'Periodic Table', pct: 60, score: 6, max: 10 },
                      { name: 'Kartik Sharma', topic: 'Newton\'s Laws', pct: 80, score: 8, max: 10 },
                    ];
                    const d = DEMO[i];
                    return (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">{d.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{d.topic}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-extrabold ${d.pct >= 80 ? 'text-emerald-400' : d.pct >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>{d.pct}%</span>
                          <p className="text-[10px] text-slate-500">{d.score}/{d.max} pts</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  attempts.slice(0, 4).map((att, idx) => (
                    <div key={att._id || idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{att.studentName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{att.topic}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${att.percentage >= 80 ? 'text-emerald-400' : att.percentage >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>{att.percentage}%</span>
                        <p className="text-[10px] text-slate-500">{att.totalScore}/{att.maxScore} pts</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Mastery Heatmap ── */}
      {activeTab === 'heatmap' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Student × Topic Mastery Grid
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/60 border border-rose-500/40 inline-block" /> At Risk (&lt;55%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/30 inline-block" /> Developing (55-70%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/60 border border-emerald-500/40 inline-block" /> Proficient (≥85%)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  {HEATMAP_TOPICS.map(t => (
                    <th key={t} className="py-2 px-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t}</th>
                  ))}
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg</th>
                </tr>
              </thead>
              <tbody>
                {HEATMAP_STUDENTS.map((student, si) => {
                  const row = HEATMAP_DATA[si];
                  const avg = Math.round(row.reduce((a, b) => a + b, 0) / row.length);
                  return (
                    <tr key={student} className="border-t border-slate-800/40">
                      <td className="py-2.5 px-3 text-xs font-bold text-white">{student}</td>
                      {row.map((val, ti) => <HeatCell key={ti} value={val} />)}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-xs font-extrabold ${avg >= 80 ? 'text-emerald-400' : avg >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>{avg}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 flex-wrap pt-2 border-t border-slate-800/60">
            {TOPICS.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className={`w-2 h-2 rounded-full ${t.score >= 80 ? 'bg-emerald-400' : t.score >= 65 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <span className="text-[11px] font-semibold text-slate-300">{t.topic}</span>
                <span className={`text-[11px] font-bold ${t.score >= 80 ? 'text-emerald-400' : t.score >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>{t.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Students At Risk Table ── */}
      {activeTab === 'students' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Student Interventions — "Who Needs Help?"
            </h3>
            <span className="text-xs text-slate-400">AI Remediation Dispatch</span>
          </div>

          {STUDENTS_AT_RISK.map((s) => (
            <div key={s.name} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                    s.score < 65 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    s.score < 80 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {s.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Weak: {s.topics}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-extrabold ${s.score < 65 ? 'text-rose-400' : s.score < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{s.score}% Avg</span>
                      <span className="text-[10px] text-slate-500">{s.attempts} attempts</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        s.status === 'Critical' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
                        s.status === 'Needs Support' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                        s.status === 'Proficient' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-300 border-blue-500/20'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Score bar */}
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${s.score >= 80 ? 'bg-emerald-500' : s.score >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${s.score}%` }} />
                  </div>
                  {dispatchedStudents.has(s.name) ? (
                    <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Dispatched
                    </span>
                  ) : (
                    <button onClick={() => handleDispatch(s.name)}
                      className={`px-3.5 py-1.5 rounded-xl text-white text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        s.score < 65 ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                      <Send className="w-2.5 h-2.5" /> {s.score < 65 ? 'Send Remediation' : s.score < 80 ? 'Send Support' : 'Send Challenge'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
