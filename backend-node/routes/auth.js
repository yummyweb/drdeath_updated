'use strict';
const logger   = require('../utils/logger');
const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const User     = require('../models/User');
const { hashPassword, verifyPassword, createToken, COOKIE_OPTIONS } = require('../utils/auth');
const { getCurrentUser } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');
const { validateEmail } = require('../utils/emailValidate');
const { sendOTP, sendPasswordReset } = require('../utils/mailer');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/auth/register', validate(schemas.register), async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ detail: 'Admin registration is not allowed through this endpoint.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ detail: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters' });
    }

    const emailCheck = await validateEmail(email);
    if (!emailCheck.ok) {
      return res.status(400).json({ detail: emailCheck.reason });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const otp        = generateOTP();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
      phone,
      role: 'user',
      email_verified: false,
      otp,
      otp_expires,
    });

    // Send OTP — non-blocking; account created regardless
    await sendOTP(user.email, user.full_name, otp);

    const token = createToken(user.id, user.email, user.role);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      access_token:    token,
      token_type:      'bearer',
      email_verified:  false,
      user:            user.toJSON(),
    });
  } catch (error) {
    logger.error({ err: error }, 'Register error');
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
router.post('/auth/verify-otp', getCurrentUser, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ detail: 'OTP is required' });

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ detail: 'User not found' });

    if (user.email_verified) {
      return res.json({ message: 'Email already verified' });
    }

    if (!user.otp || !user.otp_expires) {
      return res.status(400).json({ detail: 'No OTP found. Please request a new one.' });
    }

    if (new Date() > user.otp_expires) {
      return res.status(400).json({ detail: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).json({ detail: 'Incorrect OTP' });
    }

    user.email_verified = true;
    user.otp            = null;
    user.otp_expires    = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Verify OTP error');
    res.status(500).json({ detail: 'Verification failed' });
  }
});

// ── Resend OTP ────────────────────────────────────────────────────────────────
router.post('/auth/resend-otp', getCurrentUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ detail: 'User not found' });
    if (user.email_verified) return res.json({ message: 'Email already verified' });

    const otp         = generateOTP();
    user.otp          = otp;
    user.otp_expires  = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(user.email, user.full_name, otp);
    res.json({ message: 'OTP sent' });
  } catch (error) {
    logger.error({ err: error }, 'Resend OTP error');
    res.status(500).json({ detail: 'Failed to resend OTP' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ detail: 'Invalid credentials' });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return res.status(401).json({ detail: 'Invalid credentials' });

    const token = createToken(user.id, user.email, user.role);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      access_token:   token,
      token_type:     'bearer',
      email_verified: user.email_verified,
      user:           user.toJSON(),
    });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(500).json({ detail: 'Login failed' });
  }
});

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ detail: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same response — don't reveal whether email exists
    const SAFE_MSG = 'If that email is registered, a reset link has been sent.';

    if (!user) return res.json({ message: SAFE_MSG });

    const token         = crypto.randomBytes(32).toString('hex');
    user.reset_token         = token;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordReset(user.email, user.full_name, token);
    res.json({ message: SAFE_MSG });
  } catch (error) {
    logger.error({ err: error }, 'Forgot password error');
    res.status(500).json({ detail: 'Failed to process request' });
  }
});

// ── Reset password ────────────────────────────────────────────────────────────
router.post('/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      reset_token:         req.params.token,
      reset_token_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ detail: 'Reset link is invalid or has expired' });
    }

    user.password            = await hashPassword(password);
    user.reset_token         = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    logger.error({ err: error }, 'Reset password error');
    res.status(500).json({ detail: 'Failed to reset password' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/auth/logout', (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/auth/me', getCurrentUser, (req, res) => {
  res.json(req.user);
});

module.exports = router;
