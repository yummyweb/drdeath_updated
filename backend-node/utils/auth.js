const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'legal-guardian-secret-key-change-in-production';
const JWT_EXPIRATION_HOURS = 24;

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Verify password
const verifyPassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

// Create JWT token
const createToken = (userId, email, role) => {
  const payload = {
    user_id: userId,
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + (JWT_EXPIRATION_HOURS * 3600)
  };
  return jwt.sign(payload, JWT_SECRET);
};

module.exports = {
  hashPassword,
  verifyPassword,
  createToken
};

