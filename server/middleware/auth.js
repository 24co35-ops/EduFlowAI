const jwt = require('jsonwebtoken');

// Supabase signs access tokens with the project JWT secret.
// Keep JWT_SECRET pointing at the Supabase JWT secret (same value as in .env).
// ponytail: one verify path handles both our custom tokens (login/register) and Supabase access tokens
const JWT_SECRET = process.env.JWT_SECRET || 'eduflow_auth_secret_key_hackathon_2026';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[Auth] JWT_SECRET not set. Using fallback — set SUPABASE JWT secret in Vercel env vars.');
}

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || null);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Supabase token shape: { sub, email, role (db role), user_metadata, app_metadata }
    // Our custom token shape: { id, email, role, name }
    // Normalise to a single shape controllers expect.
    req.user = {
      id:          decoded.id   || decoded.sub,
      email:       decoded.email,
      role:        decoded.role === 'authenticated'
                     ? (decoded.app_metadata?.role || decoded.user_metadata?.role || 'teacher')
                     : decoded.role,
      name:        decoded.name || decoded.user_metadata?.full_name || decoded.email,
      institution: decoded.institution || decoded.user_metadata?.institution || 'EduFlow Academy',
      grade:       decoded.grade || decoded.user_metadata?.grade || 'Class 10'
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user?.role || 'none'}' is not authorized for this action.`
    });
  }
  next();
};

module.exports = { protect, requireRole, JWT_SECRET };

