const logger = require('../utils/logger');
'use strict';

const express    = require('express');
const router     = express.Router();
const Researcher = require('../models/Researcher');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: register ──────────────────────────────────────────────────────────
router.post('/researchers/register', validate(schemas.researcher), async (req, res) => {
  try {
    const {
      full_name, email, phone,
      researcher_type, institution, department, designation, qualification, orcid,
      research_domains, experience_years,
      city, state,
      biography, current_research, publications,
      website, linkedin, google_scholar, researchgate, languages,
      areas_of_interest, how_can_help, open_to_collaborate,
    } = req.body;

    if (!full_name?.trim())    return res.status(400).json({ error: 'full_name is required' });
    if (!email?.trim())        return res.status(400).json({ error: 'email is required' });
    if (!how_can_help?.trim()) return res.status(400).json({ error: 'how_can_help is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

    const existing = await Researcher.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'A registration with this email already exists' });

    const researcher = await Researcher.create({
      full_name:          full_name.trim(),
      email:              email.toLowerCase().trim(),
      phone:              phone?.trim(),
      researcher_type,
      institution:        institution?.trim(),
      department:         department?.trim(),
      designation:        designation?.trim(),
      qualification:      qualification?.trim(),
      orcid:              orcid?.trim(),
      research_domains:   Array.isArray(research_domains) ? research_domains : [],
      experience_years:   experience_years !== undefined && experience_years !== '' ? Number(experience_years) : undefined,
      city:               city?.trim(),
      state:              state?.trim(),
      biography:          biography?.trim(),
      current_research:   current_research?.trim(),
      publications:       publications?.trim(),
      website:            website?.trim(),
      linkedin:           linkedin?.trim(),
      google_scholar:     google_scholar?.trim(),
      researchgate:       researchgate?.trim(),
      languages:          Array.isArray(languages) && languages.length ? languages : ['English'],
      areas_of_interest:  Array.isArray(areas_of_interest) ? areas_of_interest : [],
      how_can_help:       how_can_help.trim(),
      open_to_collaborate: open_to_collaborate !== false,
    });

    res.status(201).json({ message: 'Registration submitted. Our team will review your profile.', id: researcher._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A registration with this email already exists' });
    logger.error({ err: err }, 'Researcher registration error:');
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// ── Public: approved directory ────────────────────────────────────────────────
router.get('/researchers', async (req, res) => {
  try {
    const { domain, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const query = { status: 'approved' };
    if (domain) query.research_domains = domain;
    if (search) query.full_name        = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Researcher.find(query)
        .sort({ featured: -1, verified: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit)
        .select('-email -phone -admin_notes -how_can_help')
        .lean(),
      Researcher.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch researchers' });
  }
});

// ── Admin: list all ───────────────────────────────────────────────────────────
router.get('/admin/researchers', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, page: p = 1, limit: l = 50 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(100, parseInt(l));

    const query = {};
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Researcher.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Researcher.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch researchers' });
  }
});

// ── Admin: moderate ───────────────────────────────────────────────────────────
router.put('/admin/researchers/:id/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const r = await Researcher.findByIdAndUpdate(
      req.params.id,
      { status, ...(admin_notes !== undefined && { admin_notes: admin_notes.trim() }) },
      { new: true }
    );
    if (!r) return res.status(404).json({ error: 'Researcher not found' });
    res.json(r);
  } catch {
    res.status(500).json({ error: 'Failed to moderate' });
  }
});

// ── Admin: verify toggle ──────────────────────────────────────────────────────
router.put('/admin/researchers/:id/verify', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const r = await Researcher.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Researcher not found' });
    r.verified = !r.verified;
    await r.save();
    res.json({ verified: r.verified });
  } catch {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── Admin: feature toggle ─────────────────────────────────────────────────────
router.put('/admin/researchers/:id/feature', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const r = await Researcher.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Researcher not found' });
    r.featured = !r.featured;
    await r.save();
    res.json({ featured: r.featured });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/researchers/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const r = await Researcher.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Researcher not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
