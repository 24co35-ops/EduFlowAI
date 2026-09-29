import React from 'react';
import { NavLink } from 'react-router-dom';
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
  GraduationCap,
  Network,
  Crosshair,
  Target
} from 'lucide-react';

export default function Sidebar({ user }) {
  const isTeacher = user?.role === 'teacher';
  const displayName = user?.name || 'Educator';

  const teacherNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflow Studio', path: '/workflow-studio', icon: Sparkles, tag: 'Visual' },
    { name: 'Action Center', path: '/action-center', icon: Crosshair, tag: 'Intervene' },
    { name: 'Curriculum Twin', path: '/curriculum-twin', icon: Network, tag: 'Graph' },
    { name: 'Lesson Planner', path: '/lesson-planner', icon: BookOpen, tag: 'AI' },
    { name: 'Quiz Builder', path: '/quiz-builder', icon: FileCheck2, tag: 'Auto' },
    { name: 'Class Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflow Studio', path: '/workflow-studio', icon: Sparkles, tag: 'Visual' },
    { name: 'Mastery Check', path: '/mastery-check', icon: Target, tag: 'Verify' },
    { name: 'AI Doubt Solver', path: '/doubt-solver', icon: MessageSquareCode, tag: 'Grounded' },
    { name: 'Flashcards', path: '/flashcards', icon: Layers, tag: 'Cards' },
    { name: 'Quizzes & Practice', path: '/quizzes', icon: Zap },
    { name: 'My Progress', path: '/progress', icon: LineChart }
  ];

  const currentNav = isTeacher ? teacherNav : studentNav;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-4 space-y-6 text-[#141C2B]">
        
        {/* Profile Header Widget */}
        <div className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] flex items-center gap-3">
          <div className="w-9 h-9 border border-[rgba(20,28,43,0.2)] bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4 text-[#EFE9DD]" />
          </div>
          <div className="overflow-hidden">
            <h4 className="mono-label text-xs truncate">{displayName}</h4>
            <p className="text-[10px] text-[#767E8C] mono-label capitalize">{user?.role || 'Teacher'} • {user?.grade || 'Class 10'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-2 text-[9px] font-bold text-[#767E8C] uppercase tracking-widest mb-2 mono-label">
            [ System Ledger ]
          </p>
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs mono-label transition-all ${
                    isActive
                      ? 'bg-[#141C2B] text-[#EFE9DD]'
                      : 'text-[#4A5364] hover:bg-[#EFE9DD] hover:text-[#141C2B]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span className="px-1 py-0.5 text-[9px] border border-[rgba(20,28,43,0.2)] text-[#2C4A8F]">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* IBM watsonx Granite Telemetry Strip */}
        <div className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] text-center space-y-1.5">
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2C4A8F] mono-label">
            <Sparkles className="w-3 h-3 text-[#2C4A8F]" /> [ IBM WATSONX.AI ]
          </div>
          <p className="text-[10px] text-[#4A5364] leading-relaxed">
            Granite 13B & 20B grounded models with deterministic scoring.
          </p>
        </div>

      </div>
    </aside>
  );
}
