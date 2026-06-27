const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // If SMTP credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Fallback: Use Gmail with app password (most common free option)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  
  // If no email config, return null (emails won't be sent but won't crash)
  console.warn('⚠️  No email configuration found. Emails will not be sent.');
  return null;
};

// Send contact form notification email
const sendContactNotification = async (contactData, adminEmail) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email not sent (no email config). Contact saved to database.');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@voice.org',
      to: adminEmail,
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A;">New Contact Form Submission</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
            ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
            <p><strong>Subject:</strong> ${contactData.subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #B45309; margin: 20px 0;">
            <h3 style="color: #0F172A; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #334155;">${contactData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This is an automated notification from the VOICE contact form.</p>
            <p>You can reply directly to this email to respond to ${contactData.name}.</p>
          </div>
        </div>
      `,
      replyTo: contactData.email // Allows replying directly to the sender
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact notification email:', error);
    // Don't throw error - we still want to save the contact even if email fails
    return false;
  }
};

// Send auto-reply to contact form submitter
const sendAutoReply = async (contactData) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@voice.org',
      to: contactData.email,
      subject: 'Thank you for contacting VOICE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A;">Thank You for Contacting VOICE</h2>
          
          <p>Dear ${contactData.name},</p>
          
          <p>Thank you for reaching out to VOICE - Victims' Outreach & Initiative for Crime of Medical Negligence.</p>
          
          <p>We have received your message regarding "<strong>${contactData.subject}</strong>" and our team will review it and get back to you within 2-3 business days.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0F172A; margin-top: 0;">What happens next?</h3>
            <ul style="color: #334155;">
              <li>Our team will review your message</li>
              <li>We'll respond to you at <strong>${contactData.email}</strong></li>
              <li>Response time: 2-3 business days</li>
            </ul>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If you have any urgent questions, please don't hesitate to reach out again.
          </p>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending auto-reply email:', error);
    return false;
  }
};

// ── Application emails ────────────────────────────────────────────────────────

const STATUS_LABELS = {
  applied:      'Application Received',
  under_review: 'Under Review',
  shortlisted:  'Shortlisted',
  interview:    'Interview Scheduled',
  selected:     'Selected',
  rejected:     'Not Selected',
  withdrawn:    'Withdrawn',
};

const STATUS_COLOURS = {
  applied:      '#0F172A',
  under_review: '#B45309',
  shortlisted:  '#0369a1',
  interview:    '#7c3aed',
  selected:     '#15803d',
  rejected:     '#b91c1c',
  withdrawn:    '#64748b',
};

// Email to admin when a new application arrives
const sendApplicationAlert = async (applicantName, applicantEmail, opportunityTitle, adminEmail) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@voice.org',
      to: adminEmail,
      subject: `New Application: ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A;">New Application Received</h2>
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> <a href="mailto:${applicantEmail}">${applicantEmail}</a></p>
            <p><strong>Position:</strong> ${opportunityTitle}</p>
          </div>
          <p>Log in to the <a href="${process.env.FRONTEND_URL || ''}/admin/opportunities">Admin Panel</a> to review the application.</p>
          <p style="color:#64748b; font-size:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:16px;">
            VOICE — automated notification
          </p>
        </div>
      `,
      replyTo: applicantEmail,
    });
    return true;
  } catch (err) {
    console.error('❌ sendApplicationAlert:', err.message);
    return false;
  }
};

// Confirmation email to applicant right after they apply
const sendApplicationConfirmation = async (applicantName, applicantEmail, opportunityTitle) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@voice.org',
      to: applicantEmail,
      subject: `Application Received — ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A;">Your Application Has Been Received</h2>
          <p>Dear ${applicantName},</p>
          <p>Thank you for applying for <strong>${opportunityTitle}</strong> at VOICE.</p>
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
            <h3 style="color:#0F172A; margin-top:0;">What happens next?</h3>
            <ul style="color:#334155; line-height:1.8;">
              <li>Our team will review your application</li>
              <li>You will receive an email if your status changes</li>
              <li>You can track your application status in your dashboard</li>
            </ul>
          </div>
          <p style="color:#64748b; font-size:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:16px;">
            VOICE — Victims' Outreach &amp; Initiative for Crime of Medical Negligence
          </p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('❌ sendApplicationConfirmation:', err.message);
    return false;
  }
};

// Status update email to applicant
const sendApplicationStatusUpdate = async (applicantName, applicantEmail, opportunityTitle, status, note) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  const label  = STATUS_LABELS[status]  || status;
  const colour = STATUS_COLOURS[status] || '#0F172A';
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@voice.org',
      to: applicantEmail,
      subject: `Application Update — ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A;">Application Status Update</h2>
          <p>Dear ${applicantName},</p>
          <p>Your application for <strong>${opportunityTitle}</strong> has been updated.</p>
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0; border-left:4px solid ${colour};">
            <p style="margin:0; font-size:18px; font-weight:bold; color:${colour};">${label}</p>
            ${note ? `<p style="margin-top:12px; color:#334155;">${note}</p>` : ''}
          </div>
          <p>You can view your full application history in your
            <a href="${process.env.FRONTEND_URL || ''}/dashboard">dashboard</a>.
          </p>
          <p style="color:#64748b; font-size:12px; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:16px;">
            VOICE — Victims' Outreach &amp; Initiative for Crime of Medical Negligence
          </p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('❌ sendApplicationStatusUpdate:', err.message);
    return false;
  }
};

module.exports = {
  sendContactNotification,
  sendAutoReply,
  sendApplicationAlert,
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
};

