const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

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

