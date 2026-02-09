const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const Contact = require('../models/Contact');
const Advocate = require('../models/Advocate');
const Grant = require('../models/Grant');
const User = require('../models/User');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../utils/upload');

// Get all stories (admin)
router.get('/admin/stories', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const stories = await Story.find(query).sort({ created_at: -1 }).limit(500);
    res.json(stories);
  } catch (error) {
    console.error('Admin get stories error:', error);
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});

// Moderate story (admin)
router.put('/admin/stories/:storyId/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: "Status must be 'approved' or 'rejected'" });
    }

    const story = await Story.findOne({ id: req.params.storyId });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    story.status = status;
    if (admin_notes !== undefined) story.admin_notes = admin_notes;
    story.updated_at = new Date().toISOString();
    await story.save();

    res.json(story);
  } catch (error) {
    console.error('Moderate story error:', error);
    res.status(500).json({ detail: 'Failed to moderate story' });
  }
});

// Update story content (admin) - allows editing without resetting status
router.put('/admin/stories/:storyId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const { title, incident_date, hospital_name, location, description, outcome, status } = req.body;
    
    if (title !== undefined) story.title = title;
    if (incident_date !== undefined) story.incident_date = incident_date;
    if (hospital_name !== undefined) story.hospital_name = hospital_name;
    if (location !== undefined) story.location = location;
    if (description !== undefined) story.description = description;
    if (outcome !== undefined) story.outcome = outcome;
    // Admin can optionally change status when editing
    if (status !== undefined && ['pending', 'approved', 'rejected'].includes(status)) {
      story.status = status;
    }
    
    story.updated_at = new Date().toISOString();
    await story.save();

    res.json(story);
  } catch (error) {
    console.error('Admin update story error:', error);
    res.status(500).json({ detail: 'Failed to update story' });
  }
});

// Admin routes for story documents and links (bypass ownership check)
router.post('/admin/stories/:storyId/document', getCurrentUser, requireAdmin, uploadDocument.single('file'), async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const { title } = req.body;
    const documentUrl = `/uploads/documents/stories/${req.file.filename}`;

    if (!story.documents) {
      story.documents = [];
    }

    story.documents.push({
      filename: req.file.originalname,
      url: documentUrl,
      title: title || req.file.originalname,
      uploaded_at: new Date().toISOString()
    });

    story.updated_at = new Date().toISOString();
    await story.save();

    res.json({ message: 'Document uploaded successfully', document: story.documents[story.documents.length - 1] });
  } catch (error) {
    console.error('Admin upload story document error:', error);
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

router.post('/admin/stories/:storyId/link', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const { title, url, type } = req.body;
    if (!title || !url) {
      return res.status(400).json({ detail: 'Title and URL are required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ detail: 'Invalid URL format' });
    }

    if (!story.external_links) {
      story.external_links = [];
    }

    story.external_links.push({ title, url, type: type || 'other' });
    story.updated_at = new Date().toISOString();
    await story.save();

    res.json({ message: 'Link added successfully', link: story.external_links[story.external_links.length - 1] });
  } catch (error) {
    console.error('Admin add story link error:', error);
    res.status(500).json({ detail: 'Failed to add link' });
  }
});

// Get all contacts (admin)
router.get('/admin/contacts', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ created_at: -1 }).limit(500);
    res.json(contacts);
  } catch (error) {
    console.error('Admin get contacts error:', error);
    res.status(500).json({ detail: 'Failed to fetch contacts' });
  }
});

// Update contact status (admin)
router.put('/admin/contacts/:contactId/status', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findOne({ id: req.params.contactId });
    if (!contact) {
      return res.status(404).json({ detail: 'Contact not found' });
    }
    contact.status = status;
    await contact.save();
    res.json(contact);
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ detail: 'Failed to update contact status' });
  }
});

// Get all advocates (admin)
router.get('/admin/advocates', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const advocates = await Advocate.find(query).select('-password').sort({ created_at: -1 }).limit(500);
    res.json(advocates);
  } catch (error) {
    console.error('Admin get advocates error:', error);
    res.status(500).json({ detail: 'Failed to fetch advocates' });
  }
});

