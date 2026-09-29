import React, { useState, useEffect, useCallback } from 'react';
import {
  Network, BookOpen, AlertTriangle, ChevronDown, ChevronRight,
  Layers, Target, Zap, RefreshCcw, Search, Filter, ArrowRight,
  CheckCircle2, XCircle, Info, Sparkles, GitBranch
} from 'lucide-react';
import { getConcepts, getCurriculum } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

// Mastery color coding
function masteryColor(pct) {
  if (pct >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (pct >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}

function masteryLabel(pct) {
  if (pct >= 80) return 'Mastered';
  if (pct >= 50) return 'Developing';
  return 'At Risk';
}

// Single concept node card
function ConceptNode({ concept, isExpanded, onToggle, onSelect }) {
  const mastery = concept.aggregateMastery ?? concept.mastery ?? null;
  const prereqs = concept.prerequisites || [];
  const misconceptions = concept.commonMisconceptions || concept.misconceptions || [];

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 ${
        isExpanded
          ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isExpanded
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
          }`}>
            <Network className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">
              {concept.name || concept.conceptId}
            </h3>
            {concept.topic && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {concept.topic}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {mastery !== null && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${masteryColor(mastery)}`}>
              {Math.round(mastery)}% — {masteryLabel(mastery)}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/60 pt-4">
          {/* Definition */}
          {concept.definition && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Definition
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{concept.definition}</p>
            </div>
          )}

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" /> Prerequisites ({prereqs.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prereqs.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  >
                    {typeof p === 'string' ? p : p.name || p.conceptId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Misconceptions */}
          {misconceptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Common Misconceptions ({misconceptions.length})
              </p>
              <div className="space-y-1.5">
                {misconceptions.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-rose-300/90">{typeof m === 'string' ? m : m.description || m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mastery Bar */}
          {mastery !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Class Mastery
                </p>
                <span className="text-[11px] font-bold text-slate-300">{Math.round(mastery)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    mastery >= 80 ? 'bg-emerald-500' : mastery >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(mastery, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onSelect && onSelect(concept)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/30 transition-colors"
            >
              <Zap className="w-3 h-3" /> Assign Intervention
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CurriculumTwinPage() {
  const [concepts, setConcepts] = useState([]);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [conceptsRes, curriculumRes] = await Promise.allSettled([
        getConcepts(),
        getCurriculum()
      ]);

      if (conceptsRes.status === 'fulfilled') {
        setConcepts(conceptsRes.value?.data?.data || conceptsRes.value?.data?.concepts || []);
      }
      if (curriculumRes.status === 'fulfilled') {
        setCurriculum(curriculumRes.value?.data?.data || curriculumRes.value?.data || null);
      }
    } catch (err) {
      setError('Failed to load curriculum data.');
      console.error('[CurriculumTwin] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter & search
  const filteredConcepts = concepts.filter((c) => {
    const matchesSearch = !searchQuery ||
      (c.name || c.conceptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.topic || '').toLowerCase().includes(searchQuery.toLowerCase());

    const mastery = c.aggregateMastery ?? c.mastery ?? null;
    const matchesFilter =
      filterLevel === 'all' ||
      (filterLevel === 'at-risk' && mastery !== null && mastery < 50) ||
      (filterLevel === 'developing' && mastery !== null && mastery >= 50 && mastery < 80) ||
      (filterLevel === 'mastered' && mastery !== null && mastery >= 80);

    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalConcepts = concepts.length;
  const atRisk = concepts.filter(c => (c.aggregateMastery ?? c.mastery ?? 100) < 50).length;
  const developing = concepts.filter(c => {
    const m = c.aggregateMastery ?? c.mastery ?? 100;
    return m >= 50 && m < 80;
  }).length;
  const mastered = concepts.filter(c => (c.aggregateMastery ?? c.mastery ?? 0) >= 80).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Network className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Curriculum Twin</h1>
              <p className="text-xs text-slate-400">
                Digital twin of your curriculum — concepts, prerequisites & misconception mapping
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
          { label: 'Total Concepts', value: totalConcepts, color: 'text-indigo-400', icon: Layers },
          { label: 'At Risk', value: atRisk, color: 'text-rose-400', icon: AlertTriangle },
          { label: 'Developing', value: developing, color: 'text-amber-400', icon: ArrowRight },
          { label: 'Mastered', value: mastered, color: 'text-emerald-400', icon: CheckCircle2 }
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

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search concepts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {['all', 'at-risk', 'developing', 'mastered'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                filterLevel === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              {level === 'all' ? 'All' : level === 'at-risk' ? 'At Risk' : level === 'developing' ? 'Developing' : 'Mastered'}
            </button>
          ))}
        </div>
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
            <span className="text-sm">Loading curriculum twin...</span>
          </div>
        </div>
      )}

      {/* Concept Graph / List */}
      {!loading && filteredConcepts.length === 0 && (
        <div className="text-center py-16">
          <Network className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {searchQuery || filterLevel !== 'all'
              ? 'No concepts match your filters.'
              : 'No curriculum concepts found. Generate a lesson plan to build the curriculum twin.'}
          </p>
        </div>
      )}

      {!loading && filteredConcepts.length > 0 && (
        <div className="space-y-3">
          {filteredConcepts.map((concept, i) => (
            <ConceptNode
              key={concept.conceptId || concept.id || i}
              concept={concept}
              isExpanded={expandedId === (concept.conceptId || concept.id || i)}
              onToggle={() =>
                setExpandedId(
                  expandedId === (concept.conceptId || concept.id || i) ? null : (concept.conceptId || concept.id || i)
                )
              }
            />
          ))}
        </div>
      )}

      {/* Curriculum Metadata */}
      {curriculum && (
        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Curriculum Metadata</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {curriculum.subject && (
              <div>
                <span className="text-slate-500">Subject:</span>
                <span className="ml-1.5 text-slate-200 font-semibold">{curriculum.subject}</span>
              </div>
            )}
            {curriculum.gradeLevel && (
              <div>
                <span className="text-slate-500">Grade:</span>
                <span className="ml-1.5 text-slate-200 font-semibold">{curriculum.gradeLevel}</span>
              </div>
            )}
            {curriculum.totalChapters && (
              <div>
                <span className="text-slate-500">Chapters:</span>
                <span className="ml-1.5 text-slate-200 font-semibold">{curriculum.totalChapters}</span>
              </div>
            )}
            {curriculum.generatedAt && (
              <div>
                <span className="text-slate-500">Generated:</span>
                <span className="ml-1.5 text-slate-200 font-semibold">
                  {new Date(curriculum.generatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Evidence Footer */}
      <AIEvidenceBadge
        provider="curriculum-engine"
        model="Curriculum Graph Builder"
        description="Concept graph extracted from uploaded syllabus using RAG retrieval"
      />
    </div>
  );
}
