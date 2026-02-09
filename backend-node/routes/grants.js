const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Grant = require('../models/Grant');
const { getCurrentUser } = require('../middleware/auth');
const { uploadDocument } = require('../utils/upload');

// Apply for grant
router.post('/grants/apply', getCurrentUser, async (req, res) => {
  try {
    const {
      case_summary,
      case_type,
      opponent_details,
      current_stage,
      annual_income,
      family_members,
      other_income_sources,
      amount_required,
      purpose_of_funding,
      breakdown_of_costs,
      bank_account_name,
      bank_account_number,
      bank_ifsc
    } = req.body;

    const grant = await Grant.create({
      user_id: req.user.id,
      user_name: req.user.full_name,
      user_email: req.user.email,
      case_summary,
      case_type,
      opponent_details,
      current_stage,
      annual_income,
      family_members,
      other_income_sources,
      amount_required,
      purpose_of_funding,
      breakdown_of_costs,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
      status: 'pending'
    });

    res.json(grant);
  } catch (error) {
    console.error('Apply for grant error:', error);
    res.status(500).json({ detail: 'Failed to submit grant application' });
  }
});

// Upload grant document
router.post('/grants/:grantId/documents', getCurrentUser, uploadDocument.single('file'), async (req, res) => {
  try {
    const grant = await Grant.findOne({ id: req.params.grantId, user_id: req.user.id });
    if (!grant) {
      return res.status(404).json({ detail: 'Grant application not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const { title } = req.body;
    const documentUrl = `/uploads/documents/grants/${req.file.filename}`;

    // Initialize supporting_documents array if it doesn't exist
    if (!grant.supporting_documents) {
      grant.supporting_documents = [];
    }

    grant.supporting_documents.push({
      filename: req.file.originalname,
      url: documentUrl,
      title: title || req.file.originalname,
      uploaded_at: new Date().toISOString()
    });

    grant.updated_at = new Date().toISOString();
    await grant.save();

    res.json({ message: 'Document uploaded successfully', document: grant.supporting_documents[grant.supporting_documents.length - 1] });
  } catch (error) {
    console.error('Upload grant document error:', error);
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

// Get my grants
router.get('/grants/my', getCurrentUser, async (req, res) => {
  try {
    const grants = await Grant.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(50);
    res.json(grants);
  } catch (error) {
    console.error('Get my grants error:', error);
    res.status(500).json({ detail: 'Failed to fetch grants' });
  }
});

module.exports = router;

