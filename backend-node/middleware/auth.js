const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'legal-guardian-secret-key-change-in-production';

// Get current user from token
const getCurrentUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.substring(7);
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

// Get optional user (for guest checkout)
const getOptionalUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ id: decoded.user_id });
    req.user = user ? user.toJSON() : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

module.exports = {
  getCurrentUser,
  getOptionalUser,
  requireAdmin
};

