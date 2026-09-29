import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  Building, 
  ArrowRight, 
  KeyRound, 
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { loginUser, registerUser, forgotPassword, resetPassword } from '../services/api';
import { supabase } from '../lib/supabaseClient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===========================================================================
// LOGIN PAGE
// ===========================================================================
export function LoginPage({ setUser }) {
  const [email, setEmail] = useState('teacher@eduflow.ai');
  const [password, setPassword] = useState('teacher123');
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    setError('');
    setSelectedRole(role);
    if (role === 'teacher') {
      setEmail('teacher@eduflow.ai');
      setPassword('teacher123');
    } else {
      setEmail('student@eduflow.ai');
      setPassword('student123');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: cleanEmail, password, role: selectedRole });
      if (res.data.success) {
        localStorage.setItem('eduflow_token', res.data.token);
        localStorage.setItem('eduflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setError(res.data.message || 'Invalid email or password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const status = err.response?.status;
      if (msg) {
        setError(msg);
      } else if (status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Cannot reach server. Is the backend running?');
      } else if (status) {
        setError(`Error (${status}): ${err.message || 'Login failed.'}`);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full stationery-card p-8 border border-[#141C2B]/15 bg-[#E5DED0] space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2 border-b border-[#141C2B]/10 pb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] mb-1">
            <Sparkles className="w-5 h-5 text-[#2C4A8F]" />
          </div>
          <h2 className="text-2xl font-serif text-[#141C2B] tracking-tight">EduFlow <span className="italic text-[#2C4A8F]">AI</span></h2>
          <p className="text-xs font-mono text-[#141C2B]/70">Intelligent Course Content Automation powered by IBM watsonx.ai</p>
        </div>

        {/* Role Selectors: Teacher vs Student */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectRole('teacher')}
              className={`py-2.5 px-3 border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                selectedRole === 'teacher' || email.toLowerCase().includes('teacher')
                  ? 'bg-[#141C2B] border-[#141C2B] text-[#EFE9DD]'
                  : 'bg-[#EFE9DD] border-[#141C2B]/15 text-[#141C2B]/70 hover:border-[#141C2B]'
              }`}
            >
              <span>👩‍🏫 [ Teacher Portal ]</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('student')}
              className={`py-2.5 px-3 border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                selectedRole === 'student' || email.toLowerCase().includes('student')
                  ? 'bg-[#141C2B] border-[#141C2B] text-[#EFE9DD]'
                  : 'bg-[#EFE9DD] border-[#141C2B]/15 text-[#141C2B]/70 hover:border-[#141C2B]'
              }`}
            >
              <span>🧑‍🎓 [ Student Portal ]</span>
            </button>
          </div>
          <p className="text-[10px] font-mono text-[#141C2B]/60 text-center">
            One-click role toggle for jury evaluation
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-600/30 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mono-label text-[11px] block mb-1">Email Classification</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder="teacher@eduflow.ai"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="mono-label text-[11px]">Passcode</label>
              <Link to="/forgot-password" className="text-xs font-mono text-[#2C4A8F] hover:underline">
                [ Forgot password? ]
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-9 pr-10 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-[#141C2B]/50 hover:text-[#141C2B] focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-filled py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                <span>[ Authenticating... ]</span>
              </>
            ) : (
              <>
                <span>[ Sign In to Platform ]</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#141C2B]/10">
          <p className="text-xs font-mono text-[#141C2B]/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2C4A8F] hover:underline font-bold">
              [ Register Scholar/Teacher ]
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// ===========================================================================
// REGISTER PAGE
// ===========================================================================
export function RegisterPage({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('teacher');
  const [institution, setInstitution] = useState('EduFlow Academy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Full name is required.');
      return;
    }
    if (!cleanEmail) {
      setError('Email address is required.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: cleanName,
        email: cleanEmail,
        password,
        role,
        institution: institution.trim() || 'EduFlow Academy'
      });

      if (res.data.success) {
        localStorage.setItem('eduflow_token', res.data.token);
        localStorage.setItem('eduflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setError(res.data.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const status = err.response?.status;
      if (msg) {
        setError(msg);
      } else if (status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Cannot reach server. Is the backend running?');
      } else if (status) {
        setError(`Error (${status}): ${err.message || 'Registration failed.'}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full stationery-card p-8 border border-[#141C2B]/15 bg-[#E5DED0] space-y-6">
        
        <div className="text-center space-y-2 border-b border-[#141C2B]/10 pb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] mb-1">
            <Sparkles className="w-5 h-5 text-[#2C4A8F]" />
          </div>
          <h2 className="text-2xl font-serif text-[#141C2B] tracking-tight">Create Repository <span className="italic text-[#2C4A8F]">Account</span></h2>
          <p className="text-xs font-mono text-[#141C2B]/70">Register for curriculum synthesis and adaptive mastery verification</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-600/30 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="mono-label text-[11px] block mb-1">Account Role Classification</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2 px-3 text-xs font-mono font-bold border transition-all ${
                  role === 'teacher'
                    ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                    : 'bg-[#EFE9DD] text-[#141C2B]/70 border-[#141C2B]/15 hover:border-[#141C2B]'
                }`}
              >
                [ Teacher / Educator ]
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 text-xs font-mono font-bold border transition-all ${
                  role === 'student'
                    ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                    : 'bg-[#EFE9DD] text-[#141C2B]/70 border-[#141C2B]/15 hover:border-[#141C2B]'
                }`}
              >
                [ Student / Scholar ]
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mono-label text-[11px] block mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder={role === 'teacher' ? 'Dr. Anita Sharma' : 'Rohan Gupta'}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mono-label text-[11px] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder="you@school.edu"
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <label className="mono-label text-[11px] block mb-1">Passcode (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="w-full pl-9 pr-10 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-[#141C2B]/50 hover:text-[#141C2B] focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Institution */}
          <div>
            <label className="mono-label text-[11px] block mb-1">Affiliated Institution</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                placeholder="EduFlow Academy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-filled py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                <span>[ Creating Account... ]</span>
              </>
            ) : (
              <>
                <span>[ Register Account ]</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#141C2B]/10">
          <p className="text-xs font-mono text-[#141C2B]/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2C4A8F] hover:underline font-bold">
              [ Sign In ]
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// ===========================================================================
// FORGOT PASSWORD PAGE
// ===========================================================================
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full stationery-card p-8 border border-[#141C2B]/15 bg-[#E5DED0] space-y-6">

        <div className="text-center space-y-2 border-b border-[#141C2B]/10 pb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] mb-1">
            <KeyRound className="w-5 h-5 text-[#2C4A8F]" />
          </div>
          <h2 className="text-2xl font-serif text-[#141C2B] tracking-tight">Recovery <span className="italic text-[#2C4A8F]">Ledger</span></h2>
          <p className="text-xs font-mono text-[#141C2B]/70">Enter your email and we'll dispatch a cryptographic reset link</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-600/30 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 text-xs font-mono text-center flex flex-col items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
              <span className="font-bold">{message}</span>
              <span className="text-[#141C2B]/70">Check your inbox for password reset instructions.</span>
            </div>
            <Link to="/login" className="btn-filled block w-full py-2.5 px-4 text-xs font-mono font-bold text-center">
              [ Back to Sign In ]
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono-label text-[11px] block mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                  placeholder="you@school.edu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-filled py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                  <span>[ Dispatching Link... ]</span>
                </>
              ) : (
                <>
                  <span>[ Dispatch Reset Link ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-mono text-[#2C4A8F] hover:underline font-bold">
                [ ← Return to Sign In ]
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// ===========================================================================
// RESET PASSWORD PAGE
// ===========================================================================
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [supabaseRecovery, setSupabaseRecovery] = useState(false);

  React.useEffect(() => {
    async function initRecoverySession() {
      const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken && supabase) {
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError) {
            console.error('[ResetPassword] setSession error:', sessionError.message);
            setError(sessionError.message || 'Invalid or expired recovery link.');
          } else {
            setSupabaseRecovery(true);
          }
        } catch (err) {
          console.error('[ResetPassword] session init error:', err);
        }
      }
    }
    initRecoverySession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (supabaseRecovery && supabase) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage('Password reset successfully. You can now log in.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        const res = await resetPassword(token, password);
        setMessage(res.data.message);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full stationery-card p-8 border border-[#141C2B]/15 bg-[#E5DED0] space-y-6">

        <div className="text-center space-y-2 border-b border-[#141C2B]/10 pb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] mb-1">
            <KeyRound className="w-5 h-5 text-[#2C4A8F]" />
          </div>
          <h2 className="text-2xl font-serif text-[#141C2B] tracking-tight">Set New <span className="italic text-[#2C4A8F]">Passcode</span></h2>
          <p className="text-xs font-mono text-[#141C2B]/70">Enter a secure passcode (minimum 6 characters)</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-600/30 text-rose-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 text-xs font-mono text-center flex flex-col items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
            <span className="font-bold">{message}</span>
            <span className="text-[#141C2B]/70">Redirecting to platform login...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono-label text-[11px] block mb-1">New Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] disabled:opacity-50"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-2.5 text-[#141C2B]/50 hover:text-[#141C2B] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mono-label text-[11px] block mb-1">Confirm Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#141C2B]/50 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  className={`w-full pl-9 pr-4 py-2 bg-[#EFE9DD] border text-[#141C2B] text-xs font-mono focus:outline-none disabled:opacity-50 ${
                    confirm && confirm !== password
                      ? 'border-rose-600 focus:border-rose-600'
                      : 'border-[#141C2B]/20 focus:border-[#2C4A8F]'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs font-mono text-rose-800 mt-1">Passcodes do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirm && confirm !== password)}
              className="w-full btn-filled py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                  <span>[ Resetting... ]</span>
                </>
              ) : (
                <>
                  <span>[ Reset Passcode ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
