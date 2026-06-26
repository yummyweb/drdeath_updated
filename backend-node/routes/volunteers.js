const logger = require('../utils/logger');
'use strict';

const express  = require('express');
const router   = express.Router();
const Volunteer = require('../models/Volunteer');
const { VOLUNTEER_CATEGORIES } = require('../models/Volunteer');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: submit volunteer registration ─────────────────────────────────────
router.post('/volunteers', async (req, res) => {
  try {
    const {
      full_name, email, phone, city, state,
      category, profession, institution, experience_years,
      skills, languages, availability,
      biography, linkedin, website,
      areas_of_interest, how_can_help,
    } = req.body;

    if (!full_name?.trim())    return res.status(400).json({ error: 'full_name is required' });
    if (!email?.trim())        return res.status(400).json({ error: 'email is required' });
    if (!category)             return res.status(400).json({ error: 'category is required' });
    if (!how_can_help?.trim()) return res.status(400).json({ error: 'how_can_help is required' });
    if (!VOLUNTEER_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category` });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existing = await Volunteer.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'An application with this email already exists' });

    const volunteer = await Volunteer.create({
      full_name:        full_name.trim(),
      email:            email.toLowerCase().trim(),
      phone:            phone?.trim(),
      city:             city?.trim(),
      state:            state?.trim(),
      category,
      profession:       profession?.trim(),
      institution:      institution?.trim(),
      experience_years: experience_years ? Number(experience_years) : undefined,
      skills:           Array.isArray(skills) ? skills.map(s => s.trim()).filter(Boolean) : [],
      languages:        Array.isArray(languages) ? languages.map(l => l.trim()).filter(Boolean) : [],
      availability:     availability || 'occasional',
      biography:        biography?.trim(),
      linkedin:         linkedin?.trim(),
      website:          website?.trim(),
      areas_of_interest: Array.isArray(areas_of_interest) ? areas_of_interest : [],
      how_can_help:     how_can_help.trim(),
    });

    res.status(201).json({ message: 'Registration submitted successfully', id: volunteer._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'An application with this email already exists' });
    logger.error({ err: err }, 'Volunteer registration error:');
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// ── Public: approved volunteer directory ──────────────────────────────────────
router.get('/volunteers', async (req, res) => {
  try {
    const { category, skill, language, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const query = { status: 'approved' };
    if (category) query.category  = category;
    if (skill)    query.skills    = skill;
    if (language) query.languages = language;
    if (search)   query.full_name = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Volunteer.find(query)
        .sort({ featured: -1, verified: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit)
        .select('-email -phone -admin_notes -how_can_help')
        .lean(),
      Volunteer.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// ── Admin: list all volunteers ────────────────────────────────────────────────
router.get('/admin/volunteers', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, category, page: p = 1, limit: l = 50 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(100, parseInt(l));

    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;

    const [data, total] = await Promise.all([
      Volunteer.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Volunteer.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// ── Admin: moderate ───────────────────────────────────────────────────────────
router.put('/admin/volunteers/:id/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status, ...(admin_notes !== undefined && { admin_notes: admin_notes.trim() }) },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch {
    res.status(500).json({ error: 'Failed to moderate volunteer' });
  }
});

// ── Admin: verify / unverify ──────────────────────────────────────────────────
router.put('/admin/volunteers/:id/verify', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    volunteer.verified = !volunteer.verified;
    await volunteer.save();
    res.json({ verified: volunteer.verified });
  } catch {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── Admin: toggle featured ────────────────────────────────────────────────────
router.put('/admin/volunteers/:id/feature', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    volunteer.featured = !volunteer.featured;
    await volunteer.save();
    res.json({ featured: volunteer.featured });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/volunteers/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

module.exports = router;
