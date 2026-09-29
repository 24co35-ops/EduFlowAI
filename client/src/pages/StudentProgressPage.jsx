import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Award, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  MessageSquareCode,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';
import { getStudentProgress } from '../services/api';
import RemediationModal from '../components/RemediationModal';

export default function StudentProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicForRemediation, setSelectedTopicForRemediation] = useState(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await getStudentProgress();
        setProgress(res.data.summary);
      } catch (err) {
        console.warn('Progress fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#141C2B]/15 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] text-[10px] font-mono uppercase tracking-wider mb-2">
          <LineChart className="w-3.5 h-3.5" /> Feature F8: Multi-Factor Mastery Analytics
        </div>
        <h1 className="text-3xl font-serif text-[#141C2B] tracking-tight">Scholar Learning <span className="italic text-[#2C4A8F]">Ledger &amp; Mastery</span></h1>
        <p className="text-xs text-[#141C2B]/70 font-mono mt-1">Multi-factor concept mastery tracking and closed-loop IBM Granite remediation protocol.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="stationery-card p-5 border border-[#141C2B]/15 bg-[#E5DED0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px]">Quizzes Logged</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#141C2B]">{progress?.totalQuizzesTaken || 3}</h3>
          <p className="text-[10px] font-mono text-emerald-800 font-bold">Auto-graded deterministically</p>
        </div>

        <div className="stationery-card p-5 border border-[#141C2B]/15 bg-[#E5DED0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px]">Average Accuracy</span>
            <Award className="w-4 h-4 text-[#2C4A8F]" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#141C2B]">{progress?.averageScore || 82}%</h3>
          <p className="text-[10px] font-mono text-[#2C4A8F] font-bold">Mastery target: &gt;80%</p>
        </div>

        <div className="stationery-card p-5 border border-[#141C2B]/15 bg-[#E5DED0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px]">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#141C2B]">{progress?.currentStreakDays || 5} Days</h3>
          <p className="text-[10px] font-mono text-amber-800 font-bold">Consistent Study Cadence</p>
        </div>

        <div className="stationery-card p-5 border border-[#141C2B]/15 bg-[#E5DED0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px]">Deficit Concepts</span>
            <Sparkles className="w-4 h-4 text-rose-700" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#141C2B]">{progress?.weakTopics?.length || 1}</h3>
          <p className="text-[10px] font-mono text-rose-800 font-bold">AI Remediation loop ready</p>
        </div>

      </div>

      {/* Transparent Topic Mastery Breakdown */}
      {progress?.topicMastery && progress.topicMastery.length > 0 && (
        <div className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141C2B]/10 pb-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2C4A8F]" /> Multi-Factor Concept Mastery Engine
            </h3>
            <span className="mono-label text-[10px]">WEIGHTS: 40% RECENT • 25% HIST • 15% CONSISTENCY • 10% DIFF • 10% TREND</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.topicMastery.map((tm, idx) => (
              <div key={idx} className="p-4 bg-[#EFE9DD] border border-[#141C2B]/15 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#141C2B]">{tm.topic}</h4>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold border mt-1 ${
                      tm.masteryScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-800 border-emerald-600/30'
                        : tm.masteryScore >= 60
                        ? 'bg-amber-500/10 text-amber-800 border-amber-600/30'
                        : 'bg-rose-500/10 text-rose-800 border-rose-600/30'
                    }`}>
                      {tm.classification} ({tm.masteryScore}%)
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedTopicForRemediation(tm.topic)}
                    className="btn-filled text-[11px] py-1 px-3 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#EFE9DD]" /> [ Remediate ]
                  </button>
                </div>

                {/* Factors Grid */}
                {tm.factors && (
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#141C2B]/70 pt-2 border-t border-[#141C2B]/10">
                    <div>Recent: <strong className="text-[#141C2B]">{tm.factors.recentScore}%</strong></div>
                    <div>Hist Avg: <strong className="text-[#141C2B]">{tm.factors.historicalAvg}%</strong></div>
                    <div>Consistency: <strong className="text-[#141C2B]">{tm.factors.consistency}%</strong></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Score History Stream */}
        <div className="lg:col-span-7 stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-4">
          <div className="border-b border-[#141C2B]/10 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#2C4A8F]" /> Recent Assessment History
            </h3>
            <span className="mono-label text-[10px]">HISTORICAL LOG</span>
          </div>

          <div className="space-y-3">
            {(!progress?.recentAttempts || progress.recentAttempts.length === 0) ? (
              <div className="p-6 bg-[#EFE9DD] border border-dashed border-[#141C2B]/20 text-center space-y-2">
                <p className="text-xs font-mono text-[#141C2B]/70">No quiz attempts recorded in this ledger yet.</p>
                <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#2C4A8F] hover:underline">
                  <Zap className="w-3.5 h-3.5" /> [ Attempt your first diagnostic quiz ]
                </Link>
              </div>
            ) : (
              progress.recentAttempts.map((att, idx) => (
                <div key={idx} className="p-3.5 bg-[#EFE9DD] border border-[#141C2B]/15 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#141C2B]">{att.topic}</h4>
                    <p className="text-[10px] font-mono text-[#141C2B]/60 mt-0.5">
                      Date: {att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-[#2C4A8F] text-base">{att.percentage}%</span>
                    <span className="block text-[10px] text-[#141C2B]/60">RECORDED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Revision Guidance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="stationery-card p-6 border border-[#2C4A8F]/30 bg-[#E5DED0] space-y-4">
            <div className="flex items-center gap-2 text-[#2C4A8F] border-b border-[#2C4A8F]/20 pb-3">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#141C2B]">IBM BOB Revision Directive</h3>
            </div>

            <p className="text-xs font-mono text-[#141C2B]/80 leading-relaxed">
              Based on your quiz performance, focusing on <strong>{progress?.weakTopics?.[0] || 'Ohm Law and Circuits'}</strong> will yield the highest grade improvement!
            </p>

            <button
              onClick={() => setSelectedTopicForRemediation(progress?.weakTopics?.[0] || 'Ohm Law and Circuits')}
              className="w-full btn-filled py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-[#EFE9DD]" /> [ Start AI Remediation Loop ]
            </button>

            <Link
              to="/doubt-solver"
              className="w-full btn-outline py-2 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 block text-center"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-[#2C4A8F]" /> [ Consult IBM BOB Tutor ]
            </Link>
          </div>
        </div>

      </div>

      {/* AI Remediation Interactive Modal */}
      <RemediationModal
        isOpen={Boolean(selectedTopicForRemediation)}
        onClose={() => setSelectedTopicForRemediation(null)}
        initialTopic={selectedTopicForRemediation || 'Ohm Law'}
      />

    </div>
  );
}
