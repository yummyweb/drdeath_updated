const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Case = require('../models/Case');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { upload, uploadDocument } = require('../utils/upload');

// Helper function to extract YouTube video ID and generate thumbnail URL
function getYouTubeThumbnail(youtubeUrl) {
  if (!youtubeUrl) return '';
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = youtubeUrl.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  
  return '';
}

// Get all cases (public)
router.get('/cases', async (req, res) => {
  try {
    const cases = await Case.find().sort({ order: 1, created_at: -1 });
    res.json(cases);
  } catch (error) {
    logger.error({ err: error }, 'Get cases error:');
    res.status(500).json({ detail: 'Failed to fetch cases' });
  }
});

// Get single case (public)
router.get('/cases/:caseId', async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }
    res.json(caseItem);
  } catch (error) {
    logger.error({ err: error }, 'Get case error:');
    res.status(500).json({ detail: 'Failed to fetch case' });
  }
});

// Create case (admin only)
router.post('/cases', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { title, description, youtube_url, order } = req.body;
    
    const youtube_thumbnail = getYouTubeThumbnail(youtube_url || '');
    
    const caseItem = await Case.create({
      title,
      description,
      youtube_url: youtube_url || '',
      youtube_thumbnail,
      order: order || 0
    });

    res.json(caseItem);
  } catch (error) {
    logger.error({ err: error }, 'Create case error:');
    res.status(500).json({ detail: 'Failed to create case' });
  }
});

// Update case (admin only)
router.put('/cases/:caseId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { title, description, youtube_url, order } = req.body;
    const caseItem = await Case.findOne({ id: req.params.caseId });
    
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    const youtube_thumbnail = getYouTubeThumbnail(youtube_url || '');
    
    caseItem.title = title || caseItem.title;
    caseItem.description = description || caseItem.description;
    caseItem.youtube_url = youtube_url !== undefined ? youtube_url : caseItem.youtube_url;
    caseItem.youtube_thumbnail = youtube_thumbnail || caseItem.youtube_thumbnail;
    caseItem.order = order !== undefined ? order : caseItem.order;
    caseItem.updated_at = new Date().toISOString();
    
    await caseItem.save();

    res.json(caseItem);
  } catch (error) {
    logger.error({ err: error }, 'Update case error:');
    res.status(500).json({ detail: 'Failed to update case' });
  }
});

// Upload case image (admin only)
router.post('/cases/:caseId/image', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Delete old image file if it exists (not base64)
    if (caseItem.image_url && !caseItem.image_url.startsWith('data:')) {
      const oldFilePath = path.join(__dirname, '..', 'public', caseItem.image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL path for the uploaded file
    const imageUrl = `/uploads/images/cases/${req.file.filename}`;

    caseItem.image_url = imageUrl;
    caseItem.updated_at = new Date().toISOString();
    await caseItem.save();

    res.json({ message: 'Image uploaded successfully', image_url: imageUrl });
  } catch (error) {
    logger.error({ err: error }, 'Upload case image error:');
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

// Upload case document (PDF) - admin only
router.post('/cases/:caseId/document', getCurrentUser, requireAdmin, uploadDocument.single('file'), async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const { title } = req.body;
    const documentUrl = `/uploads/documents/cases/${req.file.filename}`;

    // Initialize documents array if it doesn't exist
    if (!caseItem.documents) {
      caseItem.documents = [];
    }

    caseItem.documents.push({
      filename: req.file.originalname,
      url: documentUrl,
      title: title || req.file.originalname,
      uploaded_at: new Date().toISOString()
    });

    caseItem.updated_at = new Date().toISOString();
    await caseItem.save();

    res.json({ message: 'Document uploaded successfully', document: caseItem.documents[caseItem.documents.length - 1] });
  } catch (error) {
    logger.error({ err: error }, 'Upload case document error:');
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

// Add external link to case (admin only)
router.post('/cases/:caseId/link', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
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
    if (!caseItem.external_links) {
      caseItem.external_links = [];
    }

    caseItem.external_links.push({
      title,
      url,
      type: type || 'other'
    });

    caseItem.updated_at = new Date().toISOString();
    await caseItem.save();

    res.json({ message: 'Link added successfully', link: caseItem.external_links[caseItem.external_links.length - 1] });
  } catch (error) {
    logger.error({ err: error }, 'Add case link error:');
    res.status(500).json({ detail: 'Failed to add link' });
  }
});

// Delete case document (admin only)
router.delete('/cases/:caseId/document/:documentUrl', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    const documentUrl = decodeURIComponent(req.params.documentUrl);
    
    if (caseItem.documents) {
      // Remove document from array
      caseItem.documents = caseItem.documents.filter(doc => doc.url !== documentUrl);
      
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', 'public', documentUrl.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      caseItem.updated_at = new Date().toISOString();
      await caseItem.save();
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete case document error:');
    res.status(500).json({ detail: 'Failed to delete document' });
  }
});

// Delete case external link (admin only)
router.delete('/cases/:caseId/link/:linkIndex', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    const linkIndex = parseInt(req.params.linkIndex);
    
    if (caseItem.external_links && caseItem.external_links[linkIndex]) {
      caseItem.external_links.splice(linkIndex, 1);
      caseItem.updated_at = new Date().toISOString();
      await caseItem.save();
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete case link error:');
    res.status(500).json({ detail: 'Failed to delete link' });
  }
});

// Delete case (admin only)
router.delete('/cases/:caseId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const caseItem = await Case.findOneAndDelete({ id: req.params.caseId });
    if (!caseItem) {
      return res.status(404).json({ detail: 'Case not found' });
    }
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete case error:');
    res.status(500).json({ detail: 'Failed to delete case' });
  }
});

module.exports = router;

