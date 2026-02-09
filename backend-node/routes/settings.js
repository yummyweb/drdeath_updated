const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Settings = require('../models/Settings');
const User = require('../models/User');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/auth');
const { upload } = require('../utils/upload');

// Get site settings (public, but route is in public.js)

// Update site settings (admin)
router.put('/admin/settings', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'No updates provided' });
    }

    const settings = await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ detail: 'Failed to update settings' });
  }
});

// Upload logo (admin)
router.post('/admin/settings/logo', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Get existing settings to delete old logo file
    const existingSettings = await Settings.findOne({ _id: 'site_settings' });
    if (existingSettings && existingSettings.logo_url && !existingSettings.logo_url.startsWith('data:')) {
      // Delete old file if it exists (not base64)
      const oldFilePath = path.join(__dirname, '..', 'public', existingSettings.logo_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL path for the uploaded file
    const logoUrl = `/uploads/images/settings/${req.file.filename}`;

    await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: { logo_url: logoUrl } },
      { upsert: true }
    );

    res.json({ message: 'Logo uploaded successfully', logo_url: logoUrl });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ detail: 'Failed to upload logo' });
  }
});

// Upload professional image (admin)
router.post('/admin/settings/professional-image', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Get existing settings to delete old image file
    const existingSettings = await Settings.findOne({ _id: 'site_settings' });
    if (existingSettings && existingSettings.professional_image_url && !existingSettings.professional_image_url.startsWith('data:')) {
      // Delete old file if it exists (not base64)
      const oldFilePath = path.join(__dirname, '..', 'public', existingSettings.professional_image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL path for the uploaded file
    const professionalImageUrl = `/uploads/images/settings/${req.file.filename}`;

    await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: { professional_image_url: professionalImageUrl } },
      { upsert: true }
    );

    res.json({ message: 'Professional image uploaded successfully', professional_image_url: professionalImageUrl });
  } catch (error) {
    console.error('Upload professional image error:', error);
    res.status(500).json({ detail: 'Failed to upload professional image' });
  }
});

// Update admin credentials
router.put('/admin/credentials', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { current_password, new_email, new_password } = req.body;

    // Get full user with password
    const adminFull = await User.findOne({ id: req.user.id });
    if (!adminFull) {
      return res.status(404).json({ detail: 'Admin user not found' });
    }

    // Verify current password
    const isValid = await verifyPassword(current_password, adminFull.password);
    if (!isValid) {
      return res.status(400).json({ detail: 'Current password is incorrect' });
    }

    const updateData = {};

    if (new_email) {
      const existing = await User.findOne({ email: new_email, id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ detail: 'Email already in use' });
      }
      updateData.email = new_email;
    }

    if (new_password) {
      if (new_password.length < 6) {
        return res.status(400).json({ detail: 'Password must be at least 6 characters' });
      }
      updateData.password = await hashPassword(new_password);
    }

    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ id: req.user.id }, { $set: updateData });
    }

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ detail: 'Failed to update credentials' });
  }
});

module.exports = router;

