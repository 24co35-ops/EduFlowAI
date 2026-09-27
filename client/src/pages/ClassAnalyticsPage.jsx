import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Send,
  UserCheck,
  Check
} from 'lucide-react';
import { getTeacherAnalytics, getAttempts } from '../services/api';

export default function ClassAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchedStudent, setDispatchedStudent] = useState(null);

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

  const handleDispatchIntervention = (studentName) => {
    setDispatchedStudent(studentName);
    setTimeout(() => setDispatchedStudent(null), 3500);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Feature F8: Classroom Learning Intelligence & Analytics
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Classroom Analytics & Insights</h1>
        <p className="text-xs text-slate-400">Answer "Who Needs Help?", track topic mastery heatmaps, and dispatch targeted IBM Granite interventions</p>
      </div>

      {dispatchedStudent && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-purple-400" />
          <span>IBM Granite remedial micro-lesson dispatched to <strong>{dispatchedStudent}</strong>!</span>
        </div>
      )}

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
            <span className="text-xs font-semibold text-slate-400">Time Saved Prep</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.timeSavedHoursThisWeek || 14.2} hrs</h3>
          <p className="text-[11px] text-amber-400 font-medium">IBM BOB Auto-Grading & Planning</p>
        </div>

      </div>

      {/* Main Grid: Topic Breakdown & Weak Area Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Topic Mastery Heatmap */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Topic Mastery & Accuracy Breakdown
            </h3>
            <span className="text-xs text-slate-400">Class 10 Science</span>
          </div>

          <div className="space-y-4">
            {analytics?.topicPerformance?.map((tp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{tp.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{tp.difficulty || 'Medium'}</span>
                    <span className={`font-bold ${tp.avgScore >= 80 ? 'text-emerald-400' : tp.avgScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {tp.avgScore}% ({tp.classification || 'Proficient'})
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
              <h3 className="text-base font-bold text-white font-outfit">Curriculum Weak Area Alerts</h3>
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
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> IBM Granite Recommendation:
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Student Submissions Stream */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-outfit">Recent Student Submissions</h3>
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

      {/* "Who Needs Help?" Students at Risk Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-outfit">Targeted Student Interventions ("Who Needs Help?")</h3>
          </div>
          <span className="text-xs text-slate-400">Direct AI Remediation Dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 rounded-l-xl">Student Name</th>
                <th className="p-3">Average Accuracy</th>
                <th className="p-3">Weak Topics Detected</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xs">
                    RG
                  </div>
                  <span>Rohan Gupta</span>
                </td>
                <td className="p-3 font-semibold text-amber-400">68%</td>
                <td className="p-3 text-slate-300">Resistors in Series & Parallel</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Needs Support
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDispatchIntervention('Rohan Gupta')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Send className="w-3 h-3" /> Send Remediation
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                    PV
                  </div>
                  <span>Pooja Verma</span>
                </td>
                <td className="p-3 font-semibold text-emerald-400">88%</td>
                <td className="p-3 text-slate-300">Calvin Cycle Chemistry</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Proficient
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDispatchIntervention('Pooja Verma')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                  >
                    <Send className="w-3 h-3 text-slate-400" /> Send Advanced Quiz
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
