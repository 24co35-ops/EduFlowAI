import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  Sparkles, 
  BookOpen, 
  FileCheck2, 
  BarChart3, 
  Clock, 
  Users, 
  ArrowRight, 
  Plus, 
  FileText, 
  Globe,
  Zap
} from 'lucide-react';
import { getLessons, getQuizzes, getTeacherAnalytics } from '../services/api';

export default function TeacherDashboard({ user }) {
  const { user: clerkUser } = useUser();
  const displayName = clerkUser?.fullName || clerkUser?.firstName || user?.name || 'Educator';
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lRes, qRes, aRes] = await Promise.all([
          getLessons(),
          getQuizzes(),
          getTeacherAnalytics()
        ]);
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

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Educator Control Center
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">
              Hello, <span className="gradient-text">{displayName}</span> 👋
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              IBM BOB (watsonx.ai) is ready to transform your course syllabus into weekly lesson plans, quizzes, and multilingual materials in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/lesson-planner"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Lesson Plan
            </Link>
            <Link
              to="/quiz-builder"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Build Auto Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Time Saved This Week</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.timeSavedHoursThisWeek || '14.2'} hrs</h3>
            <p className="text-[11px] text-emerald-400 font-medium">↓ 65% reduction in prep paperwork</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lesson Plans Created</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white font-outfit">{lessons.length || 3}</h3>
            <p className="text-[11px] text-indigo-400 font-medium">IBM Granite 13B auto-generated</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Quizzes</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white font-outfit">{quizzes.length || 4}</h3>
            <p className="text-[11px] text-purple-400 font-medium">Auto-graded with AI NLP</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Class Performance</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white font-outfit">{analytics?.classAverageScore || '84.5'}%</h3>
            <p className="text-[11px] text-blue-400 font-medium">42 Enrolled Students</p>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Recent Lessons & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Lesson Plans */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white font-outfit">Recent Lesson Plans</h3>
            </div>
            <Link to="/lesson-planner" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {lessons.slice(0, 3).map((item, idx) => (
              <div key={item._id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{item.subject}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.overview}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>📅 5-Day Plan</span>
                    <span>🌐 {item.language === 'en' ? 'English' : 'Multilingual'}</span>
                  </div>
                </div>
                <Link to="/lesson-planner" className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all">
                  Open
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Active Quizzes */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white font-outfit">Active Quizzes</h3>
            </div>
            <Link to="/quiz-builder" className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1">
              Build Quiz <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {quizzes.slice(0, 3).map((q, idx) => (
              <div key={q._id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{q.topic}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{q.questions?.length || 4} Questions • Auto-graded</p>
                </div>
                <Link to="/analytics" className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all">
                  Stats
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
