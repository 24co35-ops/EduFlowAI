import React, { useState, useEffect, useCallback } from 'react';
import {
  Crosshair, AlertTriangle, Users, TrendingUp, TrendingDown,
  Zap, Target, RefreshCcw, CheckCircle2, Clock, ArrowRight,
  Sparkles, Send, XCircle, BookOpen, Award, Filter
} from 'lucide-react';
import { getActionCenterData, assignIntervention } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

// Severity badge colors
function severityStyle(level) {
  if (level === 'critical' || level === 'high') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  if (level === 'medium' || level === 'moderate') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
}

function InterventionCard({ item, onAssign, assigning }) {
  const conceptName = item.conceptId || item.concept || 'Unknown Concept';
  const masteryPct = item.aggregateMastery ?? item.mastery ?? 0;
  const studentCount = item.affectedStudents || item.studentCount || 0;
  const severity = item.severity || (masteryPct < 30 ? 'critical' : masteryPct < 50 ? 'high' : 'medium');
  const misconceptions = item.topMisconceptions || item.misconceptions || [];
  const trend = item.trend || 'stable';

  return (
    <div className="glass-card rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden">
      {/* Priority Banner */}
      <div className={`px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider border-b border-slate-800/60 ${
        severity === 'critical' || severity === 'high'
          ? 'bg-rose-500/5 text-rose-400'
          : severity === 'medium' || severity === 'moderate'
          ? 'bg-amber-500/5 text-amber-400'
          : 'bg-blue-500/5 text-blue-400'
      }`}>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          {severity.toUpperCase()} PRIORITY
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          {trend === 'declining' && <TrendingDown className="w-3 h-3 text-rose-400" />}
          {trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
          {trend !== 'declining' && trend !== 'improving' && <ArrowRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Concept Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">{conceptName}</h3>
            {item.topic && <p className="text-[11px] text-slate-500">{item.topic}</p>}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${severityStyle(severity)}`}>
            {Math.round(masteryPct)}% mastery
          </span>
        </div>

        {/* Mastery Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                masteryPct >= 80 ? 'bg-emerald-500' : masteryPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(masteryPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {studentCount} students affected
            </span>
            <span>Target: 80%</span>
          </div>
        </div>

        {/* Top Misconceptions */}
        {misconceptions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Top Misconceptions
            </p>
            {misconceptions.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="text-rose-400 font-bold text-[10px] mt-0.5">#{i + 1}</span>
                <p className="text-[11px] text-rose-300/80">
                  {typeof m === 'string' ? m : m.description || m.text}
                  {m.count && <span className="text-slate-500 ml-1">({m.count} students)</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onAssign(item)}
          disabled={assigning}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assigning ? (
            <>
              <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Assigning...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" /> 1-Click Remediation Assignment
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const DEMO_DIAGNOSTIC_CONCEPTS = [
  {
    conceptId: 'Recursion Trees & Master Theorem',
    topic: 'Algorithm Analysis & Divide-and-Conquer',
    aggregateMastery: 38,
    affectedStudents: 14,
    severity: 'critical',
    trend: 'declining',
    topMisconceptions: [
      'Confusing leaf cost n^(log_b a) with root split cost f(n)',
      'Applying Master Theorem Case 2 when subproblem sizes are non-uniform'
    ]
  },
  {
    conceptId: 'Asymptotic Bounds (Big-O vs Big-Omega)',
    topic: 'Discrete Mathematics & Complexity',
    aggregateMastery: 47,
    affectedStudents: 11,
    severity: 'high',
    trend: 'improving',
    topMisconceptions: [
      'Assuming Big-O implies tight bound rather than worst-case upper bound'
    ]
  },
  {
    conceptId: 'Dynamic Programming State Formulation',
    topic: 'Optimization Paradigms',
    aggregateMastery: 62,
    affectedStudents: 8,
    severity: 'medium',
    trend: 'stable',
    topMisconceptions: [
      'Failing to identify overlapping subproblem recurrence structure'
    ]
  }
];

export default function ActionCenterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getActionCenterData();
      setData(res?.data?.data || res?.data || {});
    } catch (err) {
      setError('Failed to load action center data.');
      console.error('[ActionCenter] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (item) => {
    const conceptId = item.conceptId || item.concept;
    setAssigning(conceptId);
    try {
      await assignIntervention({
        conceptId,
        type: 'remediation',
        assignToAll: true
      });
      setAssigned((prev) => [...prev, conceptId]);
    } catch (err) {
      console.error('[ActionCenter] Assignment error:', err);
    } finally {
      setAssigning(null);
    }
  };

  const weakConcepts = data?.weakConcepts || data?.interventions || [];

  const filteredConcepts = weakConcepts.filter((item) => {
    if (filterSeverity === 'all') return true;
    const mastery = item.aggregateMastery ?? item.mastery ?? 0;
    const sev = item.severity || (mastery < 30 ? 'critical' : mastery < 50 ? 'high' : 'medium');
    return sev === filterSeverity;
  });

  // Stats
  const totalStudents = data?.totalStudents || data?.classSize || 0;
  const criticalCount = weakConcepts.filter(i => {
    const m = i.aggregateMastery ?? i.mastery ?? 0;
    return m < 30;
  }).length;
  const activeInterventions = data?.activeInterventions || assigned.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crosshair className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Teacher Action Center</h1>
              <p className="text-xs text-slate-400">
                AI-identified learning gaps with 1-click intervention assignments
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Weak Concepts', value: weakConcepts.length, color: 'text-rose-400', icon: AlertTriangle },
          { label: 'Critical Gaps', value: criticalCount, color: 'text-orange-400', icon: Crosshair },
          { label: 'Active Interventions', value: activeInterventions, color: 'text-indigo-400', icon: Target },
          { label: 'Students Tracked', value: totalStudents, color: 'text-emerald-400', icon: Users }
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        {['all', 'critical', 'high', 'medium'].map((level) => (
          <button
            key={level}
            onClick={() => setFilterSeverity(level)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              filterSeverity === level
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analyzing learning gaps...</span>
          </div>
        </div>
      )}

      {/* Interventions Grid */}
      {!loading && filteredConcepts.length === 0 && (
        <div className="text-center py-12 px-6 rounded-2xl glass-card border border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">All Class Concepts On Track</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {filterSeverity !== 'all'
                ? 'No concepts match this specific severity filter.'
                : 'No critical learning gaps recorded yet. Load our curated diagnostic cohort to preview AI-driven remediation loops in action.'}
            </p>
          </div>
          {filterSeverity === 'all' && (
            <button
              onClick={() => setData({ weakConcepts: DEMO_DIAGNOSTIC_CONCEPTS, totalStudents: 32, activeInterventions: 3 })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Preview Live Intervention Cards</span>
            </button>
          )}
        </div>
      )}

      {!loading && filteredConcepts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredConcepts.map((item, i) => (
            <InterventionCard
              key={item.conceptId || i}
              item={item}
              onAssign={handleAssign}
              assigning={assigning === (item.conceptId || item.concept)}
            />
          ))}
        </div>
      )}

      {/* Assigned Interventions Log */}
      {assigned.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Interventions Assigned This Session ({assigned.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {assigned.map((id, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ✓ {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <AIEvidenceBadge
        provider="intervention-engine"
        model="Mastery Gap Analyzer"
        description="Learning gaps identified from quiz evidence graph with concept-level mastery aggregation"
      />
    </div>
  );
}
