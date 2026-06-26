const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Merchandise = require('../models/Merchandise');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// Create merchandise (admin only)
router.post('/merchandise', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category, is_active } = req.body;
    
    const merchandise = await Merchandise.create({
      name,
      description,
      price,
      stock: stock || 0,
      category: category || 'General',
      is_active: is_active !== undefined ? is_active : true
    });

    res.json(merchandise);
  } catch (error) {
    logger.error({ err: error }, 'Create merchandise error:');
    res.status(500).json({ detail: 'Failed to create merchandise' });
  }
});

// Get all active merchandise (public)
router.get('/merchandise', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { is_active: true };
    if (category) {
      query.category = category;
    }
    const items = await Merchandise.find(query).sort({ created_at: -1 }).limit(100);
    res.json(items);
  } catch (error) {
    logger.error({ err: error }, 'Get merchandise error:');
    res.status(500).json({ detail: 'Failed to fetch merchandise' });
  }
});

// Get merchandise by ID (public)
router.get('/merchandise/:merchandiseId', async (req, res) => {
  try {
    const item = await Merchandise.findOne({ id: req.params.merchandiseId, is_active: true });
    if (!item) {
      return res.status(404).json({ detail: 'Merchandise not found' });
    }
    res.json(item);
  } catch (error) {
    logger.error({ err: error }, 'Get merchandise item error:');
    res.status(500).json({ detail: 'Failed to fetch merchandise' });
  }
});

// Update merchandise (admin only)
router.put('/merchandise/:merchandiseId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const item = await Merchandise.findOne({ id: req.params.merchandiseId });
    if (!item) {
      return res.status(404).json({ detail: 'Merchandise not found' });
    }

    const { name, description, price, stock, category, is_active } = req.body;
    
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (stock !== undefined) item.stock = stock;
    if (category !== undefined) item.category = category;
    if (is_active !== undefined) item.is_active = is_active;
    
    item.updated_at = new Date().toISOString();
    await item.save();

    res.json(item);
  } catch (error) {
    logger.error({ err: error }, 'Update merchandise error:');
    res.status(500).json({ detail: 'Failed to update merchandise' });
  }
});

// Delete/deactivate merchandise (admin only)
router.delete('/merchandise/:merchandiseId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const item = await Merchandise.findOne({ id: req.params.merchandiseId });
    if (!item) {
      return res.status(404).json({ detail: 'Merchandise not found' });
    }

    item.is_active = false;
    item.updated_at = new Date().toISOString();
    await item.save();

    res.json({ message: 'Merchandise deactivated successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete merchandise error:');
    res.status(500).json({ detail: 'Failed to delete merchandise' });
  }
});

// Upload merchandise image (admin only)
router.post('/merchandise/:merchandiseId/image', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const item = await Merchandise.findOne({ id: req.params.merchandiseId });
    if (!item) {
      return res.status(404).json({ detail: 'Merchandise not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Delete old image file if it exists (not base64)
    if (item.image_url && !item.image_url.startsWith('data:')) {
      const oldFilePath = path.join(__dirname, '..', 'public', item.image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL path for the uploaded file
    const imageUrl = `/uploads/images/merchandise/${req.file.filename}`;

    item.image_url = imageUrl;
    item.updated_at = new Date().toISOString();
    await item.save();

    res.json({ message: 'Image uploaded successfully', image_url: imageUrl });
  } catch (error) {
    logger.error({ err: error }, 'Upload merchandise image error:');
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

// Get all merchandise (admin only - includes inactive)
router.get('/admin/merchandise', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const items = await Merchandise.find({}).sort({ created_at: -1 }).limit(500);
    res.json(items);
  } catch (error) {
    logger.error({ err: error }, 'Admin get merchandise error:');
    res.status(500).json({ detail: 'Failed to fetch merchandise' });
  }
});

module.exports = router;

