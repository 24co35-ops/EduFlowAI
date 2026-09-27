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
    id: 'd0000000-0000-4000-a000-000000000001',
    name: 'Anita Sharma',
    email: 'teacher@eduflow.ai',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'teacher',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  },
  {
    id: 'd0000000-0000-4000-a000-000000000002',
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
    // TEMP DEBUG
    console.log('[Register] Using backend:', isSupabaseConfigured() ? 'Supabase' : 'IN-MEMORY (not persistent!)');
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
      id: crypto.randomUUID(),
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
    // TEMP DEBUG
    console.log('[Login] Using backend:', isSupabaseConfigured() ? 'Supabase' : 'IN-MEMORY (not persistent!)');
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Unconditionally reliable check for hardcoded demo credentials first
    const isTeacherDemo = cleanEmail === 'teacher@eduflow.ai' && password === 'teacher123';
    const isStudentDemo = cleanEmail === 'student@eduflow.ai' && password === 'student123';

    if (isTeacherDemo || isStudentDemo) {
      const demoUser = memoryUsers.find(u => u.email === cleanEmail);
      if (demoUser) {
        if (role && demoUser.role !== role) {
          return res.status(403).json({
            success: false,
            message: `This account is registered as a ${demoUser.role}, not a ${role}. Please use the correct sign-in option.`
          });
        }
        const token = generateToken(demoUser);
        return res.json({ success: true, token, user: safeUserPayload(demoUser) });
      }
    }

    // 2. Supabase path for real/registered accounts
    if (isSupabaseConfigured()) {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) {
        console.error('[Login] Supabase signInWithPassword error:', signInError.message, 'Status:', signInError.status || 401, signInError);
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

      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as a ${user.role}, not a ${role}. Please use the correct sign-in option.`
        });
      }

      const token = generateToken(user);
      return res.json({ success: true, token, user: safeUserPayload(user) });
    }

    // 3. In-memory fallback (when Supabase is unconfigured)
    const foundUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (role && foundUser.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${foundUser.role}, not a ${role}. Please use the correct sign-in option.`
      });
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
      console.log('[ForgotPassword] Calling generateLink for:', cleanEmail);
      const { data, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: cleanEmail,
        options: { redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password` }
      });
      console.log('[ForgotPassword] generateLink result:', JSON.stringify({ data, error: linkError }));
      if (linkError) {
        console.error('[ForgotPassword] Supabase generateLink error:', linkError.message, linkError);
      } else if (data?.properties?.action_link) {
        const actionLink = data.properties.action_link;
        console.log('[ForgotPassword] Calling sendResetEmail with link:', actionLink);
        try {
          await sendResetEmail(cleanEmail, actionLink);
          console.log('[ForgotPassword] sendResetEmail completed successfully');
        } catch (mailErr) {
          console.error('[ForgotPassword] sendResetEmail failed:', mailErr);
        }
      }
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

// ---------------------------------------------------------------------------
// DEBUG EMAIL TEST — TEMPORARY, remove after diagnosing the email issue
// ---------------------------------------------------------------------------
exports.debugEmailTest = async (req, res) => {
  const resendKey = process.env.RESEND_API_KEY;
  console.log('[DebugEmail] RESEND_API_KEY:', resendKey ? `SET (${resendKey.slice(0, 4)}...)` : 'NOT SET');
  console.log('[DebugEmail] SMTP_FROM:', process.env.SMTP_FROM || 'NOT SET');

  const to = req.query.to;
  if (!to) {
    return res.status(400).json({ success: false, message: 'Pass ?to=your@email.com to test.' });
  }

  try {
    await sendResetEmail(to, 'https://example.com/test-reset-link');
    return res.json({ success: true, message: 'Email sent — check inbox and Resend activity logs.' });
  } catch (error) {
    console.error('[DebugEmail] sendResetEmail failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      name: error.name,
      stack: error.stack
    });
  }
};
