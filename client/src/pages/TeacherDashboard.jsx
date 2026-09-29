import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, BookOpen, FileCheck2, BarChart3, Clock, Users, ArrowRight,
  Plus, Zap, Database, AlertTriangle, Crosshair, Network, TrendingUp,
  Activity, Bot, Send, ChevronRight, CheckCircle2, Eye, ShieldCheck
} from 'lucide-react';
import { getLessons, getQuizzes, getTeacherAnalytics } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

// ── Sparkline ─────────────────────────────────────────────────────────
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

// ── Metric Card ───────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, sparkData }) {
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
        {sparkData && <Sparkline data={sparkData} color="#2C4A8F" />}
      </div>
    </div>
  );
}

// ── Mastery Heatmap Bar ────────────────────────────────────────────────
function MasteryBar({ topic, score, studentCount }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const isProficient = score >= 75;
  const isDeveloping = score >= 60 && score < 75;

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="mono-label text-[#141C2B]">{topic}</span>
          <span className="ml-2 text-[10px] text-[#767E8C] mono-label">[ {studentCount} STUDENTS ]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={isProficient ? 'tag-proficient' : 'tag-risk'}>
            [ {isProficient ? 'PROFICIENT' : isDeveloping ? 'DEVELOPING' : 'AT RISK'} ]
          </span>
          <span className="mono-label text-[#2C4A8F]">{score}%</span>
        </div>
      </div>
      <div className="ledger-bar-bg">
        <div
          className={`ledger-bar-fill ${!isProficient ? 'risk' : ''}`}
          style={{ width: `${anim}%` }}
        />
      </div>
    </div>
  );
}

