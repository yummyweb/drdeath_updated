const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Settings = require('../models/Settings');

// Get public stats
router.get('/stats/public', async (req, res) => {
  try {
    const total_stories = await Story.countDocuments({ status: 'approved' });
    const total_users = await User.countDocuments({ role: 'user' });
    const total_advocates = await Advocate.countDocuments({ status: 'approved' });
    
    const settings = await Settings.findOne({ _id: 'site_settings' });
    const years = settings?.stats_years_of_service || 5;
    const cases = settings?.stats_cases_resolved || 150;
    
    res.json({
      stories_shared: total_stories,
      victims_supported: total_users,
      advocates_registered: total_advocates,
      years_of_service: years,
      cases_resolved: cases
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ detail: 'Failed to fetch stats' });
  }
});

// Get site settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ _id: 'site_settings' });
    if (!settings) {
      // Return defaults
      settings = {
        site_name: "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence",
        tagline: '',
        logo_url: null,
        contact_email: '',
        contact_phone: null,
        address: null,
        upi_id: '',
        upi_payee_name: '',
        hero_title: '',
        hero_subtitle: '',
        about_mission: '',
        about_vision: '',
        facebook_url: null,
        twitter_url: null,
        instagram_url: null,
        stats_years_of_service: 1,
        stats_cases_resolved: 0,
        professional_image_url: null,
        professional_name: null,
        professional_title: null,
        professional_bio: null
      };
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ detail: 'Failed to fetch settings' });
  }
});

module.exports = router;

