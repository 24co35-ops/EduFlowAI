import React, { useState, useEffect } from 'react';
import {
  BarChart3, AlertTriangle, Users, TrendingUp, Award, CheckCircle2, Sparkles,
  Zap, Send, UserCheck, Check, Activity, Bot, ChevronRight, ArrowUp, ArrowDown,
  Filter, Download, RefreshCw, Eye, BookOpen
} from 'lucide-react';
import { getTeacherAnalytics, getAttempts } from '../services/api';

// ── SVG Bar Chart (Archival Ledger Style) ─────────────────────────────
function BarChart({ data, colors }) {
  const max = Math.max(...data.map(d => d.value));
  const w = 340, h = 130, barW = 32, gap = (w - data.length * barW) / (data.length + 1);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 24}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const x = gap + i * (barW + gap);
        const bh = (d.value / max) * h;
        const y = h - bh;
        const fillCol = colors[i % colors.length] || '#2C4A8F';
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh}
              fill={fillCol}
              stroke="#141C2B"
              strokeWidth="1"
            />
            <text x={x + barW / 2} y={h + 16} textAnchor="middle" fontSize="9" fill="#141C2B" fontFamily="Courier Prime, monospace" fontWeight="600">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#141C2B" fontFamily="Courier Prime, monospace">
              {d.value}%
            </text>
          </g>
        );
      })}
      {/* Grid lines */}
      {[25, 50, 75, 100].map(pct => {
        const y = h - (pct / max) * h;
        return (
          <line key={pct} x1={0} y1={y} x2={w} y2={y} stroke="rgba(20,28,43,0.12)" strokeWidth="1" strokeDasharray="3,3" />
        );
      })}
    </svg>
  );
}

