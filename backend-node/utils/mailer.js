'use strict';
const { Resend } = require('resend');
const logger     = require('./logger');

const SITE_NAME = 'VOICE – Medical Negligence Platform';
const FRONTEND  = process.env.FRONTEND_URL || 'http://localhost:3000';
const FROM      = 'VOICE <noreply@drdeath.in>';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) { logger.warn('RESEND_API_KEY not set — email skipped'); return null; }
  return new Resend(key);
}

async function send({ to, subject, html }) {
  const resend = getResend();
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) { logger.error({ err: error }, 'Resend error'); return false; }
    return true;
  } catch (err) {
    logger.error({ err }, 'Email send failed');
    return false;
  }
}

function wrap(body) {
  return `
  <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:24px;background:#fafaf8;border:1px solid #e2e8f0;border-radius:8px">
    <div style="border-bottom:3px solid #1a2744;padding-bottom:16px;margin-bottom:24px">
      <h1 style="margin:0;font-size:20px;color:#1a2744">${SITE_NAME}</h1>
    </div>
    ${body}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
      This email was sent by VOICE. Do not reply to this address.
    </div>
  </div>`;
}

async function sendOTP(to, name, otp) {
  return send({
    to,
    subject: `${otp} is your VOICE verification code`,
    html: wrap(`
      <p style="color:#334155;margin-bottom:8px">Hello <strong>${name}</strong>,</p>
      <p style="color:#334155">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#1a2744;background:#f1f5f9;padding:16px 24px;border-radius:8px;display:inline-block">
          ${otp}
        </span>
      </div>
      <p style="color:#64748b;font-size:14px">If you did not register on VOICE, you can safely ignore this email.</p>
    `),
  });
}

async function sendPasswordReset(to, name, token) {
  const link = `${FRONTEND}/reset-password/${token}`;
  return send({
    to,
    subject: 'Reset your VOICE password',
    html: wrap(`
      <p style="color:#334155;margin-bottom:8px">Hello <strong>${name}</strong>,</p>
      <p style="color:#334155">We received a request to reset your password. Click the button below. The link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${link}" style="background:#1a2744;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
          Reset My Password
        </a>
      </div>
      <p style="color:#64748b;font-size:13px">Or paste this link in your browser:<br/><span style="color:#0d9488">${link}</span></p>
      <p style="color:#64748b;font-size:13px">If you did not request this, you can safely ignore this email.</p>
    `),
  });
}

async function sendGrantStatus(to, name, status, adminNotes, amountApproved) {
  const approved = status === 'approved';
  return send({
    to,
    subject: approved
      ? 'Your Legal Aid application has been approved – VOICE'
      : 'Update on your Legal Aid application – VOICE',
    html: wrap(`
      <p style="color:#334155;margin-bottom:8px">Hello <strong>${name}</strong>,</p>
      ${approved
        ? `<p style="color:#334155">We are pleased to inform you that your Legal Aid application has been <strong style="color:#059669">approved</strong>.</p>
           ${amountApproved ? `<p style="color:#059669;font-size:18px;font-weight:bold">Approved assistance: ₹${Number(amountApproved).toLocaleString('en-IN')}</p>` : ''}
           <p style="color:#334155">Our team will contact you shortly with next steps.</p>`
        : `<p style="color:#334155">After review, we are unable to approve your Legal Aid application at this time.</p>`
      }
      ${adminNotes ? `<div style="background:#f8fafc;border-left:4px solid #cbd5e1;padding:12px 16px;margin:16px 0;color:#334155;font-style:italic">${adminNotes}</div>` : ''}
      <p style="color:#334155">You can view the full status on your <a href="${FRONTEND}/dashboard" style="color:#0d9488">Dashboard</a>.</p>
    `),
  });
}

async function sendAdminNewApplication(type, applicantName, applicantEmail) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return false;
  return send({
    to: adminEmail,
    subject: `New ${type} application — ${applicantName}`,
    html: wrap(`
      <p style="color:#334155">A new <strong>${type}</strong> application has been submitted.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b;width:140px">Applicant</td>
            <td style="padding:8px;border:1px solid #e2e8f0;color:#1e293b"><strong>${applicantName}</strong></td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Email</td>
            <td style="padding:8px;border:1px solid #e2e8f0;color:#1e293b">${applicantEmail}</td></tr>
      </table>
      <a href="${FRONTEND}/admin" style="background:#1a2744;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
        Review in Admin Panel
      </a>
    `),
  });
}

module.exports = { sendOTP, sendPasswordReset, sendGrantStatus, sendAdminNewApplication };
