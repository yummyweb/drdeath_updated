const logger = require('../utils/logger');
const express    = require('express');
const router     = express.Router();
const Story      = require('../models/Story');
const Contact    = require('../models/Contact');
const Advocate   = require('../models/Advocate');
const Grant      = require('../models/Grant');
const User       = require('../models/User');
const Volunteer  = require('../models/Volunteer');
const Doctor     = require('../models/Doctor');
const Journalist = require('../models/Journalist');
const Researcher = require('../models/Researcher');
const Event      = require('../models/Event');
const Opportunity = require('../models/Opportunity');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../utils/upload');

// Get all stories (admin)
router.get('/admin/stories', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const query = {};
    if (status) query.status = status;
    const [stories, total] = await Promise.all([
      Story.find(query).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      Story.countDocuments(query)
    ]);
    res.json({ data: stories, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error({ err: error }, 'Admin get stories error:');
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});


// ======================================

// Create story (admin)

// ======================================

router.post('/admin/stories', getCurrentUser, requireAdmin, async (req, res) => {

  try {

    const {

      title,

      incident_date,

      hospital_name,

      location,

      description,

      outcome

    } = req.body;

    const story = new Story({

      user_id: req.user.id,

      user_name: "DrDeath.in", // or req.user.full_name if you prefer

      title,

      incident_date,

      hospital_name,

      location,

      description,

      outcome,

      status: "approved"

    });

    await story.save();

    res.status(201).json(story);

  } catch (error) {

    logger.error({ err: error }, "Admin create story error:");

    res.status(500).json({

      detail: "Failed to create story"

    });

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
    logger.error({ err: error }, 'Moderate story error:');
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
    logger.error({ err: error }, 'Admin update story error:');
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
    logger.error({ err: error }, 'Admin upload story document error:');
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
    logger.error({ err: error }, 'Admin add story link error:');
    res.status(500).json({ detail: 'Failed to add link' });
  }
});

// Get all contacts (admin)
router.get('/admin/contacts', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const [contacts, total] = await Promise.all([
      Contact.find({}).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      Contact.countDocuments({})
    ]);
    res.json({ data: contacts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error({ err: error }, 'Admin get contacts error:');
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
    logger.error({ err: error }, 'Update contact status error:');
    res.status(500).json({ detail: 'Failed to update contact status' });
  }
});

// Get all advocates (admin)
router.get('/admin/advocates', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const query = {};
    if (status) query.status = status;
    const [advocates, total] = await Promise.all([
      Advocate.find(query).select('-password').sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      Advocate.countDocuments(query)
    ]);
    res.json({ data: advocates, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error({ err: error }, 'Admin get advocates error:');
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
    logger.error({ err: error }, 'Moderate advocate error:');
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
    logger.error({ err: error }, 'Update advocate error:');
    res.status(500).json({ detail: 'Failed to update advocate' });
  }
});

// Get all grants (admin)
router.get('/admin/grants', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const query = {};
    if (status) query.status = status;
    const [grants, total] = await Promise.all([
      Grant.find(query).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      Grant.countDocuments(query)
    ]);
    res.json({ data: grants, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error({ err: error }, 'Admin get grants error:');
    res.status(500).json({ detail: 'Failed to fetch grants' });
  }
});

// Moderate grant (admin)
router.put('/admin/grants/:grantId/moderate', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes, amount_approved } = req.body;

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ detail: "Status must be 'approved', 'rejected', or 'under_review'" });
    }

    const grant = await Grant.findOne({ id: req.params.grantId });
    if (!grant) {
      return res.status(404).json({ detail: 'Grant application not found' });
    }

    const now = new Date();
    const adminEmail = req.user.email;

    grant.status        = status;
    grant.admin_notes   = admin_notes !== undefined ? admin_notes : grant.admin_notes;
    grant.moderated_by  = adminEmail;
    grant.moderated_at  = now;

    if (status === 'approved' && amount_approved !== undefined) {
      grant.amount_approved = amount_approved;
    }

    // Append to immutable history log
    grant.moderation_history.push({
      status,
      admin_notes: admin_notes || '',
      amount_approved: amount_approved || null,
      by: adminEmail,
      at: now,
    });

    await grant.save();

    // Non-blocking email notification to applicant
    if (status === 'approved' || status === 'rejected') {
      const { sendGrantStatus } = require('../utils/mailer');
      sendGrantStatus(grant.user_email, grant.user_name, status, admin_notes, amount_approved).catch(() => {});
    }

    res.json(grant);
  } catch (error) {
    logger.error({ err: error }, 'Moderate grant error:');
    res.status(500).json({ detail: 'Failed to moderate grant' });
  }
});