// ── Donut Stat (Archival Ledger Ring) ─────────────────────────────────
function DonutStat({ value, max = 100, label, color = 'blue', size = 90 }) {
  const [anim, setAnim] = useState(0);
  const r = (size / 2) - 9;
  const circ = 2 * Math.PI * r;
  const dash = (anim / max) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnim(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  const colorMap = {
    blue: { stroke: '#2C4A8F', text: 'text-[#2C4A8F]' },
    emerald: { stroke: '#15803d', text: 'text-emerald-800' },
    amber: { stroke: '#b45309', text: 'text-amber-800' },
    rose: { stroke: '#be123c', text: 'text-rose-800' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(20,28,43,0.12)" strokeWidth="7" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.stroke} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-bold ${c.text} font-mono leading-none`}>{value}</span>
          <span className="text-[10px] font-mono text-[#141C2B]/60 mt-0.5">{max !== 100 ? `/${max}` : '%'}</span>
        </div>
      </div>
      <span className="text-[11px] font-mono font-medium text-[#141C2B]/80 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Heatmap Cell ──────────────────────────────────────────────────────
function HeatCell({ value }) {
  const bg = value >= 85 ? 'bg-emerald-600/20 text-emerald-900 border-emerald-700/30' :
    value >= 70 ? 'bg-[#2C4A8F]/15 text-[#2C4A8F] border-[#2C4A8F]/30' :
    value >= 55 ? 'bg-amber-500/20 text-amber-900 border-amber-600/30' :
    'bg-rose-500/20 text-rose-900 border-rose-600/30';
  
  return (
    <td className={`border border-[#141C2B]/15 ${bg} text-center py-2 px-1 font-mono`}>
      <span className="text-[10px] font-bold">{value}%</span>
    </td>
  );
}

// ── KPI Summary Card ──────────────────────────────────────────────────
function SummaryCard({ label, value, delta, icon: Icon, color, trend }) {
  const isUp = trend === 'up';

  return (
    <div className="stationery-card p-5 border border-[#141C2B]/15 bg-[#E5DED0]">
      <div className="flex items-center justify-between mb-3">
        <span className="mono-label text-[11px]">{label}</span>
        <div className="w-8 h-8 border border-[#141C2B]/15 bg-[#EFE9DD] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#2C4A8F]" />
        </div>
      </div>
      <h3 className="text-2xl font-serif font-bold text-[#141C2B] leading-none">{value}</h3>
      {delta && (
        <div className={`flex items-center gap-1 mt-2 text-[10px] font-mono ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
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
    { label: 'Nov', value: 84 }, { label: 'Dec', value: 85 },
  ];

  const STUDENTS_AT_RISK = [
    { initials: 'RG', name: 'Rohan Gupta', score: 58, topics: 'Parallel Circuits, Chemical Bonding', status: 'Critical', attempts: 3 },
    { initials: 'AM', name: 'Ananya Mehta', score: 64, topics: 'Periodic Table Trends', status: 'Needs Support', attempts: 2 },
    { initials: 'PK', name: 'Priya Kapoor', score: 69, topics: 'Newton\'s Laws', status: 'Developing', attempts: 1 },
    { initials: 'PV', name: 'Pooja Verma', score: 88, topics: 'Calvin Cycle', status: 'Proficient', attempts: 4 },
    { initials: 'KS', name: 'Kartik Sharma', score: 73, topics: 'Quadratic Equations', status: 'Developing', attempts: 2 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview Ledger' },
    { id: 'heatmap', label: 'Mastery Matrix' },
    { id: 'students', label: 'Cohort Interventions' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#141C2B]/15 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] text-[10px] font-mono uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-[#2C4A8F]" /> Feature F8 · Learning Intelligence
          </div>
          <h1 className="text-3xl font-serif text-[#141C2B] tracking-tight">Analytics &amp; <span className="italic text-[#2C4A8F]">Mastery Ledger</span></h1>
          <p className="text-xs text-[#141C2B]/70 font-mono">Answers "Who Needs Help?", tracks curriculum heatmaps, and coordinates IBM Granite remediation.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> [ Filter ]
          </button>
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> [ Export ]
          </button>
          <button onClick={() => window.location.reload()} className="btn-outline text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> [ Refresh ]
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Enrolled Scholars" value={analytics?.totalStudents || 42} delta="+2 this term" trend="up" icon={Users} color="blue" />
        <SummaryCard label="Assessments Logged" value={analytics?.quizzesCompleted || 128} delta="92% completion rate" trend="up" icon={CheckCircle2} color="emerald" />
        <SummaryCard label="Class Cohort Avg" value={`${analytics?.classAverageScore || 84.5}%`} delta="+4.2% trajectory" trend="up" icon={TrendingUp} color="amber" />
        <SummaryCard label="Prep Time Conserved" value={`${analytics?.timeSavedHoursThisWeek || 14.2}h`} delta="IBM BOB automation" trend="up" icon={Award} color="rose" />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 border border-[#141C2B]/15 bg-[#E5DED0] p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 text-xs font-mono font-bold transition-all ${activeTab === t.id ? 'bg-[#141C2B] text-[#EFE9DD]' : 'text-[#141C2B]/70 hover:text-[#141C2B] hover:bg-[#EFE9DD]'}`}>
            [ {t.label} ]
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Donuts + Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Donut Summaries */}
            <div className="lg:col-span-4 stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
              <div className="border-b border-[#141C2B]/10 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2C4A8F]" /> Class Health Matrix
                </h3>
                <span className="mono-label text-[10px]">LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-5 place-items-center py-2">
                <DonutStat value={analytics?.classAverageScore || 84.5} label="Cohort Average" color="blue" />
                <DonutStat value={92} label="Completion Rate" color="emerald" />
                <DonutStat value={analytics?.totalStudents || 42} max={50} label="Active Cohort" color="amber" />
                <DonutStat value={analytics?.quizzesCompleted || 128} max={150} label="Evaluations Done" color="blue" />
              </div>
            </div>

            {/* Monthly Score Chart */}
            <div className="lg:col-span-8 stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
              <div className="flex items-center justify-between border-b border-[#141C2B]/10 pb-3">
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2C4A8F]" /> Monthly Score Progression
                </h3>
                <span className="text-[10px] font-mono text-[#141C2B]/60 border border-[#141C2B]/15 px-2 py-0.5 bg-[#EFE9DD]">Class 10 · Physical Science</span>
              </div>
              <BarChart
                data={MONTHLY_SCORES}
                colors={['#2C4A8F', '#3b5da3', '#4a6eb8', '#2C4A8F', '#3b5da3', '#2C4A8F']}
              />
            </div>
          </div>

          {/* Weak Area Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stationery-card p-6 border border-rose-600/30 bg-[#E5DED0] space-y-4">
              <div className="flex items-center justify-between border-b border-rose-600/20 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#141C2B]">Curriculum Weak Area Alerts</h3>
                </div>
                <span className="px-2 py-0.5 border border-rose-600/30 text-rose-800 text-[10px] font-mono font-bold bg-rose-500/10">
                  {WEAK_ALERTS.length} CRITICAL
                </span>
              </div>
              <div className="space-y-3">
                {WEAK_ALERTS.map((alert, idx) => (
                  <div key={idx} className="p-4 bg-[#EFE9DD] border border-[#141C2B]/15 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-serif font-bold text-[#141C2B]">{alert.topic}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-600/30 text-rose-800">
                        Fail: {alert.failureRate}
                      </span>
                    </div>
                    <div className="p-3 bg-[#E5DED0] border border-[#141C2B]/15 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#2C4A8F] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#2C4A8F]" /> IBM Granite Assessment:
                      </div>
                      <p className="text-xs font-mono text-[#141C2B]/80 leading-relaxed">{alert.recommendation}</p>
                    </div>
                    <button className="w-full btn-outline text-[11px] flex items-center justify-center gap-1.5 py-1.5">
                      <Send className="w-3 h-3 text-[#2C4A8F]" /> [ Dispatch Targeted Remediation ]
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions Stream */}
            <div className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-4">
              <div className="border-b border-[#141C2B]/10 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#2C4A8F]" /> Recent Student Submissions
                </h3>
                <span className="mono-label text-[10px]">RECORD-AUDIT</span>
              </div>
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
                      <div key={i} className="p-3 bg-[#EFE9DD] border border-[#141C2B]/15 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-serif font-bold text-[#141C2B]">{d.name}</h4>
                          <p className="text-[10px] font-mono text-[#141C2B]/60 mt-0.5">{d.topic}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-mono font-bold ${d.pct >= 80 ? 'text-emerald-800' : d.pct >= 65 ? 'text-amber-800' : 'text-rose-800'}`}>{d.pct}%</span>
                          <p className="text-[10px] font-mono text-[#141C2B]/60">{d.score}/{d.max} pts</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  attempts.slice(0, 4).map((att, idx) => (
                    <div key={att._id || idx} className="p-3 bg-[#EFE9DD] border border-[#141C2B]/15 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-serif font-bold text-[#141C2B]">{att.studentName}</h4>
                        <p className="text-[10px] font-mono text-[#141C2B]/60 mt-0.5">{att.topic}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-mono font-bold ${att.percentage >= 80 ? 'text-emerald-800' : att.percentage >= 65 ? 'text-amber-800' : 'text-rose-800'}`}>{att.percentage}%</span>
                        <p className="text-[10px] font-mono text-[#141C2B]/60">{att.totalScore}/{att.maxScore} pts</p>
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
        <div className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141C2B]/10 pb-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2C4A8F]" /> Student × Topic Mastery Matrix
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500/20 border border-rose-600/30 inline-block" /> Critical (&lt;55%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500/20 border border-amber-600/30 inline-block" /> Developing (55-70%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-600/20 border border-emerald-700/30 inline-block" /> Proficient (≥85%)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#EFE9DD] border border-[#141C2B]/15">
                  <th className="py-2.5 px-3 text-left mono-label text-[10px]">Scholar Name</th>
                  {HEATMAP_TOPICS.map(t => (
                    <th key={t} className="py-2.5 px-1 text-center mono-label text-[10px]">{t}</th>
                  ))}
                  <th className="py-2.5 px-3 text-center mono-label text-[10px]">Avg</th>
                </tr>
              </thead>
              <tbody>
                {HEATMAP_STUDENTS.map((student, si) => {
                  const row = HEATMAP_DATA[si];
                  const avg = Math.round(row.reduce((a, b) => a + b, 0) / row.length);
                  return (
                    <tr key={student} className="border-t border-[#141C2B]/15 bg-[#EFE9DD]/50 hover:bg-[#EFE9DD]">
                      <td className="py-2.5 px-3 text-xs font-serif font-bold text-[#141C2B] border border-[#141C2B]/15">{student}</td>
                      {row.map((val, ti) => <HeatCell key={ti} value={val} />)}
                      <td className="py-2.5 px-3 text-center border border-[#141C2B]/15 font-mono">
                        <span className={`text-xs font-bold ${avg >= 80 ? 'text-emerald-800' : avg >= 65 ? 'text-amber-800' : 'text-rose-800'}`}>{avg}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 flex-wrap pt-3 border-t border-[#141C2B]/10">
            {TOPICS.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-[#EFE9DD] border border-[#141C2B]/15 font-mono">
                <div className={`w-2 h-2 ${t.score >= 80 ? 'bg-emerald-600' : t.score >= 65 ? 'bg-amber-600' : 'bg-rose-600'}`} />
                <span className="text-[11px] text-[#141C2B]">{t.topic}</span>
                <span className={`text-[11px] font-bold ${t.score >= 80 ? 'text-emerald-800' : t.score >= 65 ? 'text-amber-800' : 'text-rose-800'}`}>{t.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Students At Risk Table ── */}
      {activeTab === 'students' && (
        <div className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
          <div className="flex items-center justify-between border-b border-[#141C2B]/10 pb-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2C4A8F]" /> Student Interventions — "Who Needs Help?"
            </h3>
            <span className="mono-label text-[10px]">AI INTERVENTION DISPATCH</span>
          </div>

          <div className="space-y-3">
            {STUDENTS_AT_RISK.map((s) => (
              <div key={s.name} className="p-4 bg-[#EFE9DD] border border-[#141C2B]/15">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#141C2B]/20 bg-[#E5DED0] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 text-[#141C2B]">
                      {s.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#141C2B]">{s.name}</h4>
                      <p className="text-[11px] font-mono text-[#141C2B]/70 mt-0.5">Deficit: {s.topics}</p>
                      <div className="flex items-center gap-3 mt-1.5 font-mono">
                        <span className={`text-xs font-bold ${s.score < 65 ? 'text-rose-800' : s.score < 80 ? 'text-amber-800' : 'text-emerald-800'}`}>{s.score}% Avg</span>
                        <span className="text-[10px] text-[#141C2B]/60">[{s.attempts} attempts]</span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                          s.status === 'Critical' ? 'bg-rose-500/10 text-rose-800 border-rose-600/30' :
                          s.status === 'Needs Support' ? 'bg-amber-500/10 text-amber-800 border-amber-600/30' :
                          'bg-emerald-500/10 text-emerald-800 border-emerald-600/30'}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 self-end sm:self-center">
                    <div className="w-28 h-2 bg-[#141C2B]/10 overflow-hidden border border-[#141C2B]/15">
                      <div className={`h-full ${s.score >= 80 ? 'bg-emerald-600' : s.score >= 65 ? 'bg-amber-600' : 'bg-rose-600'}`}
                        style={{ width: `${s.score}%` }} />
                    </div>
                    {dispatchedStudents.has(s.name) ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-600/30">
                        <Check className="w-3 h-3 text-emerald-700" /> [ DISPATCHED ]
                      </span>
                    ) : (
                      <button onClick={() => handleDispatch(s.name)}
                        className="btn-filled text-[10px] py-1 px-3 flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-[#EFE9DD]" /> [ {s.score < 65 ? 'Dispatch Remediation' : 'Send Support'} ]
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
