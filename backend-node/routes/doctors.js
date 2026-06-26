const logger = require('../utils/logger');
'use strict';

const express = require('express');
const router  = express.Router();
const Doctor  = require('../models/Doctor');
const { SPECIALIZATIONS } = require('../models/Doctor');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: register ──────────────────────────────────────────────────────────
router.post('/doctors/register', validate(schemas.doctor), async (req, res) => {
  try {
    const {
      full_name, email, phone,
      qualification, medical_council_reg, medical_council_state,
      specialization, sub_specialization, experience_years,
      hospital, clinic, city, state,
      research_interests, publications, orcid,
      biography, languages, website, linkedin, availability,
      consent_not_reviewer,
    } = req.body;

    if (!full_name?.trim())          return res.status(400).json({ error: 'full_name is required' });
    if (!email?.trim())              return res.status(400).json({ error: 'email is required' });
    if (!qualification?.trim())      return res.status(400).json({ error: 'qualification is required' });
    if (!medical_council_reg?.trim())return res.status(400).json({ error: 'medical_council_reg is required' });
    if (!specialization)             return res.status(400).json({ error: 'specialization is required' });
    if (!SPECIALIZATIONS.includes(specialization)) return res.status(400).json({ error: 'Invalid specialization' });
    if (experience_years === undefined || experience_years === '') return res.status(400).json({ error: 'experience_years is required' });
    if (!consent_not_reviewer)       return res.status(400).json({ error: 'You must confirm you are not registering as a hospital reviewer' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

    const existing = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'A registration with this email already exists' });

    const doctor = await Doctor.create({
      full_name: full_name.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phone?.trim(),
      qualification:         qualification.trim(),
      medical_council_reg:   medical_council_reg.trim(),
      medical_council_state: medical_council_state?.trim(),
      specialization,
      sub_specialization:    sub_specialization?.trim(),
      experience_years:      Number(experience_years),
      hospital:   hospital?.trim(),
      clinic:     clinic?.trim(),
      city:       city?.trim(),
      state:      state?.trim(),
      research_interests: Array.isArray(research_interests)
        ? research_interests.map(r => r.trim()).filter(Boolean) : [],
      publications: publications?.trim(),
      orcid:        orcid?.trim(),
      biography:    biography?.trim(),
      languages:    Array.isArray(languages) ? languages : ['English'],
      website:      website?.trim(),
      linkedin:     linkedin?.trim(),
      availability: availability || 'available',
      consent_not_reviewer: Boolean(consent_not_reviewer),
    });

    res.status(201).json({ message: 'Registration submitted. Our team will review your profile.', id: doctor._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A registration with this email already exists' });
    logger.error({ err: err }, 'Doctor registration error:');
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// ── Public: approved doctor directory ────────────────────────────────────────
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, city, state, language, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const query = { status: 'approved' };
    if (specialization) query.specialization = specialization;
    if (city)           query.city           = { $regex: city, $options: 'i' };
    if (state)          query.state          = { $regex: state, $options: 'i' };
    if (language)       query.languages      = language;
    if (search)         query.full_name      = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Doctor.find(query)
        .sort({ featured: -1, verified: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit)
        .select('-email -phone -admin_notes -medical_council_reg -consent_not_reviewer')
        .lean(),
      Doctor.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// ── Public: single doctor profile ────────────────────────────────────────────
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, status: 'approved' })
      .select('-email -phone -admin_notes -medical_council_reg -consent_not_reviewer')
      .lean();
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// ── Admin: list all ───────────────────────────────────────────────────────────
router.get('/admin/doctors', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, specialization, page: p = 1, limit: l = 50 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(100, parseInt(l));

    const query = {};
    if (status)         query.status         = status;
    if (specialization) query.specialization = specialization;

    const [data, total] = await Promise.all([
      Doctor.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Doctor.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// ── Admin: moderate ───────────────────────────────────────────────────────────
router.put('/admin/doctors/:id/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status, ...(admin_notes !== undefined && { admin_notes: admin_notes.trim() }) },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch {
    res.status(500).json({ error: 'Failed to moderate' });
  }
});

// ── Admin: verify toggle ──────────────────────────────────────────────────────
router.put('/admin/doctors/:id/verify', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    doctor.verified = !doctor.verified;
    await doctor.save();
    res.json({ verified: doctor.verified });
  } catch {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── Admin: feature toggle ─────────────────────────────────────────────────────
router.put('/admin/doctors/:id/feature', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    doctor.featured = !doctor.featured;
    await doctor.save();
    res.json({ featured: doctor.featured });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/doctors/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