// Get admin stats — all counts run in parallel
router.get('/admin/stats', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStories, pendingStories, approvedStories, rejectedStories,
      totalContacts, unreadContacts,
      totalAdvocates, pendingAdvocates, approvedAdvocates,
      totalGrants, pendingGrants, approvedGrants,
      totalVolunteers, pendingVolunteers,
      totalDoctors, pendingDoctors,
      totalJournalists, pendingJournalists,
      totalResearchers, pendingResearchers,
      totalEvents, publishedEvents, upcomingEvents,
      totalOpportunities, publishedOpportunities,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Story.countDocuments({}),
      Story.countDocuments({ status: 'pending' }),
      Story.countDocuments({ status: 'approved' }),
      Story.countDocuments({ status: 'rejected' }),
      Contact.countDocuments({}),
      Contact.countDocuments({ status: { $in: ['new', 'pending'] } }),
      Advocate.countDocuments({}),
      Advocate.countDocuments({ status: 'pending' }),
      Advocate.countDocuments({ status: 'approved' }),
      Grant.countDocuments({}),
      Grant.countDocuments({ status: 'pending' }),
      Grant.countDocuments({ status: 'approved' }),
      Volunteer.countDocuments({}),
      Volunteer.countDocuments({ status: 'pending' }),
      Doctor.countDocuments({}),
      Doctor.countDocuments({ status: 'pending' }),
      Journalist.countDocuments({}),
      Journalist.countDocuments({ status: 'pending' }),
      Researcher.countDocuments({}),
      Researcher.countDocuments({ status: 'pending' }),
      Event.countDocuments({}),
      Event.countDocuments({ published: true }),
      Event.countDocuments({ published: true, date: { $gte: new Date() } }),
      Opportunity.countDocuments({}),
      Opportunity.countDocuments({ status: 'published', published: true }),
    ]);

    res.json({
      // Users & stories
      total_users:         totalUsers,
      total_stories:       totalStories,
      pending_stories:     pendingStories,
      approved_stories:    approvedStories,
      rejected_stories:    rejectedStories,
      // Contacts
      total_contacts:      totalContacts,
      unread_contacts:     unreadContacts,
      // Advocates
      total_advocates:     totalAdvocates,
      pending_advocates:   pendingAdvocates,
      approved_advocates:  approvedAdvocates,
      // Grants
      total_grants:        totalGrants,
      pending_grants:      pendingGrants,
      approved_grants:     approvedGrants,
      // Community registrations
      total_volunteers:    totalVolunteers,
      pending_volunteers:  pendingVolunteers,
      total_doctors:       totalDoctors,
      pending_doctors:     pendingDoctors,
      total_journalists:   totalJournalists,
      pending_journalists: pendingJournalists,
      total_researchers:   totalResearchers,
      pending_researchers: pendingResearchers,
      // Events
      total_events:        totalEvents,
      published_events:    publishedEvents,
      upcoming_events:     upcomingEvents,
      // Opportunities
      total_opportunities:     totalOpportunities,
      published_opportunities: publishedOpportunities,
      // Aggregate pending action count
      total_pending_actions:
        pendingStories + pendingAdvocates + pendingGrants +
        pendingVolunteers + pendingDoctors + pendingJournalists + pendingResearchers,
    });
  } catch (error) {
    logger.error({ err: error }, 'Get admin stats error:');
    res.status(500).json({ detail: 'Failed to fetch stats' });
  }
});

module.exports = router;

