const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_EXPIRATION_HOURS = 24;

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  maxAge: JWT_EXPIRATION_HOURS * 60 * 60 * 1000,
  path: '/'
};

const hashPassword = async (password) => bcrypt.hash(password, 12);

const verifyPassword = async (password, hashed) => bcrypt.compare(password, hashed);

const createToken = (userId, email, role) => {
  return jwt.sign(
    {
      user_id: userId,
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_HOURS * 3600
    },
    JWT_SECRET
  );
};

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  COOKIE_OPTIONS,
  JWT_SECRET
};
