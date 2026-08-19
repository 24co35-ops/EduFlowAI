import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, Cpu } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const { user: clerkUser, isSignedIn } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    setUser(null);
    navigate('/login');
  };

  const displayName = clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || user?.name;
  const roleName = user?.role || 'teacher';

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-outfit">EduFlow <span className="gradient-text">AI</span></span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Cpu className="w-3 h-3" /> IBM BOB (watsonx.ai)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Intelligent Education Automation</p>
            </div>
          </Link>

          {/* User Section & Clerk Auth Controls */}
          <div className="flex items-center gap-4">
            
            {/* Signed-in View */}
            <SignedIn>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-medium">{displayName}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                  roleName === 'teacher' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {roleName}
                </span>
              </div>

              {/* Clerk User Button Profile */}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Signed-out View */}
            <SignedOut>
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Local Auth Fallback if signed in without Clerk */}
            {!isSignedIn && user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-300 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
