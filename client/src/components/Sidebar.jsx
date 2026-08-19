import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileCheck2, 
  BarChart3, 
  MessageSquareCode, 
  Layers, 
  LineChart, 
  Sparkles,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ user }) {
  const { user: clerkUser } = useUser();
  const isTeacher = user?.role === 'teacher';
  const displayName = clerkUser?.fullName || clerkUser?.firstName || user?.name || 'Educator';

  const teacherNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Lesson Planner (F1)', path: '/lesson-planner', icon: BookOpen, tag: 'AI' },
    { name: 'Quiz Builder (F2)', path: '/quiz-builder', icon: FileCheck2, tag: 'Auto' },
    { name: 'Class Analytics (F8)', path: '/analytics', icon: BarChart3 }
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Doubt Solver (F4)', path: '/doubt-solver', icon: MessageSquareCode, tag: 'Live Chat' },
    { name: 'Flashcards & Summary (F5)', path: '/flashcards', icon: Layers, tag: 'Cards' },
    { name: 'Quizzes & Practice (F6)', path: '/quizzes', icon: Zap },
    { name: 'My Progress (F8)', path: '/progress', icon: LineChart }
  ];

  const currentNav = isTeacher ? teacherNav : studentNav;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 glass-card rounded-2xl p-4 border border-slate-800 space-y-6">
        
        {/* Profile Header Widget */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'Teacher'} • {user?.grade || 'Class 10'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* IBM BOB Watsonx Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-indigo-500/20 text-center space-y-2">
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> IBM watsonx.ai Engine
          </div>
          <p className="text-[10px] text-slate-400">
            Powered by Granite 13B & 20B models for lesson generation, doubt chat & auto-grading.
          </p>
        </div>

      </div>
    </aside>
  );
}
