const logger = require('../utils/logger');
'use strict';

const express  = require('express');
const router   = express.Router();
const Opportunity  = require('../models/Opportunity');
const Application  = require('../models/Application');
const { APPLICATION_STATUSES } = require('../models/Application');
const { CATEGORIES }           = require('../models/Opportunity');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');

// ── Helpers ───────────────────────────────────────────────────────────────────

function paged(page, limit, defaultLimit = 20) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, parseInt(limit) || defaultLimit);
  return { skip: (p - 1) * l, limit: l, page: p };
}

// ── Public: list published opportunities ──────────────────────────────────────
router.get('/opportunities', async (req, res) => {
  try {
    const { category, remote, search, page, limit } = req.query;
    const { skip, limit: lim, page: p } = paged(page, limit, 20);

    const query = { published: true, status: 'published' };
    if (category) query.category = category;
    if (remote)   query.remote   = remote;
    if (search)   query.title    = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Opportunity.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip).limit(lim)
        .select('-__v'),
      Opportunity.countDocuments(query),
    ]);

    res.json({ data, total, page: p, pages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// ── Public: single opportunity ────────────────────────────────────────────────
router.get('/opportunities/:id', async (req, res) => {
  try {
    const opp = await Opportunity.findOne({ _id: req.params.id, published: true });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opp);
  } catch {
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// ── Authenticated: apply ──────────────────────────────────────────────────────
router.post('/opportunities/:id/apply', getCurrentUser, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required to apply' });

    const opp = await Opportunity.findOne({ _id: req.params.id, published: true, status: 'published' });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found or closed' });

    if (opp.lastDate && new Date() > new Date(opp.lastDate)) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }

    const existing = await Application.findOne({ opportunity: req.params.id, applicant: req.user.id });
    if (existing) return res.status(409).json({ error: 'You have already applied for this opportunity' });

    const { coverLetter, resumeUrl, phone, linkedIn, portfolio } = req.body;

    const application = await Application.create({
      opportunity: req.params.id,
      applicant:   req.user.id,
      coverLetter: coverLetter?.trim(),
      resumeUrl:   resumeUrl?.trim(),
      phone:       phone?.trim(),
      linkedIn:    linkedIn?.trim(),
      portfolio:   portfolio?.trim(),
      statusHistory: [{ status: 'applied', note: 'Application submitted' }],
    });

    res.status(201).json({ message: 'Application submitted successfully', id: application._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'You have already applied for this opportunity' });
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ── Authenticated: my applications ───────────────────────────────────────────
router.get('/my/applications', getCurrentUser, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });

    const applications = await Application.find({ applicant: req.user.id })
      .populate('opportunity', 'title category department location status lastDate')
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ── Authenticated: withdraw application ──────────────────────────────────────
router.put('/my/applications/:id/withdraw', getCurrentUser, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });

    const app = await Application.findOne({ _id: req.params.id, applicant: req.user.id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    if (['selected', 'rejected', 'withdrawn'].includes(app.status)) {
      return res.status(400).json({ error: `Cannot withdraw an application with status: ${app.status}` });
    }

    app.status = 'withdrawn';
    app.statusHistory.push({ status: 'withdrawn', note: 'Withdrawn by applicant' });
    await app.save();

    res.json({ message: 'Application withdrawn' });
  } catch {
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Admin: list all opportunities ─────────────────────────────────────────────
router.get('/admin/opportunities', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, category, page, limit, search } = req.query;
    const { skip, limit: lim, page: p } = paged(page, limit, 50);

    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;
    if (search)   query.title    = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Opportunity.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Opportunity.countDocuments(query),
    ]);

    // Attach application count to each
    const ids = data.map(o => o._id);
    const counts = await Application.aggregate([
      { $match: { opportunity: { $in: ids } } },
      { $group: { _id: '$opportunity', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    const enriched = data.map(o => ({ ...o, applicationCount: countMap[o._id.toString()] || 0 }));

    res.json({ data: enriched, total, page: p, pages: Math.ceil(total / lim) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// ── Admin: create ─────────────────────────────────────────────────────────────
router.post('/admin/opportunities', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { title, category, description } = req.body;
    if (!title?.trim())       return res.status(400).json({ error: 'title is required' });
    if (!category)            return res.status(400).json({ error: 'category is required' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
    if (!description?.trim()) return res.status(400).json({ error: 'description is required' });

    const body = { ...req.body, createdBy: req.user.id };
    // Strip empty strings for optional enum fields so Mongoose doesn't reject them
    if (!body.employmentType) delete body.employmentType;
    if (!body.remote) delete body.remote;
    const opp = await Opportunity.create(body);
    res.status(201).json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create opportunity' });
  }
});

// ── Admin: update ─────────────────────────────────────────────────────────────
router.put('/admin/opportunities/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.employmentType) delete body.employmentType;
    if (!body.remote) delete body.remote;
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update opportunity' });
  }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/admin/opportunities/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    await Application.deleteMany({ opportunity: req.params.id });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

// ── Admin: partial update (published/featured/status only) ────────────────────
const OPP_PATCHABLE = new Set(['published', 'featured', 'status']);
router.patch('/admin/opportunities/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (OPP_PATCHABLE.has(key)) updates[key] = req.body[key];
    }
    if (!Object.keys(updates).length)
      return res.status(400).json({ error: 'No patchable fields provided' });
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opp);
  } catch (err) {
    logger.error({ err }, 'Patch opportunity error');
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// ── Admin: duplicate ──────────────────────────────────────────────────────────
router.post('/admin/opportunities/:id/duplicate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const source = await Opportunity.findById(req.params.id).lean();
    if (!source) return res.status(404).json({ error: 'Opportunity not found' });

    const { _id, createdAt, updatedAt, __v, ...rest } = source;
    const copy = await Opportunity.create({
      ...rest,
      title:     `${rest.title} (Copy)`,
      status:    'draft',
      published: false,
      createdBy: req.user.id,
    });

    res.status(201).json(copy);
  } catch {
    res.status(500).json({ error: 'Failed to duplicate opportunity' });
  }
});

// ── Admin: get applications for an opportunity ────────────────────────────────
router.get('/admin/opportunities/:id/applications', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const { skip, limit: lim, page: p } = paged(page, limit, 50);

    const query = { opportunity: req.params.id };
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'full_name email phone')
        .sort({ createdAt: -1 })
        .skip(skip).limit(lim)
        .lean(),
      Application.countDocuments(query),
    ]);

    res.json({ data, total, page: p, pages: Math.ceil(total / lim) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ── Admin: update application status ─────────────────────────────────────────
router.put('/admin/applications/:id/status', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}` });
    }

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = status;
    if (req.body.adminNotes !== undefined) app.adminNotes = req.body.adminNotes;
    app.statusHistory.push({ status, note: note?.trim() || '' });
    await app.save();

    res.json(app);
  } catch {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// ── Admin: export applications as CSV ────────────────────────────────────────
router.get('/admin/opportunities/:id/applications/export', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const apps = await Application.find({ opportunity: req.params.id })
      .populate('applicant', 'full_name email')
      .populate('opportunity', 'title')
      .lean();

    const header = ['Name', 'Email', 'Phone', 'Status', 'Cover Letter', 'LinkedIn', 'Portfolio', 'Applied On'].join(',');
    const rows = apps.map(a => [
      `"${a.applicant?.full_name || ''}"`,
      `"${a.applicant?.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.status}"`,
      `"${(a.coverLetter || '').replace(/"/g, '""').slice(0, 200)}"`,
      `"${a.linkedIn || ''}"`,
      `"${a.portfolio || ''}"`,
      `"${new Date(a.createdAt).toLocaleDateString('en-IN')}"`,
    ].join(','));

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="applications-${req.params.id}.csv"`);
    res.send(csv);
  } catch {
    res.status(500).json({ error: 'Failed to export' });
  }
});

module.exports = router;
