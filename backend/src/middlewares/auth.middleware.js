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

module.exports = {
  verifyAuth
};
