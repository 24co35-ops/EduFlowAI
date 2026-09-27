const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');
const { sendResetEmail } = require('../utils/mailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// In-memory fallback — used when Supabase is unconfigured or in offline demo mode.
// ---------------------------------------------------------------------------
const memoryUsers = [
  {
    id: 'demo-teacher-1',
    name: 'Anita Sharma',
    email: 'teacher@eduflow.ai',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'teacher',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  },
  {
    id: 'demo-student-1',
    name: 'Rohan Gupta',
    email: 'student@eduflow.ai',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  }
];

const memResetTokens = new Map();

// ponytail: unified JWT generator
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUserPayload = (user) => ({
  id: user.id,
  name: user.name || user.full_name,
  email: user.email,
  role: user.role,
  institution: user.institution || user.school,
  grade: user.grade
});

// ---------------------------------------------------------------------------
// REGISTER
// ---------------------------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, institution, grade } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const assignedRole = role === 'student' ? 'student' : 'teacher';

    // ---- Supabase path ----
    if (isSupabaseConfigured()) {
      // 1. Create auth user in Supabase
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true, // skip email confirmation for hackathon demo
        user_metadata: {
          full_name: name.trim(),
          role: assignedRole,
          institution: institution || 'EduFlow Academy',
          grade: grade || 'Class 10'
        }
      });

      if (signUpError) {
        const msg = signUpError.message || 'Registration failed.';
        const isDuplicate = msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate') || signUpError.status === 422;
        return res.status(isDuplicate ? 400 : 500).json({
          success: false,
          message: isDuplicate ? 'User with this email already exists.' : msg
        });
      }

      const userId = authData.user.id;

      // 2. Upsert into profiles table (non-fatal if table not created yet)
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: cleanEmail,
            full_name: name.trim(),
            role: assignedRole,
            institution: institution || 'EduFlow Academy',
            grade: grade || 'Class 10'
          }, { onConflict: 'id' });
      } catch (profileErr) {
        console.warn('[Register] Profile table note:', profileErr.message);
      }

      const newUser = { id: userId, name: name.trim(), email: cleanEmail, role: assignedRole, institution: institution || 'EduFlow Academy', grade: grade || 'Class 10' };
      const token = generateToken(newUser);

      return res.status(201).json({ success: true, token, user: safeUserPayload(newUser) });
    }

    // ---- In-memory fallback (when Supabase is unconfigured) ----
    const existingMem = memoryUsers.find(u => u.email === cleanEmail);
    if (existingMem) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newMemUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      institution: institution || 'EduFlow Academy',
      grade: grade || 'Class 10'
    };
    memoryUsers.push(newMemUser);

    const token = generateToken(newMemUser);
    return res.status(201).json({ success: true, token, user: safeUserPayload(newMemUser) });

  } catch (error) {
    console.error('[Register] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // ---- Supabase path ----
    if (isSupabaseConfigured()) {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) {
        // Auto-seed built-in demo accounts in Supabase if not yet provisioned
        const isTeacherDemo = cleanEmail === 'teacher@eduflow.ai' && password === 'teacher123';
        const isStudentDemo = cleanEmail === 'student@eduflow.ai' && password === 'student123';
        if (isTeacherDemo || isStudentDemo) {
          const demoRole = isTeacherDemo ? 'teacher' : 'student';
          const demoName = isTeacherDemo ? 'Anita Sharma' : 'Rohan Gupta';
          const { data: createdDemo, error: createError } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password,
            email_confirm: true,
            user_metadata: { full_name: demoName, role: demoRole, institution: 'Delhi Public School', grade: 'Class 10' }
          });
          if (!createError && createdDemo?.user) {
            const user = {
              id: createdDemo.user.id,
              name: demoName,
              email: cleanEmail,
              role: demoRole,
              institution: 'Delhi Public School',
              grade: 'Class 10'
            };
            const token = generateToken(user);
            return res.json({ success: true, token, user: safeUserPayload(user) });
          }
        }
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Fetch profile for role/name/institution
      let profile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role, institution, grade')
          .eq('id', authData.user.id)
          .single();
        profile = data;
      } catch (profileFetchErr) {
        // Fallback to user_metadata below
      }

      const user = {
        id: authData.user.id,
        name: profile?.full_name || authData.user.user_metadata?.full_name || cleanEmail,
        email: cleanEmail,
        role: profile?.role || authData.user.user_metadata?.role || 'teacher',
        institution: profile?.institution || authData.user.user_metadata?.institution || 'EduFlow Academy',
        grade: profile?.grade || authData.user.user_metadata?.grade || 'Class 10'
      };

      const token = generateToken(user);
      return res.json({ success: true, token, user: safeUserPayload(user) });
    }

    // ---- In-memory fallback (when Supabase is unconfigured) ----
    const foundUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(foundUser);
    return res.json({ success: true, token, user: safeUserPayload(foundUser) });

  } catch (error) {
    console.error('[Login] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Login failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET ME
// ---------------------------------------------------------------------------
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ---------------------------------------------------------------------------
// FORGOT PASSWORD
// ---------------------------------------------------------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const cleanEmail = String(email).trim().toLowerCase();

    if (isSupabaseConfigured()) {
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: cleanEmail,
        options: { redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password` }
      });
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // ---- In-memory fallback ----
    const memUser = memoryUsers.find(u => u.email === cleanEmail);
    if (memUser) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      memResetTokens.set(token, { email: cleanEmail, expiry });
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
      await sendResetEmail(cleanEmail, resetUrl);
    }

    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // ---- In-memory fallback only (Supabase reset is handled client-side via magic link) ----
    if (!isSupabaseConfigured()) {
      const entry = memResetTokens.get(token);
      if (!entry || entry.expiry < new Date()) {
        return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
      }
      const memUser = memoryUsers.find(u => u.email === entry.email);
      if (!memUser) return res.status(400).json({ success: false, message: 'User not found.' });
      memUser.passwordHash = await bcrypt.hash(password, 10);
      memResetTokens.delete(token);
    }

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[ResetPassword] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
