# Email Configuration Guide

This guide explains how to set up email notifications for the contact form using **Nodemailer** with Gmail SMTP (free and works on both localhost and production).

## Quick Setup (Gmail - Recommended)

### Step 1: Create a Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification** (enable it if not already enabled)
4. After enabling 2-Step Verification, go back to Security
5. Under "How you sign in to Google", click **App passwords**
6. Select **Mail** and **Other (Custom name)**
7. Enter "VOICE Contact Form" as the name
8. Click **Generate**
9. Copy the 16-character password (you'll use this in `.env`)

### Step 2: Add to `.env` file

Add these lines to your `backend-node/.env` file:

```env
# Gmail Configuration (Free - Recommended)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Optional: Admin email to receive notifications
# If not set, uses contact_email from settings or GMAIL_USER
ADMIN_EMAIL=admin@yourdomain.com
```

### Step 3: Restart the server

```bash
cd backend-node
npm start
```

## Alternative: Custom SMTP Server

If you prefer to use a different email service (SendGrid, Mailgun, etc.), add these to `.env`:

```env
# Custom SMTP Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

## How It Works

1. **User submits contact form** → Message saved to database
2. **Admin notification email** → Sent to admin email (from settings or `ADMIN_EMAIL`)
3. **Auto-reply email** → Sent to the user confirming receipt

## Testing

1. Submit a test message through the contact form
2. Check your admin email inbox for the notification
3. Check the user's email for the auto-reply
4. Check server console for email status logs

## Troubleshooting

### Emails not sending?

1. **Check `.env` file** - Make sure credentials are correct
2. **Check server logs** - Look for email error messages
3. **Gmail App Password** - Make sure you're using an App Password, not your regular Gmail password
4. **2-Step Verification** - Must be enabled to create App Passwords

### "Less secure app access" error?

- Gmail no longer supports "less secure apps"
- You **must** use an App Password (see Step 1 above)

### Works on localhost but not production?

- Make sure `.env` file is deployed to your server
- Check that environment variables are set correctly on your hosting platform
- Some hosting providers require specific SMTP ports to be open

## Portability

This setup works identically on:
- ✅ Localhost (development)
- ✅ Production servers
- ✅ Docker containers
- ✅ Cloud platforms (AWS, Heroku, Railway, etc.)

Just make sure your `.env` file is properly configured in each environment!

