const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendResetEmail } = require('../utils/mailer');

// In-memory reset token store for demo mode (when MongoDB is not connected)
// Map<token, { email, expiry }>
const memResetTokens = new Map();

// ponytail: email regex standard validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Memory store fallback for demo mode
const memoryUsers = [
  {
    _id: 'demo-teacher-1',
    name: 'Anita Sharma',
    email: 'teacher@eduflow.ai',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'teacher',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  },
  {
    _id: 'demo-student-1',
    name: 'Rohan Gupta',
    email: 'student@eduflow.ai',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  }
];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, institution, grade } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const assignedRole = role === 'student' ? 'student' : 'teacher';
    const passwordHash = await bcrypt.hash(password, 10);

    if (getIsConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        institution: institution || 'EduFlow Academy',
        grade: grade || 'Class 10'
      });

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          institution: newUser.institution,
          grade: newUser.grade
        }
      });
    }

    // In-memory fallback (only when MongoDB is not connected)
    const existingMem = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingMem) {
      return res.status(400).json({ success: false, message: 'User already exists in demo storage' });
    }

    const newMemUser = {
      _id: 'user-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      institution: institution || 'EduFlow Academy',
      grade: grade || 'Class 10'
    };
    memoryUsers.push(newMemUser);

    const token = generateToken(newMemUser);
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newMemUser._id,
        name: newMemUser.name,
        email: newMemUser.email,
        role: newMemUser.role,
        institution: newMemUser.institution,
        grade: newMemUser.grade
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let foundUser = null;

    if (getIsConnected()) {
      foundUser = await User.findOne({ email: cleanEmail });
    } else {
      // In-memory lookup only in offline/demo mode
      foundUser = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(foundUser);
    return res.json({
      success: true,
      token,
      user: {
        id: foundUser._id || foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        institution: foundUser.institution,
        grade: foundUser.grade
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    if (getIsConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();
        await sendResetEmail(cleanEmail, resetUrl);
      }
    } else {
      const memUser = memoryUsers.find(u => u.email === cleanEmail);
      if (memUser) {
        memResetTokens.set(token, { email: cleanEmail, expiry });
        await sendResetEmail(cleanEmail, resetUrl);
      }
    }

    // Always return success to avoid user enumeration
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (getIsConnected()) {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      });
      if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
      user.passwordHash = passwordHash;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
    } else {
      const entry = memResetTokens.get(token);
      if (!entry || entry.expiry < new Date()) {
        return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
      }
      const memUser = memoryUsers.find(u => u.email === entry.email);
      if (!memUser) return res.status(400).json({ success: false, message: 'User not found' });
      memUser.passwordHash = passwordHash;
      memResetTokens.delete(token);
    }

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

