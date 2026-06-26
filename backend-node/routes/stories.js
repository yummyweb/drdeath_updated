const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const storyService = require('../services/storyService');
const { getCurrentUser } = require('../middleware/auth');
const { upload, uploadDocument } = require('../utils/upload');
const { validate, schemas } = require('../utils/validate');

router.post('/stories', getCurrentUser, validate(schemas.story), async (req, res) => {
  try {
    const story = await storyService.create(req.user.id, req.user.full_name, req.body);
    res.json(story);
  } catch (error) {
    logger.error({ err: error }, 'Create story error:');
    res.status(500).json({ detail: 'Failed to create story' });
  }
});

router.post('/stories/:storyId/images', getCurrentUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file provided' });
    const story = await storyService.addImage(req.params.storyId, req.user.id, req.file.filename);
    if (!story) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Image uploaded successfully', image_count: story.images.length });
  } catch (error) {
    logger.error({ err: error }, 'Upload image error:');
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

router.post('/stories/:storyId/document', getCurrentUser, uploadDocument.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file provided' });
    const doc = await storyService.addDocument(req.params.storyId, req.user.id, req.file, req.body.title);
    if (!doc) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Document uploaded successfully', document: doc });
  } catch (error) {
    logger.error({ err: error }, 'Upload document error:');
    res.status(500).json({ detail: error.message || 'Failed to upload document' });
  }
});

router.post('/stories/:storyId/link', getCurrentUser, async (req, res) => {
  try {
    const { title, url, type } = req.body;
    if (!title || !url) return res.status(400).json({ detail: 'Title and URL are required' });
    try { new URL(url); } catch { return res.status(400).json({ detail: 'Invalid URL format' }); }
    const link = await storyService.addLink(req.params.storyId, req.user.id, { title, url, type });
    if (!link) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Link added successfully', link });
  } catch (error) {
    logger.error({ err: error }, 'Add link error:');
    res.status(500).json({ detail: 'Failed to add link' });
  }
});

router.delete('/stories/:storyId/document/:documentUrl', getCurrentUser, async (req, res) => {
  try {
    const documentUrl = decodeURIComponent(req.params.documentUrl);
    const story = await storyService.removeDocument(req.params.storyId, req.user.id, documentUrl);
    if (!story) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete document error:');
    res.status(500).json({ detail: 'Failed to delete document' });
  }
});

router.delete('/stories/:storyId/link/:linkIndex', getCurrentUser, async (req, res) => {
  try {
    const story = await storyService.removeLink(req.params.storyId, req.user.id, parseInt(req.params.linkIndex));
    if (!story) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete link error:');
    res.status(500).json({ detail: 'Failed to delete link' });
  }
});

router.get('/stories/my', getCurrentUser, async (req, res) => {
  try {
    const stories = await storyService.getByUser(req.user.id);
    res.json(stories);
  } catch (error) {
    logger.error({ err: error }, 'Get my stories error:');
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});

router.get('/stories/approved', async (req, res) => {
  try {
    const stories = await storyService.getApproved();
    res.json(stories);
  } catch (error) {
    logger.error({ err: error }, 'Get approved stories error:');
    res.status(500).json({ detail: 'Failed to fetch stories' });
  }
});

router.put('/stories/:storyId', getCurrentUser, async (req, res) => {
  try {
    const story = await storyService.update(req.params.storyId, req.user.id, req.body);
    if (!story) return res.status(404).json({ detail: 'Story not found' });
    res.json(story);
  } catch (error) {
    logger.error({ err: error }, 'Update story error:');
    res.status(500).json({ detail: 'Failed to update story' });
  }
});

router.get('/stories/:storyId', async (req, res) => {
  try {
    const story = await storyService.getById(req.params.storyId);
    if (!story) return res.status(404).json({ detail: 'Story not found' });
    res.json(story);
  } catch (error) {
    logger.error({ err: error }, 'Get story error:');
    res.status(500).json({ detail: 'Failed to fetch story' });
  }
});

router.delete('/stories/:storyId', getCurrentUser, async (req, res) => {
  try {
    const deleted = await storyService.remove(req.params.storyId, req.user.id);
    if (!deleted) return res.status(404).json({ detail: 'Story not found' });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete story error:');
    res.status(500).json({ detail: 'Failed to delete story' });
  }
});

module.exports = router;