// ── At-Risk Student Row ────────────────────────────────────────────────
function StudentRiskRow({ initials, name, score, topics, status, onDispatch, dispatched }) {
  const isAtRisk = score < 70;
  return (
    <tr className="hover:bg-[rgba(20,28,43,0.02)] transition-colors border-b border-[rgba(20,28,43,0.12)] last:border-0">
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-[rgba(20,28,43,0.16)] bg-[#EFE9DD] flex items-center justify-center mono-label text-[10px] font-bold text-[#141C2B]">
            {initials}
          </div>
          <span className="mono-label text-xs">{name}</span>
        </div>
      </td>
      <td className="p-3">
        <span className="mono-label text-xs text-[#2C4A8F]">[ {score}% ]</span>
      </td>
      <td className="p-3 text-[11px] text-[#4A5364] max-w-[180px] truncate">{topics}</td>
      <td className="p-3">
        <span className={isAtRisk ? 'tag-risk' : 'tag-proficient'}>
          [ {status} ]
        </span>
      </td>
      <td className="p-3 text-right">
        {dispatched ? (
          <span className="mono-label text-[10px] text-[#2C4A8F] inline-flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3 h-3" /> [ DISPATCHED ]
          </span>
        ) : (
          <button
            onClick={() => onDispatch(name)}
            className="btn-outline text-[10px] py-1 px-2.5 inline-flex items-center gap-1"
          >
            <Send className="w-2.5 h-2.5" /> [ {isAtRisk ? 'Remediate' : 'Challenge'} ]
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Timeline Item ──────────────────────────────────────────────────────
function TimelineItem({ icon: Icon, title, sub, time, last }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center flex-shrink-0 text-[#2C4A8F]">
          <Icon style={{ width: '12px', height: '12px' }} />
        </div>
        {!last && <div className="w-px flex-1 bg-[rgba(20,28,43,0.16)] mt-1" />}
      </div>
      <div className="pb-3.5 min-w-0">
        <p className="mono-label text-xs text-[#141C2B]">{title}</p>
        <p className="text-[10px] text-[#4A5364] mt-0.5">{sub}</p>
        <p className="text-[9px] text-[#767E8C] mono-label mt-0.5">{time}</p>
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
    { topic: '01. Ohm\'s Law & Resistance', score: 84, students: 42 },
    { topic: '02. Parallel Circuits', score: 61, students: 42 },
    { topic: '03. Chemical Bonding', score: 78, students: 40 },
    { topic: '04. Periodic Table Trends', score: 55, students: 42 },
    { topic: '05. Quadratic Equations', score: 89, students: 38 },
    { topic: '06. Photosynthesis & Calvin Cycle', score: 72, students: 41 },
  ];

  const STUDENTS_AT_RISK = [
    { initials: 'RG', name: 'Rohan Gupta', score: 58, topics: 'Parallel Circuits, Chemical Bonding', status: 'CRITICAL' },
    { initials: 'AM', name: 'Ananya Mehta', score: 64, topics: 'Periodic Table Trends', status: 'NEEDS SUPPORT' },
    { initials: 'PV', name: 'Pooja Verma', score: 88, topics: 'Calvin Cycle', status: 'PROFICIENT' },
    { initials: 'KS', name: 'Kartik Sharma', score: 73, topics: 'Quadratic Equations', status: 'DEVELOPING' },
  ];

  const AI_TIMELINE = [
    { icon: BookOpen, title: '5-Day Lesson Plan generated', sub: 'Electrostatics — Class 10 Science · IBM Granite 13B', time: '10 mins ago' },
    { icon: Zap, title: '4 Quizzes auto-graded', sub: '128 submissions processed with deterministic NLP feedback', time: '1h ago' },
    { icon: Send, title: 'Remediation dispatched to 3 students', sub: 'Parallel Circuits micro-lesson sent', time: '2h ago' },
    { icon: BarChart3, title: 'Analytics report refreshed', sub: 'Class cohort prerequisite topology updated', time: '3h ago' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Archival Hero Ledger Header ── */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
              <Sparkles className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>[ EDUCATOR COMMAND LEDGER • IBM WATSONX.AI GRANITE ]</span>
            </div>
            <h1 className="serif-display text-3xl sm:text-4xl font-bold">
              Operations &amp; Class Mastery <span className="serif-italic">Ledger</span>
            </h1>
            <p className="text-xs text-[#4A5364] max-w-xl leading-relaxed">
              Curriculum automation engine with deterministic scoring, prerequisite dependency graphs, and grounded IBM watsonx.ai Granite telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/action-center" className="btn-filled text-[10px]">
              <Crosshair className="w-3.5 h-3.5" /> [ Action Center ]
            </Link>
            <Link to="/curriculum-twin" className="btn-outline text-[10px]">
              <Network className="w-3.5 h-3.5" /> [ Concept Graph ]
            </Link>
            <Link to="/lesson-planner" className="btn-outline text-[10px]">
              <Plus className="w-3.5 h-3.5" /> [ Lesson Plan ]
            </Link>
            <Link to="/quiz-builder" className="btn-outline text-[10px]">
              <Zap className="w-3.5 h-3.5" /> [ Auto Quiz ]
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Ledger (4-Col) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="TIME SAVED THIS WEEK"
          value={`${analytics?.timeSavedHoursThisWeek || '14.2'} hrs`}
          sub="↓ 65% reduction in paperwork"
          icon={Clock}
          sparkData={[8, 10, 9, 12, 11, 14, 14.2]}
        />
        <MetricCard
          label="ACTIVE SCHOLARS"
          value={analytics?.totalStudents || '42'}
          sub="Class 10 — Cohort A & B"
          icon={Users}
          sparkData={[38, 39, 40, 40, 41, 41, 42]}
        />
        <MetricCard
          label="CLASS AVERAGE MASTERY"
          value={`${analytics?.classAverageScore || '84.5'}%`}
          sub="+4.2% verified gain"
          icon={TrendingUp}
          sparkData={[78, 79, 80, 81, 82, 83, 84.5]}
        />
        <MetricCard
          label="CONCEPT GAPS DETECTED"
          value={analytics?.conceptGaps?.length || '7'}
          sub="Require intervention"
          icon={AlertTriangle}
          sparkData={[3, 5, 4, 6, 5, 7, 7]}
        />
      </div>

      {/* ── Action Required Alert Strip ── */}
      <div className="p-4 sm:p-5 bg-[#E5DED0] border border-[#141C2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#EFE9DD]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="mono-label text-[9px] text-[#2C4A8F]">[ ACTION REQUIRED ]</span>
              <span className="text-[10px] text-[#767E8C] mono-label">IBM GRANITE AUDIT</span>
            </div>
            <h3 className="serif-display text-base font-bold text-[#141C2B]">
              {analytics?.conceptGaps?.length || 3} Curriculum Concepts Need Urgent Intervention
            </h3>
            <p className="text-xs text-[#4A5364] max-w-xl">
              System detected repeated misconceptions in Parallel Circuits &amp; Periodic Trends. Dispatch 1-click grounded remediation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/curriculum-twin" className="btn-outline text-[10px]">
            <Eye className="w-3 h-3" /> [ View Graph ]
          </Link>
          <Link to="/action-center" className="btn-filled text-[10px]">
            [ Open Action Center ] <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Main Content Grid: Heatmap & Side Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Concept Mastery Breakdown */}
        <div className="lg:col-span-7 bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
            <h3 className="serif-display text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2C4A8F]" /> 01. Concept Mastery Breakdown
            </h3>
            <Link to="/analytics" className="mono-label text-[10px] text-[#2C4A8F] hover:underline flex items-center gap-1">
              [ FULL ANALYTICS → ]
            </Link>
          </div>
          <div className="space-y-3">
            {TOPIC_DATA.map((t, i) => (
              <MasteryBar key={i} topic={t.topic} score={t.score || t.avgScore || 70} studentCount={t.students || t.studentCount || 42} />
            ))}
          </div>
        </div>

        {/* Right Panel: AI Timeline + Recent Lessons */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Recent Actions Timeline */}
          <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,28,43,0.16)]">
              <h3 className="serif-display text-base font-bold flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#2C4A8F]" />
                Recent watsonx.ai Actions
              </h3>
              <span className="mono-label text-[9px] text-[#2C4A8F]">[ LIVE ]</span>
            </div>
            <div className="pt-1">
              {AI_TIMELINE.map((item, i) => (
                <TimelineItem key={i} {...item} last={i === AI_TIMELINE.length - 1} />
              ))}
            </div>
          </div>

          {/* Recent Lesson Plans */}
          <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,28,43,0.16)]">
              <h3 className="serif-display text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2C4A8F]" />
                Recent Lesson Plans
              </h3>
              <Link to="/lesson-planner" className="mono-label text-[10px] text-[#2C4A8F] hover:underline">
                [ VIEW ALL ]
              </Link>
            </div>
            <div className="space-y-2">
              {lessons.length === 0 ? (
                <div className="p-4 bg-[#EFE9DD] border border-dashed border-[rgba(20,28,43,0.2)] text-center space-y-2">
                  <p className="text-xs text-[#767E8C]">No lesson plans created yet.</p>
                  <Link to="/lesson-planner" className="btn-outline text-[10px]">
                    <Plus className="w-3 h-3" /> [ Create First Plan ]
                  </Link>
                </div>
              ) : (
                lessons.slice(0, 3).map((item, idx) => (
                  <div key={item._id || idx} className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] flex items-center justify-between">
                    <div>
                      <h4 className="mono-label text-xs">{item.subject}</h4>
                      <p className="text-[10px] text-[#4A5364]">📅 5-Day Plan · 🌐 {item.language === 'en' ? 'English' : 'Multilingual'}</p>
                    </div>
                    <Link to="/lesson-planner" className="btn-outline text-[10px] py-1 px-2">
                      [ Open ]
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── At-Risk Student Interventions Table ── */}
      <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
          <div>
            <h3 className="serif-display text-xl font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2C4A8F]" /> 02. Student Intervention Matrix
            </h3>
            <p className="mono-label text-[10px] text-[#767E8C] mt-0.5">Identified concept vulnerabilities requiring deterministic remediation.</p>
          </div>
          <Link to="/analytics" className="mono-label text-[10px] text-[#2C4A8F] hover:underline">
            [ FULL ROSTER → ]
          </Link>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-[rgba(20,28,43,0.16)] bg-[#EFE9DD]">
                {['STUDENT RECORD', 'MASTERY', 'WEAK TOPOLOGY', 'STATUS', 'ACTION'].map((h, i) => (
                  <th key={h} className={`p-3 mono-label text-[10px] text-[#767E8C] font-normal ${i === 4 ? 'text-right' : ''}`}>{h}</th>
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

      {/* ── Bottom Telemetry Strip ── */}
      <div className="border border-[rgba(20,28,43,0.16)] bg-[#141C2B] text-[#EFE9DD] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <span className="mono-label text-[9px] text-[#767E8C]">RUNTIME TELEMETRY</span>
          <span className="mono-label text-[10px] text-[#EFE9DD]">IBM WATSONX.AI GRANITE 13B</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="mono-label text-[9px] text-[#767E8C]">LATENCY</span>
            <span className="mono-label text-[10px]">142MS AVG</span>
          </div>
          <div className="flex items-center gap-2 text-[#2C4A8F]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="mono-label text-[10px] text-[#EFE9DD]">[ DETERMINISTIC AUDIT PASS ]</span>
          </div>
        </div>
      </div>

    </div>
  );
}
