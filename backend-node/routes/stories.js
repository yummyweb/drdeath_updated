const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Story = require('../models/Story');
const { getCurrentUser } = require('../middleware/auth');
const { upload, uploadDocument } = require('../utils/upload');

// Create story
router.post('/stories', getCurrentUser, async (req, res) => {
  try {
    const { title, incident_date, hospital_name, location, description, outcome } = req.body;
    
    const story = await Story.create({
      user_id: req.user.id,
      user_name: req.user.full_name,
      title,
      incident_date,
      hospital_name,
      location,
      description,
      outcome
    });

    res.json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ detail: 'Failed to create story' });
  }
});

// Upload story image
router.post('/stories/:storyId/images', getCurrentUser, upload.single('file'), async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Generate URL path for the uploaded file
    const imageUrl = `/uploads/images/stories/${req.file.filename}`;

    // Initialize images array if it doesn't exist
    if (!story.images) {
      story.images = [];
    }

    story.images.push(imageUrl);
    story.updated_at = new Date().toISOString();
    await story.save();

    res.json({ message: 'Image uploaded successfully', image_count: story.images.length });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

// Upload story document (PDF)
router.post('/stories/:storyId/document', getCurrentUser, uploadDocument.single('file'), async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const { title } = req.body;
    const documentUrl = `/uploads/documents/stories/${req.file.filename}`;

    // Initialize documents array if it doesn't exist
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
    console.error('Upload document error:', error);
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

// Add external link to story
router.post('/stories/:storyId/link', getCurrentUser, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const { title, url, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({ detail: 'Title and URL are required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ detail: 'Invalid URL format' });
    }

    // Initialize external_links array if it doesn't exist
    if (!story.external_links) {
      story.external_links = [];
    }

    story.external_links.push({
      title,
      url,
      type: type || 'other'
    });

    story.updated_at = new Date().toISOString();
    await story.save();

    res.json({ message: 'Link added successfully', link: story.external_links[story.external_links.length - 1] });
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ detail: 'Failed to add link' });
  }
});

// Delete story document
router.delete('/stories/:storyId/document/:documentUrl', getCurrentUser, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const documentUrl = decodeURIComponent(req.params.documentUrl);
    
    if (story.documents) {
      // Remove document from array
      story.documents = story.documents.filter(doc => doc.url !== documentUrl);
      
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', 'public', documentUrl.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      story.updated_at = new Date().toISOString();
      await story.save();
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ detail: 'Failed to delete document' });
  }
});

// Delete story external link
router.delete('/stories/:storyId/link/:linkIndex', getCurrentUser, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const linkIndex = parseInt(req.params.linkIndex);
    
    if (story.external_links && story.external_links[linkIndex]) {
      story.external_links.splice(linkIndex, 1);
      story.updated_at = new Date().toISOString();
      await story.save();
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ detail: 'Failed to delete link' });
  }
});

// Get my stories
router.get('/stories/my', getCurrentUser, async (req, res) => {
  try {
    const stories = await Story.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(100);
    res.json(stories);
  } catch (error) {
    console.error('Get my stories error:', error);
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});

// Get approved stories (public)
router.get('/stories/approved', async (req, res) => {
  try {
    const stories = await Story.find({ status: 'approved' }).sort({ created_at: -1 }).limit(100);
    res.json(stories);
  } catch (error) {
    console.error('Get approved stories error:', error);
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});

// Update story (must come before GET /:storyId to avoid conflicts)
router.put('/stories/:storyId', getCurrentUser, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    const { title, incident_date, hospital_name, location, description, outcome } = req.body;
    
    if (title) story.title = title;
    if (incident_date) story.incident_date = incident_date;
    if (hospital_name) story.hospital_name = hospital_name;
    if (location) story.location = location;
    if (description) story.description = description;
    if (outcome !== undefined) story.outcome = outcome;
    
    story.status = 'pending'; // Reset to pending after edit
    story.updated_at = new Date().toISOString();
    await story.save();

    res.json(story);
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ detail: 'Failed to update story' });
  }
});

// Get story by ID
router.get('/stories/:storyId', async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ detail: 'Failed to fetch story' });
  }
});

// Delete story
router.delete('/stories/:storyId', getCurrentUser, async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.storyId, user_id: req.user.id });
    if (!story) {
      return res.status(404).json({ detail: 'Story not found' });
    }

    await Story.deleteOne({ id: req.params.storyId });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ detail: 'Failed to delete story' });
  }
});

module.exports = router;

