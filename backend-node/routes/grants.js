const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Grant = require('../models/Grant');
const grantService = require('../services/grantService');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../utils/upload');
const { validate, schemas } = require('../utils/validate');

const GRANT_DOCS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'documents', 'grants');

router.post('/grants/apply', getCurrentUser, validate(schemas.grant), async (req, res) => {
  try {
    const grant = await grantService.create(req.user.id, req.user.full_name, req.user.email, req.body);
    res.json(grant);
  } catch (error) {
    logger.error({ err: error }, 'Apply for grant error:');
    res.status(500).json({ detail: 'Failed to submit grant application' });
  }
});

router.post('/grants/:grantId/documents', getCurrentUser, uploadDocument.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file provided' });
    const doc = await grantService.addDocument(req.params.grantId, req.user.id, req.file, req.body.title);
    if (!doc) return res.status(404).json({ detail: 'Grant application not found' });
    res.json({ message: 'Document uploaded successfully', document: doc });
  } catch (error) {
    logger.error({ err: error }, 'Upload grant document error:');
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

router.get('/grants/my', getCurrentUser, async (req, res) => {
  try {
    const grants = await grantService.getByUser(req.user.id);
    res.json(grants);
  } catch (error) {
    logger.error({ err: error }, 'Get my grants error:');
    res.status(500).json({ detail: 'Failed to fetch grants' });
  }
});

// Authenticated document download — user must own the grant OR be admin
router.get('/grants/documents/:filename', getCurrentUser, async (req, res) => {
  try {
    const filename = req.params.filename;

    // Path traversal guard
    const filePath = path.resolve(GRANT_DOCS_DIR, filename);
    if (!filePath.startsWith(GRANT_DOCS_DIR)) {
      return res.status(400).json({ detail: 'Invalid filename' });
    }

    // Verify the file belongs to a grant owned by this user (or user is admin)
    if (req.user.role !== 'admin') {
      const grant = await Grant.findOne({
        user_id: req.user.id,
        'supporting_documents.url': { $regex: filename }
      });
      if (!grant) return res.status(403).json({ detail: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ detail: 'File not found' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    logger.error({ err: error }, 'Grant document download error');
    res.status(500).json({ detail: 'Failed to retrieve document' });
  }
});

module.exports = router;
