const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../utils/auth');

// Extracts token from httpOnly cookie first, then Authorization header (backward compat)
function extractToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.substring(7);
  return null;
}

const getCurrentUser = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: decoded.user_id });
    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ detail: 'Invalid token' });
    }
    return res.status(401).json({ detail: 'Authentication failed' });
  }
};

const getOptionalUser = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: decoded.user_id });
    req.user = user ? user.toJSON() : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

module.exports = { getCurrentUser, getOptionalUser, requireAdmin };
