const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Settings = require('../models/Settings');
const User = require('../models/User');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/auth');
const { upload } = require('../utils/upload');

// Allowlist of fields that may be updated via the admin settings endpoint.
// Prevents mass-assignment of arbitrary fields into the settings document.
const ALLOWED_SETTINGS_FIELDS = new Set([
  'site_name', 'tagline', 'contact_email', 'contact_phone', 'address',
  'upi_id', 'upi_payee_name',
  'bank_account_name', 'bank_account_number', 'bank_ifsc',
  'bank_name', 'bank_branch', 'bank_swift', 'bank_beneficiary_address',
  'hero_title', 'hero_subtitle',
  'about_mission', 'about_vision',
  'facebook_url', 'twitter_url', 'instagram_url',
  'stats_years_of_service', 'stats_cases_resolved',
  'professional_name', 'professional_title', 'professional_bio',
  'resources_hero_title', 'resources_hero_description', 'resources_content'
]);

// Update site settings (admin)
router.put('/admin/settings', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (ALLOWED_SETTINGS_FIELDS.has(key) && req.body[key] !== undefined && req.body[key] !== null) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'No valid updates provided' });
    }

    const settings = await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    logger.error({ err: error }, 'Update settings error:');
    res.status(500).json({ detail: 'Failed to update settings' });
  }
});

// Upload logo (admin)
router.post('/admin/settings/logo', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const existingSettings = await Settings.findOne({ _id: 'site_settings' });
    if (existingSettings?.logo_url && !existingSettings.logo_url.startsWith('data:')) {
      const oldFilePath = path.join(__dirname, '..', 'public', existingSettings.logo_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    const logoUrl = `/uploads/images/settings/${req.file.filename}`;
    await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: { logo_url: logoUrl } },
      { upsert: true }
    );

    res.json({ message: 'Logo uploaded successfully', logo_url: logoUrl });
  } catch (error) {
    logger.error({ err: error }, 'Upload logo error:');
    res.status(500).json({ detail: 'Failed to upload logo' });
  }
});

// Upload professional image (admin)
router.post('/admin/settings/professional-image', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    const existingSettings = await Settings.findOne({ _id: 'site_settings' });
    if (existingSettings?.professional_image_url && !existingSettings.professional_image_url.startsWith('data:')) {
      const oldFilePath = path.join(__dirname, '..', 'public', existingSettings.professional_image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    const professionalImageUrl = `/uploads/images/settings/${req.file.filename}`;
    await Settings.findOneAndUpdate(
      { _id: 'site_settings' },
      { $set: { professional_image_url: professionalImageUrl } },
      { upsert: true }
    );

    res.json({ message: 'Professional image uploaded successfully', professional_image_url: professionalImageUrl });
  } catch (error) {
    logger.error({ err: error }, 'Upload professional image error:');
    res.status(500).json({ detail: 'Failed to upload professional image' });
  }
});

// Update admin credentials
router.put('/admin/credentials', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { current_password, new_email, new_password } = req.body;

    if (!current_password) {
      return res.status(400).json({ detail: 'Current password is required' });
    }

    const adminFull = await User.findOne({ id: req.user.id });
    if (!adminFull) {
      return res.status(404).json({ detail: 'Admin user not found' });
    }

    const isValid = await verifyPassword(current_password, adminFull.password);
    if (!isValid) {
      return res.status(400).json({ detail: 'Current password is incorrect' });
    }

    const updateData = {};

    if (new_email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
        return res.status(400).json({ detail: 'Invalid email format' });
      }
      const existing = await User.findOne({ email: new_email, id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ detail: 'Email already in use' });
      }
      updateData.email = new_email.toLowerCase();
    }

    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ detail: 'Password must be at least 8 characters' });
      }
      updateData.password = await hashPassword(new_password);
    }

    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ id: req.user.id }, { $set: updateData });
    }

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Update credentials error:');
    res.status(500).json({ detail: 'Failed to update credentials' });
  }
});

module.exports = router;
