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
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
          <LineChart className="w-3.5 h-3.5" /> Feature F8: Transparent Topic Mastery Analytics
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">My Learning Progress & Mastery</h1>
        <p className="text-xs text-slate-400">Multi-factor topic mastery calculation and closed-loop AI remediation</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Quizzes</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{progress?.totalQuizzesTaken || 3}</h3>
          <p className="text-[11px] text-emerald-400 font-medium">Auto-graded by IBM BOB</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Accuracy</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{progress?.averageScore || 82}%</h3>
          <p className="text-[11px] text-indigo-400 font-medium">Target: &gt;80%</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Streak</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{progress?.currentStreakDays || 5} Days</h3>
          <p className="text-[11px] text-amber-400 font-medium">Keep it up! 🔥</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Weak Topics</span>
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{progress?.weakTopics?.length || 1}</h3>
          <p className="text-[11px] text-rose-400 font-medium">AI Remediation available</p>
        </div>

      </div>

      {/* Transparent Topic Mastery Breakdown */}
      {progress?.topicMastery && progress.topicMastery.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Multi-Factor Topic Mastery Engine
            </h3>
            <span className="text-xs text-slate-400">Weighted: 40% Recent • 25% Hist • 15% Consistency • 10% Diff • 10% Trend</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.topicMastery.map((tm, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{tm.topic}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tm.masteryScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tm.masteryScore >= 60
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {tm.classification} ({tm.masteryScore}%)
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedTopicForRemediation(tm.topic)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-200" /> Remediate
                  </button>
                </div>

                {/* Factors Grid */}
                {tm.factors && (
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    <div>Recent: <strong className="text-white">{tm.factors.recentScore}%</strong></div>
                    <div>Hist Avg: <strong className="text-white">{tm.factors.historicalAvg}%</strong></div>
                    <div>Consistency: <strong className="text-white">{tm.factors.consistency}%</strong></div>
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
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-400" /> Recent Assessment History
          </h3>

          <div className="space-y-3">
            {progress?.recentAttempts?.map((att, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{att.topic}</h4>
                  <p className="text-[11px] text-slate-400">
                    Date: {att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-base">{att.percentage}%</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Passed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Revision Guidance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-4">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-white font-outfit">IBM BOB Revision Advice</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your quiz performance, focusing on <strong>{progress?.weakTopics?.[0] || 'Ohm Law and Circuits'}</strong> will yield the highest grade improvement!
            </p>

            <button
              onClick={() => setSelectedTopicForRemediation(progress?.weakTopics?.[0] || 'Ohm Law and Circuits')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
            >
              <Zap className="w-4 h-4" /> Start AI Remediation Loop
            </button>

            <Link
              to="/doubt-solver"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all block text-center"
            >
              <MessageSquareCode className="w-4 h-4 text-indigo-400" /> Ask IBM BOB Tutor for Help
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
