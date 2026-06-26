const logger = require('../utils/logger');
const resourceService = require('../services/resourceService');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const LegalResource = require('../models/LegalResource');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');

// ── PDF upload config ─────────────────────────────────────────────────────────
const PDF_DIR = path.join(__dirname, '..', 'public', 'uploads', 'documents', 'resources');
fs.mkdirSync(PDF_DIR, { recursive: true });

const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, PDF_DIR),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
      cb(null, `${base}-${unique}${ext}`);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const isPdf = /\.pdf$/i.test(file.originalname) && file.mimetype === 'application/pdf';
    isPdf ? cb(null, true) : cb(new Error('Only PDF files are allowed'));
  }
});

// POST /api/resources/upload-pdf
router.post('/upload-pdf', getCurrentUser, requireAdmin, pdfUpload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/documents/resources/${req.file.filename}`;

  const { extractText } = require('../utils/pdfExtract');
  const fullPath = path.join(PDF_DIR, req.file.filename);
  const extractedText = await extractText(fullPath);

  res.json({ url, extractedText });
});

// ── List — GET /api/resources ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, court, sort = 'newest', page = 1, limit = 10, all } = req.query;

    const query = all === 'true' ? {} : { published: true };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: regex },
        { citation: regex },
        { summary: regex },
        { author: regex }
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (court && court !== 'All') query.court = new RegExp(court.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const sortObj = sort === 'oldest' ? { createdAt: 1 } : sort === 'az' ? { title: 1 } : { createdAt: -1 };

    // List projection — exclude large rich text fields for list views
    const listFields = 'title slug citation court bench judgmentDate category summary author pdfUrl externalLink tags featured published status createdAt';

    if (all === 'true') {
      const resources = await LegalResource.find(query).sort(sortObj).select(listFields);
      return res.json({ resources, total: resources.length, page: 1, pages: 1 });
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      LegalResource.find(query).sort(sortObj).skip(skip).limit(limitNum).select(listFields),
      LegalResource.countDocuments(query)
    ]);

    return res.json({ resources, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Tags autocomplete — GET /api/resources/tags ───────────────────────────────
router.get('/tags', async (req, res) => {
  try {
    const tags = await LegalResource.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 200 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);
    res.json(tags);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// ── Version history — GET /api/resources/:id/history ─────────────────────────
router.get('/:id/history', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const history = await resourceService.getHistory(req.params.id);
    res.json(history);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

// ── Single resource — GET /api/resources/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const resource = await resourceService.getById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    return res.json(resource);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildResourceData(body) {
  return {
    title:               body.title?.trim(),
    resourceType:        body.resourceType,
    category:            body.category?.trim(),
    medicalIssue:        body.medicalIssue?.trim(),
    medicalSpecialties:  body.medicalSpecialties || [],
    practiceAreas:       body.practiceAreas || [],
    citation:            body.citation?.trim(),
    equivalentCitation:  body.equivalentCitation?.trim(),
    court:               body.court?.trim(),
    bench:               body.bench?.trim(),
    judges:              body.judges || [],
    judgmentDate:        body.judgmentDate || null,
    acts:                body.acts || [],
    sections:            body.sections || [],
    keywords:            body.keywords || [],
    legalPrinciples:     body.legalPrinciples || [],
    standardOfCare:      body.standardOfCare?.trim(),
    summary:             body.summary,
    facts:               body.facts,
    issues:              body.issues,
    arguments:           body.arguments,
    findings:            body.findings,
    ratio:               body.ratio,
    obiter:              body.obiter,
    held:                body.held,
    significance:        body.significance,
    practicalImplications: body.practicalImplications,
    relevance:           body.relevance,
    content:             body.content,
    author:              body.author,
    instructions:        body.instructions,
    pdfUrl:              body.pdfUrl,
    externalLink:        body.externalLink,
    source:              body.source,
    tags:                (body.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean),
    featured:            !!body.featured,
    published:           body.published !== false,
    status:              body.status || 'Published'
  };
}

// Type-specific required fields
const TYPE_REQUIRED = {
  'Judgment':           ['title', 'court', 'citation', 'judgmentDate'],
  'Case Analysis':      ['title', 'citation'],
  'Statute':            ['title', 'content'],
  'Circular':           ['title', 'content'],
  'Medical Guideline':  ['title', 'content'],
  'Research Paper':     ['title', 'author'],
  'RTI Template':       ['title', 'content'],
  'Legal Notice':       ['title', 'content'],
  'Consumer Complaint': ['title', 'content'],
  'Article':            ['title'],
  'FAQ':                ['title', 'content'],
  'Other':              ['title'],
};

function validateResourceData(data) {
  const required = TYPE_REQUIRED[data.resourceType] || ['title'];
  const missing = required.filter((f) => !data[f]);
  if (missing.length) {
    return `${data.resourceType || 'Resource'} requires: ${missing.join(', ')}`;
  }
  return null;
}

function sendDuplicateResponse(res, err) {
  return res.status(409).json({
    duplicate: true,
    message: err.message,
    existing: {
      _id:        err.duplicate._id,
      title:      err.duplicate.title,
      citation:   err.duplicate.citation,
      slug:       err.duplicate.slug,
      matchScore: err.duplicate.matchScore || 100
    }
  });
}

// ── Create — POST /api/resources ──────────────────────────────────────────────
router.post('/', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const resourceData = buildResourceData(req.body);
    const validationError = validateResourceData(resourceData);
    if (validationError) return res.status(400).json({ error: validationError });
    const resource = await resourceService.create(resourceData);
    return res.status(201).json(resource);
  } catch (err) {
    logger.error(err);
    if (err.status === 409) return sendDuplicateResponse(res, err);
    if (err.code === 11000) return res.status(409).json({ error: 'A resource with that slug or citation already exists' });
    return res.status(500).json({ error: err.message });
  }
});

// ── Full update — PUT /api/resources/:id ──────────────────────────────────────
router.put('/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const resourceData = buildResourceData(req.body);
    const validationError = validateResourceData(resourceData);
    if (validationError) return res.status(400).json({ error: validationError });
    const resource = await resourceService.update(req.params.id, resourceData);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    return res.json(resource);
  } catch (err) {
    logger.error(err);
    if (err.status === 409) return sendDuplicateResponse(res, err);
    if (err.code === 11000) return res.status(409).json({ error: 'A resource with that slug or citation already exists' });
    return res.status(500).json({ error: err.message });
  }
});

// ── Partial update — PATCH /api/resources/:id ─────────────────────────────────
// Use this for toggling published/featured/status without triggering a full
// duplicate-check and slug regeneration cycle.
const PATCHABLE_FIELDS = new Set(['published', 'featured', 'status']);

router.patch('/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (PATCHABLE_FIELDS.has(key)) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No patchable fields provided' });
    }
    const resource = await LegalResource.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    return res.json(resource);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Delete — DELETE /api/resources/:id ───────────────────────────────────────
router.delete('/:id', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const deleted = await resourceService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Resource not found' });

    // Clean up associated PDF if it was a local upload
    if (deleted.pdfUrl && !deleted.pdfUrl.startsWith('http')) {
      const filePath = path.join(__dirname, '..', 'public', deleted.pdfUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
