const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow_super_secret_jwt_key_2026_ibm_hackathon';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // If token verify fails, fallback to default user for seamless demo UX
    }
  }

  // Default fallback user for demo / Clerk authentication
  req.user = {
    id: 'demo-teacher-1',
    _id: 'demo-teacher-1',
    name: 'Anita Sharma',
    email: 'teacher@eduflow.ai',
    role: 'teacher',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  };
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user ? req.user.role : 'none'}' is not authorized for this action.`
      });
    }
    next();
  };
};

module.exports = { protect, requireRole, JWT_SECRET };
