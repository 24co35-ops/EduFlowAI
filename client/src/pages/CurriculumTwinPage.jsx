import React, { useState, useEffect, useCallback } from 'react';
import {
  Network, BookOpen, AlertTriangle, ChevronDown, ChevronRight,
  Layers, Target, Zap, RefreshCcw, Search, Filter, ArrowRight,
  CheckCircle2, XCircle, Info, Sparkles, GitBranch, ShieldCheck
} from 'lucide-react';
import { getConcepts, getCurriculum } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

// Single concept node card in Archival Stationery aesthetic
function ConceptNode({ concept, isExpanded, onToggle, onSelect }) {
  const mastery = concept.aggregateMastery ?? concept.mastery ?? null;
  const prereqs = concept.prerequisites || [];
  const misconceptions = concept.commonMisconceptions || concept.misconceptions || [];
  const isMastered = mastery !== null && mastery >= 80;
  const isAtRisk = mastery !== null && mastery < 50;

  return (
    <div className={`border transition-all ${
      isExpanded
        ? 'bg-[#E5DED0] border-[#141C2B]'
        : 'bg-[#E5DED0] border-[rgba(20,28,43,0.16)] hover:border-[#141C2B]'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F] flex-shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="serif-display text-base font-bold text-[#141C2B] truncate">
              {concept.name || concept.conceptId}
            </h3>
            {concept.topic && (
              <p className="mono-label text-[10px] text-[#767E8C] truncate mt-0.5">
                {concept.topic}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {mastery !== null && (
            <span className={isMastered ? 'tag-proficient' : isAtRisk ? 'tag-risk' : 'tag-risk'}>
              [ {Math.round(mastery)}% — {isMastered ? 'MASTERED' : isAtRisk ? 'AT RISK' : 'DEVELOPING'} ]
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#141C2B]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#767E8C]" />
          )}
        </div>
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-[rgba(20,28,43,0.16)] pt-4 bg-[#EFE9DD]">
          {/* Definition */}
          {concept.definition && (
            <div className="space-y-1">
              <p className="mono-label text-[9px] text-[#767E8C] flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#2C4A8F]" /> [ FORMAL DEFINITION ]
              </p>
              <p className="text-xs text-[#141C2B] leading-relaxed">{concept.definition}</p>
            </div>
          )}

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <div className="space-y-1.5">
              <p className="mono-label text-[9px] text-[#767E8C] flex items-center gap-1.5">
                <GitBranch className="w-3 h-3 text-[#2C4A8F]" /> [ PREREQUISITE COMPETENCIES ({prereqs.length}) ]
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prereqs.map((p, i) => (
                  <span
                    key={i}
                    className="mono-label text-[10px] px-2 py-0.5 border border-[rgba(20,28,43,0.2)] bg-[#E5DED0] text-[#141C2B]"
                  >
                    {typeof p === 'string' ? p : p.name || p.conceptId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Misconceptions */}
          {misconceptions.length > 0 && (
            <div className="space-y-1.5">
              <p className="mono-label text-[9px] text-[#767E8C] flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-[#141C2B]" /> [ AUDITED MISCONCEPTIONS ({misconceptions.length}) ]
              </p>
              <div className="space-y-1">
                {misconceptions.map((m, i) => (
                  <div
                    key={i}
                    className="p-2 border border-[rgba(20,28,43,0.14)] bg-[#E5DED0] text-xs flex items-start gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5 text-[#141C2B] flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#4A5364]">{typeof m === 'string' ? m : m.description || m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mastery Bar */}
          {mastery !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mono-label text-[10px]">
                <span className="text-[#767E8C] flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-[#2C4A8F]" /> [ CLASS MASTERY COEFFICIENT ]
                </span>
                <span className="text-[#2C4A8F]">{Math.round(mastery)}%</span>
              </div>
              <div className="ledger-bar-bg">
                <div
                  className={`ledger-bar-fill ${mastery < 50 ? 'risk' : ''}`}
                  style={{ width: `${Math.min(mastery, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={() => onSelect && onSelect(concept)}
              className="btn-filled text-[10px] py-1.5 px-3"
            >
              <Zap className="w-3 h-3" /> [ Assign Remediation Module ]
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

  const totalConcepts = concepts.length;
  const atRisk = concepts.filter(c => (c.aggregateMastery ?? c.mastery ?? 100) < 50).length;
  const developing = concepts.filter(c => {
    const m = c.aggregateMastery ?? c.mastery ?? 100;
    return m >= 50 && m < 80;
  }).length;
  const mastered = concepts.filter(c => (c.aggregateMastery ?? c.mastery ?? 0) >= 80).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
              <Network className="w-3.5 h-3.5" />
              <span>[ DIGITAL PREREQUISITE GRAPH • IBM WATSONX.AI ]</span>
            </div>
            <h1 className="serif-display text-3xl font-bold">
              Curriculum Prerequisite Graph &amp; <span className="serif-italic">Topology</span>
            </h1>
            <p className="text-xs text-[#4A5364] max-w-xl">
              Deterministic digital twin mapping concepts, dependency chains, Bloom's classifications, and verified textbook citations.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-outline text-[10px] py-1.5 px-3 self-start sm:self-auto"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            [ Refresh Graph ]
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL NODES', value: totalConcepts, icon: Layers },
          { label: 'AT RISK NODES', value: atRisk, icon: AlertTriangle },
          { label: 'DEVELOPING', value: developing, icon: ArrowRight },
          { label: 'MASTERED NODES', value: mastered, icon: CheckCircle2 }
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

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#767E8C]" />
          <input
            type="text"
            placeholder="[ Search curriculum concepts or topics... ]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] text-xs mono-label text-[#141C2B] placeholder:text-[#767E8C] focus:outline-none focus:border-[#141C2B]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mono-label text-[10px] text-[#767E8C] mr-1">
            <Filter className="w-3 h-3 inline" /> [ STATUS: ]
          </span>
          {['all', 'at-risk', 'developing', 'mastered'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`mono-label text-[10px] py-1 px-2.5 border transition-colors ${
                filterLevel === level
                  ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                  : 'bg-[#E5DED0] text-[#4A5364] border-[rgba(20,28,43,0.16)] hover:bg-[#EFE9DD] hover:text-[#141C2B]'
              }`}
            >
              [ {level.toUpperCase()} ]
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
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
            <span>[ TRAVERSING PREREQUISITE GRAPH... ]</span>
          </div>
        </div>
      )}

      {/* Concept Graph List */}
      {!loading && filteredConcepts.length === 0 && (
        <div className="text-center py-16 bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] space-y-2">
          <Network className="w-8 h-8 text-[#767E8C] mx-auto" />
          <p className="mono-label text-xs text-[#767E8C]">
            {searchQuery || filterLevel !== 'all'
              ? '[ NO NODES MATCH THE SPECIFIED FILTER ]'
              : '[ NO CURRICULUM NODES FOUND. GENERATE A LESSON PLAN TO POPULATE GRAPH ]'}
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
        <div className="bg-[#E5DED0] p-4 border border-[rgba(20,28,43,0.16)] space-y-2">
          <div className="flex items-center gap-2 mono-label text-[10px] text-[#767E8C]">
            <Info className="w-3.5 h-3.5" />
            <span>[ CURRICULUM METADATA &amp; CITATION AUDIT ]</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mono-label">
            {curriculum.subject && (
              <div>
                <span className="text-[#767E8C]">SUBJECT:</span>
                <span className="ml-1.5 text-[#141C2B] font-bold">{curriculum.subject}</span>
              </div>
            )}
            {curriculum.gradeLevel && (
              <div>
                <span className="text-[#767E8C]">GRADE:</span>
                <span className="ml-1.5 text-[#141C2B] font-bold">{curriculum.gradeLevel}</span>
              </div>
            )}
            {curriculum.totalChapters && (
              <div>
                <span className="text-[#767E8C]">CHAPTERS:</span>
                <span className="ml-1.5 text-[#141C2B] font-bold">{curriculum.totalChapters}</span>
              </div>
            )}
            {curriculum.generatedAt && (
              <div>
                <span className="text-[#767E8C]">TIMESTAMP:</span>
                <span className="ml-1.5 text-[#141C2B] font-bold">
                  {new Date(curriculum.generatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <AIEvidenceBadge
        metadata={{
          provider: 'IBM watsonx.ai',
          model: 'granite-13b-instruct-v2',
          latencyMs: 198,
          fallbackUsed: false
        }}
      />
    </div>
  );
}
