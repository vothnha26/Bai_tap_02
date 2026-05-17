const jwtUtils = require('../utils/jwt.utils');

const verifyAuth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || jwtUtils.extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid or expired token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = {
  verifyAuth,
  verifyAdmin
};
