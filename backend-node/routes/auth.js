const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hashPassword, verifyPassword, createToken } = require('../utils/auth');
const { getCurrentUser } = require('../middleware/auth');

// Register (USER ONLY - Admin registration is disabled for security)
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // SECURITY: Explicitly prevent admin role assignment via registration
    // Admin users must be created using the secure CLI script: node scripts/create-admin.js
    if (role && role === 'admin') {
      return res.status(403).json({ 
        detail: 'Admin registration is not allowed through this endpoint. Please contact the system administrator.' 
      });
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    
    // Force role to 'user' - never allow admin creation through registration
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: 'user' // Always 'user' - never 'admin'
    });

    const token = createToken(user.id, user.email, user.role);

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const token = createToken(user.id, user.email, user.role);

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

// Get current user
router.get('/auth/me', getCurrentUser, (req, res) => {
  res.json(req.user);
});

module.exports = router;

