const logger = require('../utils/logger');
'use strict';

const express  = require('express');
const router   = express.Router();
const Advocate = require('../models/Advocate');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: register ──────────────────────────────────────────────────────────
router.post('/advocates/register', validate(schemas.advocate), async (req, res) => {
  try {
    const {
      full_name, email, phone,
      bar_council_number, bar_council_state,
      specializations, court_types, experience_years,
      areas_of_operation, city, state,
      about, biography, linkedin, website, languages,
    } = req.body;

    if (!full_name?.trim())           return res.status(400).json({ error: 'full_name is required' });
    if (!email?.trim())               return res.status(400).json({ error: 'email is required' });
    if (!phone?.trim())               return res.status(400).json({ error: 'phone is required' });
    if (!bar_council_number?.trim())  return res.status(400).json({ error: 'bar_council_number is required' });
    if (!specializations?.length)     return res.status(400).json({ error: 'At least one specialization is required' });
    if (experience_years === undefined || experience_years === '') return res.status(400).json({ error: 'experience_years is required' });
    if (!areas_of_operation?.length)  return res.status(400).json({ error: 'At least one area of operation is required' });
    if (!about?.trim())               return res.status(400).json({ error: 'about is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

    const [existingEmail, existingBar] = await Promise.all([
      Advocate.findOne({ email: email.toLowerCase().trim() }),
      Advocate.findOne({ bar_council_number: bar_council_number.trim() }),
    ]);
    if (existingEmail) return res.status(409).json({ error: 'An advocate with this email is already registered' });
    if (existingBar)   return res.status(409).json({ error: 'This Bar Council number is already registered' });

    const advocate = await Advocate.create({
      full_name:          full_name.trim(),
      email:              email.toLowerCase().trim(),
      phone:              phone.trim(),
      bar_council_number: bar_council_number.trim(),
      bar_council_state:  bar_council_state?.trim(),
      specializations:    Array.isArray(specializations) ? specializations : [specializations],
      court_types:        Array.isArray(court_types) ? court_types : [],
      experience_years:   Number(experience_years),
      areas_of_operation: Array.isArray(areas_of_operation) ? areas_of_operation : [areas_of_operation],
      city:               city?.trim(),
      state:              state?.trim(),
      about:              about.trim(),
      biography:          biography?.trim(),
      linkedin:           linkedin?.trim(),
      website:            website?.trim(),
      languages:          Array.isArray(languages) && languages.length ? languages : ['English', 'Hindi'],
    });

    res.status(201).json({ message: 'Registration submitted. Our team will review your profile.', id: advocate.id });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({ error: `${field === 'bar_council_number' ? 'Bar Council number' : 'Email'} already registered` });
    }
    logger.error({ err: err }, 'Register advocate error:');
    res.status(500).json({ error: 'Failed to register advocate' });
  }
});

// ── Public: approved directory ────────────────────────────────────────────────
router.get('/advocates', async (req, res) => {
  try {
    const { location, city, specialization, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const query = { status: 'approved' };
    if (location)       query.state            = { $regex: location, $options: 'i' };
    if (city)           query.city             = { $regex: city, $options: 'i' };
    if (specialization) query.specializations  = { $regex: specialization, $options: 'i' };
    if (search) {
      query.$or = [
        { full_name:          { $regex: search, $options: 'i' } },
        { about:              { $regex: search, $options: 'i' } },
        { areas_of_operation: { $regex: search, $options: 'i' } },
        { city:               { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Advocate.find(query)
        .sort({ featured: -1, verified: -1, full_name: 1 })
        .skip((page - 1) * limit).limit(limit)
        .select('-password -admin_notes -bar_council_number')
        .lean(),
      Advocate.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error({ err: err }, 'Get advocates error:');
    res.status(500).json({ error: 'Failed to fetch advocates' });
  }
});

// ── Self: update own profile (by email match) ─────────────────────────────────
router.put('/advocates/me', getCurrentUser, async (req, res) => {
  try {
    const advocate = await Advocate.findOne({ email: req.user.email });
    if (!advocate) return res.status(404).json({ error: 'Advocate profile not found for your account' });

    const allowed = ['full_name','phone','specializations','court_types','experience_years',
      'areas_of_operation','city','state','about','biography','linkedin','website','languages',
      'bar_council_state'];
    allowed.forEach(f => { if (req.body[f] !== undefined) advocate[f] = req.body[f]; });

    // Allow updating bar_council_number only if not already taken by someone else
    if (req.body.bar_council_number && req.body.bar_council_number !== advocate.bar_council_number) {
      const taken = await Advocate.findOne({ bar_council_number: req.body.bar_council_number.trim(), _id: { $ne: advocate._id } });
      if (taken) return res.status(409).json({ error: 'That Bar Council number is already registered to another advocate' });
      advocate.bar_council_number = req.body.bar_council_number.trim();
    }

    await advocate.save();
    res.json(advocate);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// ── Public: single advocate ───────────────────────────────────────────────────
router.get('/advocates/:advocateId', async (req, res) => {
  try {
    const advocate = await Advocate.findOne({ id: req.params.advocateId, status: 'approved' })
      .select('-password -admin_notes -bar_council_number')
      .lean();
    if (!advocate) return res.status(404).json({ error: 'Advocate not found' });
    res.json(advocate);
  } catch {
    res.status(500).json({ error: 'Failed to fetch advocate' });
  }
});

// ── Admin: verify toggle ──────────────────────────────────────────────────────
router.put('/admin/advocates/:id/verify', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const advocate = await Advocate.findById(req.params.id);
    if (!advocate) return res.status(404).json({ error: 'Advocate not found' });
    advocate.verified = !advocate.verified;
    await advocate.save();
    res.json({ verified: advocate.verified });
  } catch {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── Admin: feature toggle ─────────────────────────────────────────────────────
router.put('/admin/advocates/:id/feature', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const advocate = await Advocate.findById(req.params.id);
    if (!advocate) return res.status(404).json({ error: 'Advocate not found' });
    advocate.featured = !advocate.featured;
    await advocate.save();
    res.json({ featured: advocate.featured });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/advocates/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const advocate = await Advocate.findByIdAndDelete(req.params.id);
    if (!advocate) return res.status(404).json({ error: 'Advocate not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
