const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const { sendContactNotification, sendAutoReply } = require('../utils/email');
const { validate, schemas } = require('../utils/validate');

// Submit contact form
router.post('/contact', validate(schemas.contact), async (req, res) => {
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
        logger.error({ err: err }, 'Failed to send notification email:');
      });
    }

    // Send auto-reply to user (non-blocking)
    sendAutoReply(contact).catch(err => {
      logger.error({ err: err }, 'Failed to send auto-reply email:');
    });

    res.json(contact);
  } catch (error) {
    logger.error({ err: error }, 'Contact submission error:');
    res.status(500).json({ detail: 'Failed to submit contact form' });
  }
});

module.exports = router;