// Moderate advocate (admin)
router.put('/admin/advocates/:advocateId/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: "Status must be 'approved' or 'rejected'" });
    }

    const advocate = await Advocate.findOne({ id: req.params.advocateId });
    if (!advocate) {
      return res.status(404).json({ detail: 'Advocate not found' });
    }

    advocate.status = status;
    if (admin_notes !== undefined) advocate.admin_notes = admin_notes;
    await advocate.save();

    res.json(advocate.toJSON());
  } catch (error) {
    console.error('Moderate advocate error:', error);
    res.status(500).json({ detail: 'Failed to moderate advocate' });
  }
});

// Update advocate (admin)
router.put('/admin/advocates/:advocateId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { full_name, email, phone, bar_council_number, specializations, experience_years, areas_of_operation, about, languages } = req.body;
    
    const advocate = await Advocate.findOne({ id: req.params.advocateId });
    if (!advocate) {
      return res.status(404).json({ detail: 'Advocate not found' });
    }

    // Update fields if provided
    if (full_name !== undefined) advocate.full_name = full_name;
    if (email !== undefined) advocate.email = email;
    if (phone !== undefined) advocate.phone = phone;
    if (bar_council_number !== undefined) advocate.bar_council_number = bar_council_number;
    if (specializations !== undefined) advocate.specializations = specializations;
    if (experience_years !== undefined) advocate.experience_years = experience_years;
    if (areas_of_operation !== undefined) advocate.areas_of_operation = areas_of_operation;
    if (about !== undefined) advocate.about = about;
    if (languages !== undefined) advocate.languages = languages;

    await advocate.save();

    res.json(advocate.toJSON());
  } catch (error) {
    console.error('Update advocate error:', error);
    res.status(500).json({ detail: 'Failed to update advocate' });
  }
});

// Get all grants (admin)
router.get('/admin/grants', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const grants = await Grant.find(query).sort({ created_at: -1 }).limit(500);
    res.json(grants);
  } catch (error) {
    console.error('Admin get grants error:', error);
    res.status(500).json({ detail: 'Failed to fetch grants' });
  }
});

// Moderate grant (admin)
router.put('/admin/grants/:grantId/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes, amount_approved } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: "Status must be 'approved' or 'rejected'" });
    }

    const grant = await Grant.findOne({ id: req.params.grantId });
    if (!grant) {
      return res.status(404).json({ detail: 'Grant application not found' });
    }

    grant.status = status;
    if (admin_notes !== undefined) grant.admin_notes = admin_notes;
    if (status === 'approved' && amount_approved !== undefined) {
      grant.amount_approved = amount_approved;
    }
    grant.updated_at = new Date().toISOString();
    await grant.save();

    res.json(grant);
  } catch (error) {
    console.error('Moderate grant error:', error);
    res.status(500).json({ detail: 'Failed to moderate grant' });
  }
});

// Get admin stats
router.get('/admin/stats', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    const totalStories = await Story.countDocuments({});
    const pendingStories = await Story.countDocuments({ status: 'pending' });
    const approvedStories = await Story.countDocuments({ status: 'approved' });
    const rejectedStories = await Story.countDocuments({ status: 'rejected' });
    
    const totalContacts = await Contact.countDocuments({});
    
    const totalAdvocates = await Advocate.countDocuments({});
    const pendingAdvocates = await Advocate.countDocuments({ status: 'pending' });
    const approvedAdvocates = await Advocate.countDocuments({ status: 'approved' });
    
    const totalGrants = await Grant.countDocuments({});
    const pendingGrants = await Grant.countDocuments({ status: 'pending' });
    const approvedGrants = await Grant.countDocuments({ status: 'approved' });
    
    res.json({
      total_users: totalUsers,
      total_stories: totalStories,
      pending_stories: pendingStories,
      approved_stories: approvedStories,
      rejected_stories: rejectedStories,
      total_contacts: totalContacts,
      total_advocates: totalAdvocates,
      pending_advocates: pendingAdvocates,
      approved_advocates: approvedAdvocates,
      total_grants: totalGrants,
      pending_grants: pendingGrants,
      approved_grants: approvedGrants
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ detail: 'Failed to fetch stats' });
  }
});

module.exports = router;

