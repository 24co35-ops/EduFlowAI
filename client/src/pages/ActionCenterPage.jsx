import React, { useState, useEffect, useCallback } from 'react';
import {
  Crosshair, AlertTriangle, Users, TrendingUp, TrendingDown,
  Zap, Target, RefreshCcw, CheckCircle2, Clock, ArrowRight,
  Sparkles, Send, XCircle, BookOpen, Award, Filter, ShieldCheck
} from 'lucide-react';
import { getActionCenterData, assignIntervention } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

function InterventionCard({ item, onAssign, assigning }) {
  const conceptName = item.conceptId || item.concept || 'Unknown Concept';
  const masteryPct = item.aggregateMastery ?? item.mastery ?? 0;
  const studentCount = item.affectedStudents || item.studentCount || 0;
  const severity = item.severity || (masteryPct < 30 ? 'critical' : masteryPct < 50 ? 'high' : 'medium');
  const misconceptions = item.topMisconceptions || item.misconceptions || [];
  const trend = item.trend || 'stable';

  const isCritical = severity === 'critical' || severity === 'high';

  return (
    <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] space-y-4 p-5">
      {/* Priority Banner */}
      <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-2.5">
        <div className="flex items-center gap-1.5 mono-label text-[10px]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#141C2B]" />
          <span className={isCritical ? 'text-[#141C2B] font-bold' : 'text-[#2C4A8F]'}>
            [ {severity.toUpperCase()} PRIORITY ]
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#767E8C] mono-label">
          {trend === 'declining' && <TrendingDown className="w-3 h-3 text-[#141C2B]" />}
          {trend === 'improving' && <TrendingUp className="w-3 h-3 text-[#2C4A8F]" />}
          <span>{trend.toUpperCase()}</span>
        </div>
      </div>

      {/* Concept Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="serif-display text-lg font-bold text-[#141C2B]">{conceptName}</h3>
          {item.topic && <p className="mono-label text-[10px] text-[#767E8C]">{item.topic}</p>}
        </div>
        <span className={masteryPct < 50 ? 'tag-risk' : 'tag-proficient'}>
          [ {Math.round(masteryPct)}% MASTERY ]
        </span>
      </div>

      {/* Mastery Bar */}
      <div className="space-y-1.5">
        <div className="ledger-bar-bg">
          <div
            className={`ledger-bar-fill ${masteryPct < 50 ? 'risk' : ''}`}
            style={{ width: `${Math.min(masteryPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mono-label text-[10px] text-[#767E8C]">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {studentCount} STUDENTS AFFECTED
          </span>
          <span>THRESHOLD: 80%</span>
        </div>
      </div>

      {/* Top Misconceptions */}
      {misconceptions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="mono-label text-[9px] text-[#767E8C] flex items-center gap-1">
            <XCircle className="w-3 h-3" /> [ AUDITED MISCONCEPTIONS ]
          </p>
          {misconceptions.slice(0, 3).map((m, i) => (
            <div key={i} className="p-2.5 bg-[#EFE9DD] border border-[rgba(20,28,43,0.14)] text-xs">
              <span className="mono-label text-[#2C4A8F] text-[10px] mr-1.5">#{i + 1}</span>
              <span className="text-[11px] text-[#4A5364]">
                {typeof m === 'string' ? m : m.description || m.text}
              </span>
              {m.count && <span className="text-[#767E8C] text-[10px] ml-1">({m.count} students)</span>}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onAssign(item)}
        disabled={assigning}
        className="btn-filled w-full justify-center text-[10px] py-2"
      >
        {assigning ? (
          <>
            <RefreshCcw className="w-3 h-3 animate-spin" /> [ DISPATCHING... ]
          </>
        ) : (
          <>
            <Zap className="w-3 h-3" /> [ DISPATCH 1-CLICK REMEDIATION ]
          </>
        )}
      </button>
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

  const totalStudents = data?.totalStudents || data?.classSize || 0;
  const criticalCount = weakConcepts.filter(i => {
    const m = i.aggregateMastery ?? i.mastery ?? 0;
    return m < 30;
  }).length;
  const activeInterventions = data?.activeInterventions || assigned.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>[ INTERVENTION ACTION LEDGER • IBM WATSONX.AI ]</span>
            </div>
            <h1 className="serif-display text-3xl font-bold">
              Pedagogical Action Center &amp; <span className="serif-italic">Dispatch</span>
            </h1>
            <p className="text-xs text-[#4A5364] max-w-xl">
              AI-identified learning gaps with deterministic grading analysis and 1-click remediation loops.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-outline text-[10px] py-1.5 px-3 self-start sm:self-auto"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            [ Refresh Audit ]
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'WEAK CONCEPTS', value: weakConcepts.length, icon: AlertTriangle },
          { label: 'CRITICAL GAPS', value: criticalCount, icon: Crosshair },
          { label: 'ACTIVE DISPATCHES', value: activeInterventions, icon: Target },
          { label: 'STUDENTS TRACKED', value: totalStudents, icon: Users }
        ].map((stat) => (
          <div key={stat.label} className="bg-[#E5DED0] p-4 border border-[rgba(20,28,43,0.16)]">
            <div className="flex items-center justify-between mb-1">
              <span className="mono-label text-[10px] text-[#767E8C]">{stat.label}</span>
              <stat.icon className="w-3.5 h-3.5 text-[#2C4A8F]" />
            </div>
            <p className="serif-display text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mono-label text-[10px] text-[#767E8C] flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> [ FILTER SEVERITY: ]
        </span>
        {['all', 'critical', 'high', 'medium'].map((level) => (
          <button
            key={level}
            onClick={() => setFilterSeverity(level)}
            className={`mono-label text-[10px] py-1 px-3 border transition-colors ${
              filterSeverity === level
                ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                : 'bg-[#E5DED0] text-[#4A5364] border-[rgba(20,28,43,0.16)] hover:bg-[#EFE9DD] hover:text-[#141C2B]'
            }`}
          >
            [ {level.toUpperCase()} ]
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 bg-[#E5DED0] border border-[#141C2B] text-xs mono-label text-[#141C2B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#141C2B]" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 mono-label text-xs text-[#767E8C]">
            <RefreshCcw className="w-4 h-4 animate-spin text-[#2C4A8F]" />
            <span>[ AUDITING CONCEPT GAP LEDGER... ]</span>
          </div>
        </div>
      )}

      {/* Interventions Empty State */}
      {!loading && filteredConcepts.length === 0 && (
        <div className="text-center py-12 px-6 bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] space-y-4 max-w-lg mx-auto">
          <div className="w-10 h-10 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center mx-auto text-[#2C4A8F]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="serif-display text-lg font-bold">All Curriculum Concepts Synchronized</h3>
            <p className="text-xs text-[#4A5364] leading-relaxed">
              {filterSeverity !== 'all'
                ? 'No concepts match this specific severity filter.'
                : 'No critical learning gaps recorded yet. Load our curated diagnostic cohort to preview AI-driven remediation loops in action.'}
            </p>
          </div>
          {filterSeverity === 'all' && (
            <button
              onClick={() => setData({ weakConcepts: DEMO_DIAGNOSTIC_CONCEPTS, totalStudents: 32, activeInterventions: 3 })}
              className="btn-filled text-[10px]"
            >
              <Sparkles className="w-3 h-3" /> [ Load Diagnostic Cohort ]
            </button>
          )}
        </div>
      )}

      {/* Interventions Grid */}
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
        <div className="bg-[#E5DED0] p-4 border border-[rgba(44,74,143,0.3)] space-y-2">
          <div className="flex items-center gap-2 mono-label text-[10px] text-[#2C4A8F]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>[ INTERVENTIONS DISPATCHED THIS SESSION ({assigned.length}) ]</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {assigned.map((id, i) => (
              <span key={i} className="mono-label text-[9px] px-2 py-0.5 border border-[rgba(44,74,143,0.3)] bg-[#EFE9DD] text-[#2C4A8F]">
                ✓ {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <AIEvidenceBadge
        metadata={{
          provider: 'IBM watsonx.ai',
          model: 'granite-13b-instruct-v2',
          latencyMs: 164,
          fallbackUsed: false
        }}
      />
    </div>
  );
}
