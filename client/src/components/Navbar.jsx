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
      <header className="sticky top-0 z-40 bg-[#E5DED0] border-b border-[rgba(20,28,43,0.16)] text-[#141C2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-9 h-9 border border-[rgba(20,28,43,0.2)] flex items-center justify-center transition-transform group-hover:border-[#2C4A8F] overflow-hidden bg-[#EFE9DD]">
                <img src="/logo.jpg" alt="EduFlow AI Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="serif-display text-xl font-bold tracking-tight">
                    EduFlow <span className="serif-italic">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 border border-[rgba(44,74,143,0.3)] text-[#2C4A8F] bg-[rgba(44,74,143,0.06)]">
                    <Cpu className="w-2.5 h-2.5" /> [ IBM GRANITE ]
                  </span>
                </div>
                <p className="text-[10px] text-[#767E8C] mono-label hidden sm:block">Automated Curriculum & Prerequisite Ledger</p>
              </div>
            </Link>

            {/* Right Action & User Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Visual Workflow Studio Quick Action */}
              {user && (
                <Link
                  to="/workflow-studio"
                  title="Visual AI Workflow Builder"
                  className="btn-outline text-[10px] py-1 px-2.5 hidden sm:inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#2C4A8F]" />
                  <span>[ Studio ]</span>
                </Link>
              )}

              {/* AI Diagnostic Button */}
              <button
                onClick={() => setShowDiagnostics(true)}
                title="AI System Diagnostics & Telemetry"
                className="btn-outline text-[10px] py-1 px-2.5 inline-flex items-center gap-1.5"
              >
                <Activity className="w-3 h-3 text-[#2C4A8F]" />
                <span className="hidden md:inline">[ Telemetry ]</span>
              </button>

              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] text-xs">
                    <User className="w-3.5 h-3.5 text-[#2C4A8F]" />
                    <span className="mono-label text-[11px] truncate max-w-[120px]">{displayName}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border uppercase ${
                        roleName === 'teacher'
                          ? 'border-[rgba(20,28,43,0.3)] text-[#141C2B] bg-[rgba(20,28,43,0.05)]'
                          : 'border-[rgba(44,74,143,0.3)] text-[#2C4A8F] bg-[rgba(44,74,143,0.08)]'
                      }`}
                    >
                      {roleName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="btn-outline text-[10px] py-1 px-2.5 hidden sm:inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>[ Exit ]</span>
                  </button>

                  {/* Mobile Hamburger Button */}
                  <button
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    className="md:hidden p-2 border border-[rgba(20,28,43,0.16)] bg-[#EFE9DD] text-[#141C2B]"
                    aria-label="Toggle Navigation Menu"
                  >
                    {mobileMenuOpen ? <X className="w-4 h-4 text-[#2C4A8F]" /> : <Menu className="w-4 h-4" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn-outline text-[10px] py-1.5 px-3"
                  >
                    [ Sign In ]
                  </Link>
                  <Link
                    to="/register"
                    className="btn-filled text-[10px] py-1.5 px-3"
                  >
                    [ Register ]
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-[rgba(20,28,43,0.16)] bg-[#E5DED0] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,28,43,0.16)] text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#2C4A8F]" />
                <span className="mono-label">{displayName}</span>
                <span className="text-[10px] text-[#2C4A8F] mono-label">({roleName})</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#141C2B] text-xs flex items-center gap-1 mono-label"
              >
                <LogOut className="w-3.5 h-3.5" /> [ Exit ]
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
                    className={`flex items-center justify-between px-3 py-2 text-xs mono-label transition-all ${
                      isActive
                        ? 'bg-[#141C2B] text-[#EFE9DD]'
                        : 'text-[#4A5364] hover:bg-[#EFE9DD] hover:text-[#141C2B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </div>
                    {item.tag && (
                      <span className="px-1 py-0.5 text-[9px] border border-[rgba(20,28,43,0.2)]">
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
