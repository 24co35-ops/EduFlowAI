import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LogOut,
  User,
  Cpu,
  Activity,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  BarChart3,
  MessageSquareCode,
  Layers,
  Zap,
  LineChart,
  Crosshair,
  Network,
  Target
} from 'lucide-react';
import DiagnosticPanel from './DiagnosticPanel';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const displayName = user?.name || 'Educator';
  const roleName = user?.role || 'teacher';
  const isTeacher = roleName === 'teacher';

  const teacherNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflow Studio', path: '/workflow-studio', icon: Sparkles, tag: 'Visual AI' },
    { name: 'Action Center', path: '/action-center', icon: Crosshair, tag: 'Intervene' },
    { name: 'Curriculum Twin', path: '/curriculum-twin', icon: Network, tag: 'Graph' },
    { name: 'Lesson Planner', path: '/lesson-planner', icon: BookOpen },
    { name: 'Quiz Builder', path: '/quiz-builder', icon: FileCheck2 },
    { name: 'Class Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflow Studio', path: '/workflow-studio', icon: Sparkles, tag: 'Visual AI' },
    { name: 'Mastery Check', path: '/mastery-check', icon: Target, tag: 'Verify' },
    { name: 'AI Doubt Solver', path: '/doubt-solver', icon: MessageSquareCode },
    { name: 'Flashcards', path: '/flashcards', icon: Layers },
    { name: 'Quizzes', path: '/quizzes', icon: Zap },
    { name: 'My Progress', path: '/progress', icon: LineChart }
  ];

  const currentNav = isTeacher ? teacherNav : studentNav;

  return (
    <>
      <header className="sticky top-0 z-40 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-outfit">EduFlow <span className="gradient-text">AI</span></span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="w-3 h-3" /> IBM BOB (watsonx.ai)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Learning Intervention Intelligence</p>
              </div>
            </Link>

            {/* Right Action & User Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Visual Workflow Studio Quick Action */}
              {user && (
                <Link
                  to="/workflow-studio"
                  title="Visual AI Workflow Builder"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Workflow Studio</span>
                </Link>
              )}

              {/* AI Diagnostic Button */}
              <button
                onClick={() => setShowDiagnostics(true)}
                title="AI System Diagnostics & Telemetry"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-105"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden md:inline">Diagnostics</span>
              </button>

              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-medium truncate max-w-[120px]">{displayName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        roleName === 'teacher'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {roleName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>

                  {/* Mobile Hamburger Button */}
                  <button
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
                    aria-label="Toggle Navigation Menu"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{displayName}</span>
                <span className="text-[10px] text-indigo-400 uppercase font-bold">({roleName})</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-rose-400 text-xs flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>

            <nav className="space-y-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                    }`}
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
            </nav>
          </div>
        )}
      </header>

      {/* Observability Diagnostics Modal */}
      <DiagnosticPanel
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </>
  );
}
