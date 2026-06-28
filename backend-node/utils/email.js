'use strict';
const { Resend } = require('resend');

const FROM = 'VOICE <noreply@drdeath.in>';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('⚠️  RESEND_API_KEY not set. Emails will not be sent.'); return null; }
  return new Resend(key);
}

async function send({ to, subject, html, replyTo }) {
  const resend = getResend();
  if (!resend) return false;
  try {
    const payload = { from: FROM, to, subject, html };
    if (replyTo) payload.reply_to = replyTo;
    const { error } = await resend.emails.send(payload);
    if (error) { console.error('❌ Resend error:', error); return false; }
    console.log('✅ Email sent via Resend to:', to);
    return true;
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return false;
  }
}

// ── Contact form ──────────────────────────────────────────────────────────────

const sendContactNotification = async (contactData, adminEmail) => {
  return send({
    to: adminEmail,
    subject: `New Contact Form Submission: ${contactData.subject}`,
    replyTo: contactData.email,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0F172A;">New Contact Form Submission</h2>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
          ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${contactData.subject}</p>
        </div>
        <div style="background:#fff;padding:20px;border-left:4px solid #B45309;margin:20px 0;">
          <h3 style="color:#0F172A;margin-top:0;">Message:</h3>
          <p style="white-space:pre-wrap;color:#334155;">${contactData.message}</p>
        </div>
        <p style="color:#64748b;font-size:12px;">You can reply directly to this email to respond to ${contactData.name}.</p>
      </div>
    `,
  });
};

const sendAutoReply = async (contactData) => {
  return send({
    to: contactData.email,
    subject: 'Thank you for contacting VOICE',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0F172A;">Thank You for Contacting VOICE</h2>
        <p>Dear ${contactData.name},</p>
        <p>Thank you for reaching out to VOICE - Victims' Outreach &amp; Initiative for Crime of Medical Negligence.</p>
        <p>We have received your message regarding "<strong>${contactData.subject}</strong>" and our team will review it and get back to you within 2-3 business days.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#0F172A;margin-top:0;">What happens next?</h3>
          <ul style="color:#334155;">
            <li>Our team will review your message</li>
            <li>We'll respond to you at <strong>${contactData.email}</strong></li>
            <li>Response time: 2-3 business days</li>
          </ul>
        </div>
        <p style="color:#64748b;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    `,
  });
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

const sendApplicationAlert = async (applicantName, applicantEmail, opportunityTitle, adminEmail) => {
  return send({
    to: adminEmail,
    subject: `New Application: ${opportunityTitle}`,
    replyTo: applicantEmail,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0F172A;">New Application Received</h2>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p><strong>Email:</strong> <a href="mailto:${applicantEmail}">${applicantEmail}</a></p>
          <p><strong>Position:</strong> ${opportunityTitle}</p>
        </div>
        <p>Log in to the <a href="${FRONTEND}/admin/opportunities">Admin Panel</a> to review the application.</p>
        <p style="color:#64748b;font-size:12px;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;">VOICE — automated notification</p>
      </div>
    `,
  });
};

const sendApplicationConfirmation = async (applicantName, applicantEmail, opportunityTitle) => {
  return send({
    to: applicantEmail,
    subject: `Application Received — ${opportunityTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0F172A;">Your Application Has Been Received</h2>
        <p>Dear ${applicantName},</p>
        <p>Thank you for applying for <strong>${opportunityTitle}</strong> at VOICE.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#0F172A;margin-top:0;">What happens next?</h3>
          <ul style="color:#334155;line-height:1.8;">
            <li>Our team will review your application</li>
            <li>You will receive an email if your status changes</li>
            <li>You can track your application status in your dashboard</li>
          </ul>
        </div>
        <p style="color:#64748b;font-size:12px;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;">
          VOICE — Victims' Outreach &amp; Initiative for Crime of Medical Negligence
        </p>
      </div>
    `,
  });
};

const sendApplicationStatusUpdate = async (applicantName, applicantEmail, opportunityTitle, status, note) => {
  const label  = STATUS_LABELS[status]  || status;
  const colour = STATUS_COLOURS[status] || '#0F172A';
  return send({
    to: applicantEmail,
    subject: `Application Update — ${opportunityTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0F172A;">Application Status Update</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application for <strong>${opportunityTitle}</strong> has been updated.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid ${colour};">
          <p style="margin:0;font-size:18px;font-weight:bold;color:${colour};">${label}</p>
          ${note ? `<p style="margin-top:12px;color:#334155;">${note}</p>` : ''}
        </div>
        <p>You can view your full application history in your <a href="${FRONTEND}/dashboard">dashboard</a>.</p>
        <p style="color:#64748b;font-size:12px;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;">
          VOICE — Victims' Outreach &amp; Initiative for Crime of Medical Negligence
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendContactNotification,
  sendAutoReply,
  sendApplicationAlert,
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
};
