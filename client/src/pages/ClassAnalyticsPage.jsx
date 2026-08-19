import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { getTeacherAnalytics, getAttempts } from '../services/api';

export default function ClassAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, attRes] = await Promise.all([
          getTeacherAnalytics(),
          getAttempts()
        ]);
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

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Feature F8: Class Performance & Heatmap
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Classroom Analytics & Insights</h1>
        <p className="text-xs text-slate-400">Track student progress, weak topic heatmaps, and AI recommendations for class interventions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Enrolled Students</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.totalStudents || 42}</h3>
          <p className="text-[11px] text-indigo-400 font-medium">Class 10 — Section A & B</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Quizzes Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.quizzesCompleted || 128}</h3>
          <p className="text-[11px] text-emerald-400 font-medium">92% Completion Rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Class Average</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.classAverageScore || 84.5}%</h3>
          <p className="text-[11px] text-blue-400 font-medium">+4.2% from last month</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Top Mastery Topic</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white font-outfit truncate">Ohm Law & Circuits</h3>
          <p className="text-[11px] text-amber-400 font-medium">88% Avg Accuracy</p>
        </div>

      </div>

      {/* Main Grid: Weak Area Heatmap & Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Topic Mastery Heatmap */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Topic Accuracy Breakdown
            </h3>
            <span className="text-xs text-slate-400">Class 10 Science</span>
          </div>

          <div className="space-y-4">
            {analytics?.topicPerformance?.map((tp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{tp.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{tp.difficulty}</span>
                    <span className={`font-bold ${tp.avgScore >= 80 ? 'text-emerald-400' : tp.avgScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {tp.avgScore}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tp.avgScore >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : tp.avgScore >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    }`}
                    style={{ width: `${tp.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IBM BOB AI Interventions & Alerts */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white font-outfit">Weak Area Alert</h3>
            </div>

            {analytics?.weakTopicAlerts?.map((alert, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-300">{alert.topic}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Fail Rate: {alert.failureRate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> IBM BOB Recommendation:
                  </div>
                  <p className="text-[11px] text-slate-400">{alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Student Submissions Stream */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-outfit">Recent Quiz Submissions</h3>
            <div className="space-y-3">
              {attempts.slice(0, 3).map((att, idx) => (
                <div key={att._id || idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{att.studentName}</h4>
                    <p className="text-[11px] text-slate-400">{att.topic}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 text-sm">{att.percentage}%</span>
                    <p className="text-[10px] text-slate-500">{att.totalScore}/{att.maxScore} Pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
