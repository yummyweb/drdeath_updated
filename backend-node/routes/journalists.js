const logger = require('../utils/logger');
'use strict';

const express    = require('express');
const router     = express.Router();
const Journalist = require('../models/Journalist');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: register ──────────────────────────────────────────────────────────
router.post('/journalists/register', validate(schemas.journalist), async (req, res) => {
  try {
    const {
      full_name, email, phone,
      publication, designation, press_card_number,
      beats, medium, experience_years,
      city, state,
      biography, notable_work, languages,
      website, linkedin, twitter,
      areas_of_interest, how_can_help,
    } = req.body;

    if (!full_name?.trim())    return res.status(400).json({ error: 'full_name is required' });
    if (!email?.trim())        return res.status(400).json({ error: 'email is required' });
    if (!how_can_help?.trim()) return res.status(400).json({ error: 'how_can_help is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

    const existing = await Journalist.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'A registration with this email already exists' });

    const journalist = await Journalist.create({
      full_name:         full_name.trim(),
      email:             email.toLowerCase().trim(),
      phone:             phone?.trim(),
      publication:       publication?.trim(),
      designation:       designation?.trim(),
      press_card_number: press_card_number?.trim(),
      beats:             Array.isArray(beats) ? beats : [],
      medium:            Array.isArray(medium) ? medium : [],
      experience_years:  experience_years !== undefined && experience_years !== '' ? Number(experience_years) : undefined,
      city:              city?.trim(),
      state:             state?.trim(),
      biography:         biography?.trim(),
      notable_work:      notable_work?.trim(),
      languages:         Array.isArray(languages) && languages.length ? languages : ['English'],
      website:           website?.trim(),
      linkedin:          linkedin?.trim(),
      twitter:           twitter?.trim(),
      areas_of_interest: Array.isArray(areas_of_interest) ? areas_of_interest : [],
      how_can_help:      how_can_help.trim(),
    });

    res.status(201).json({ message: 'Registration submitted. Our team will review your profile.', id: journalist._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A registration with this email already exists' });
    logger.error({ err: err }, 'Journalist registration error:');
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// ── Public: approved directory ────────────────────────────────────────────────
router.get('/journalists', async (req, res) => {
  try {
    const { beat, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const query = { status: 'approved' };
    if (beat)   query.beats    = beat;
    if (search) query.full_name = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Journalist.find(query)
        .sort({ featured: -1, verified: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit)
        .select('-email -phone -admin_notes -press_card_number -how_can_help')
        .lean(),
      Journalist.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch journalists' });
  }
});

// ── Admin: list all ───────────────────────────────────────────────────────────
router.get('/admin/journalists', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, page: p = 1, limit: l = 50 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(100, parseInt(l));

    const query = {};
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Journalist.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Journalist.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch journalists' });
  }
});

// ── Admin: moderate ───────────────────────────────────────────────────────────
router.put('/admin/journalists/:id/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const j = await Journalist.findByIdAndUpdate(
      req.params.id,
      { status, ...(admin_notes !== undefined && { admin_notes: admin_notes.trim() }) },
      { new: true }
    );
    if (!j) return res.status(404).json({ error: 'Journalist not found' });
    res.json(j);
  } catch {
    res.status(500).json({ error: 'Failed to moderate' });
  }
});

// ── Admin: verify toggle ──────────────────────────────────────────────────────
router.put('/admin/journalists/:id/verify', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const j = await Journalist.findById(req.params.id);
    if (!j) return res.status(404).json({ error: 'Journalist not found' });
    j.verified = !j.verified;
    await j.save();
    res.json({ verified: j.verified });
  } catch {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── Admin: feature toggle ─────────────────────────────────────────────────────
router.put('/admin/journalists/:id/feature', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const j = await Journalist.findById(req.params.id);
    if (!j) return res.status(404).json({ error: 'Journalist not found' });
    j.featured = !j.featured;
    await j.save();
    res.json({ featured: j.featured });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/journalists/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const j = await Journalist.findByIdAndDelete(req.params.id);
    if (!j) return res.status(404).json({ error: 'Journalist not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
