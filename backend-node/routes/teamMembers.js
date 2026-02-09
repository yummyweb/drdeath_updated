const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const TeamMember = require('../models/TeamMember');
const { getCurrentUser, requireAdmin } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// Get all team members (public)
router.get('/team-members', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, created_at: -1 });
    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ detail: 'Failed to fetch team members' });
  }
});

// Get single team member (public)
router.get('/team-members/:memberId', async (req, res) => {
  try {
    const member = await TeamMember.findOne({ id: req.params.memberId });
    if (!member) {
      return res.status(404).json({ detail: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ detail: 'Failed to fetch team member' });
  }
});

// Create team member (admin only)
router.post('/team-members', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { name, title, bio, email, linkedin_url, order } = req.body;
    
    const member = await TeamMember.create({
      name,
      title,
      bio: bio || '',
      email: email || '',
      linkedin_url: linkedin_url || '',
      order: order || 0
    });

    res.json(member);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ detail: 'Failed to create team member' });
  }
});

// Update team member (admin only)
router.put('/team-members/:memberId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const { name, title, bio, email, linkedin_url, order } = req.body;
    const member = await TeamMember.findOne({ id: req.params.memberId });
    
    if (!member) {
      return res.status(404).json({ detail: 'Team member not found' });
    }

    member.name = name || member.name;
    member.title = title || member.title;
    member.bio = bio !== undefined ? bio : member.bio;
    member.email = email !== undefined ? email : member.email;
    member.linkedin_url = linkedin_url !== undefined ? linkedin_url : member.linkedin_url;
    member.order = order !== undefined ? order : member.order;
    member.updated_at = new Date().toISOString();
    
    await member.save();

    res.json(member);
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ detail: 'Failed to update team member' });
  }
});

// Upload team member image (admin only)
router.post('/team-members/:memberId/image', getCurrentUser, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const member = await TeamMember.findOne({ id: req.params.memberId });
    if (!member) {
      return res.status(404).json({ detail: 'Team member not found' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }

    // Delete old image file if it exists (not base64)
    if (member.image_url && !member.image_url.startsWith('data:')) {
      const oldFilePath = path.join(__dirname, '..', 'public', member.image_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL path for the uploaded file
    const imageUrl = `/uploads/images/team-members/${req.file.filename}`;

    member.image_url = imageUrl;
    member.updated_at = new Date().toISOString();
    await member.save();

    res.json({ message: 'Image uploaded successfully', image_url: imageUrl });
  } catch (error) {
    console.error('Upload team member image error:', error);
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

// Delete team member (admin only)
router.delete('/team-members/:memberId', getCurrentUser, requireAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findOneAndDelete({ id: req.params.memberId });
    if (!member) {
      return res.status(404).json({ detail: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ detail: 'Failed to delete team member' });
  }
});

module.exports = router;

