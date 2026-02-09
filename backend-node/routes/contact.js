const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const { sendContactNotification, sendAutoReply } = require('../utils/email');

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Save contact to database
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    });

    // Get admin email from settings
    let adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      const settings = await Settings.findOne();
      adminEmail = settings?.contact_email || process.env.GMAIL_USER;
    }

    // Send notification email to admin (non-blocking)
    if (adminEmail) {
      sendContactNotification(contact, adminEmail).catch(err => {
        console.error('Failed to send notification email:', err);
      });
    }

    // Send auto-reply to user (non-blocking)
    sendAutoReply(contact).catch(err => {
      console.error('Failed to send auto-reply email:', err);
    });

    res.json(contact);
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ detail: 'Failed to submit contact form' });
  }
});

module.exports = router;

