const jwt = require('jsonwebtoken');

// In production, JWT_SECRET MUST be set explicitly — no fallback allowed.
// In development, fall back to a local-only demo key.
let JWT_SECRET;
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      '[Auth] CRITICAL: JWT_SECRET environment variable is not set. ' +
      'The application cannot start in production without a secure JWT secret.'
    );
  }
  JWT_SECRET = process.env.JWT_SECRET;
} else {
  JWT_SECRET = process.env.JWT_SECRET || 'eduflow_dev_only_jwt_secret_not_for_production';
}

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
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
