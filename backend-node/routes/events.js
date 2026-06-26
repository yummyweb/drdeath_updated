'use strict';
const logger = require('../utils/logger');

const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');
const { slugify, generateUniqueSlug } = require('../utils/slugify');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

// ── Public: list published events ─────────────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const { type, when, search, page: p = 1, limit: l = 20 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(50, parseInt(l));

    const now   = new Date();
    // Compare against start of today so same-day events appear in Upcoming
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const query = { published: true, status: { $in: ['published', 'completed', 'cancelled'] } };

    if (type)   query.event_type = type;
    if (search) query.title      = { $regex: search, $options: 'i' };
    if (when === 'upcoming') query.date = { $gte: today };
    if (when === 'past')     query.date = { $lt: today };

    const sort = when === 'past' ? { date: -1 } : { date: 1 };

    const [data, total] = await Promise.all([
      Event.find(query).sort({ featured: -1, ...sort })
        .skip((page - 1) * limit).limit(limit)
        .select('-organizer_email -organizer_phone -createdBy')
        .lean(),
      Event.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ── Public: single event by slug ──────────────────────────────────────────────
router.get('/events/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, published: true })
      .select('-organizer_email -organizer_phone -createdBy')
      .lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// ── Admin: list all ───────────────────────────────────────────────────────────
router.get('/admin/events', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, type, page: p = 1, limit: l = 50 } = req.query;
    const page  = Math.max(1, parseInt(p));
    const limit = Math.min(100, parseInt(l));

    const query = {};
    if (status) query.status     = status;
    if (type)   query.event_type = type;

    const [data, total] = await Promise.all([
      Event.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ── Admin: create ─────────────────────────────────────────────────────────────
router.post('/admin/events', getCurrentUser, requireAdmin, validate(schemas.event), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
    if (!req.body.description?.trim()) return res.status(400).json({ error: 'description is required' });
    if (!req.body.event_type) return res.status(400).json({ error: 'event_type is required' });
    if (!req.body.format)     return res.status(400).json({ error: 'format is required' });
    if (!req.body.date)       return res.status(400).json({ error: 'date is required' });

    const slug = await generateUniqueSlug(Event, title);

    const event = await Event.create({
      ...req.body,
      slug,
      title: title.trim(),
      createdBy: req.user._id,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      speakers: Array.isArray(req.body.speakers) ? req.body.speakers : [],
    });

    res.status(201).json(event);
  } catch (err) {
    logger.error({ err: err }, 'Create event error:');
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// ── Admin: update ─────────────────────────────────────────────────────────────
router.put('/admin/events/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;
    const update    = { ...req.body };

    if (title) {
      update.title = title.trim();
      update.slug  = await generateUniqueSlug(Event, title, req.params.id);
    }
    if (Array.isArray(req.body.tags))     update.tags     = req.body.tags;
    if (Array.isArray(req.body.speakers)) update.speakers = req.body.speakers;

    delete update._id;
    delete update.createdBy;

    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    logger.error({ err: err }, 'Update event error:');
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// ── Admin: partial update (published/featured/status only) ────────────────────
const EVENT_PATCHABLE = new Set(['published', 'featured', 'status']);
router.patch('/admin/events/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (EVENT_PATCHABLE.has(key)) updates[key] = req.body[key];
    }
    if (!Object.keys(updates).length)
      return res.status(400).json({ error: 'No patchable fields provided' });
    const event = await Event.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    logger.error({ err }, 'Patch event error');
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/events/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
