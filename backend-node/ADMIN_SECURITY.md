# Admin Security & Access Control

## Overview

Administrator accounts are **completely disabled** from frontend registration for security reasons. All admin users must be created through secure server-side methods.

## Creating Admin Users

### Method 1: CLI Script (Recommended)

Use the secure admin creation script:

```bash
cd backend-node
node scripts/create-admin.js <email> <password> <full_name> [phone]
```

**Example:**
```bash
node scripts/create-admin.js admin@example.com SecurePassword123 "Admin Name" "+91 1234567890"
```

**Requirements:**
- Email must be valid
- Password must be at least 8 characters
- Full name is required
- Phone is optional

**Features:**
- Validates input
- Checks for existing users
- Can convert existing users to admin (with warning)
- Secure password hashing
- Provides confirmation output

### Method 2: MongoDB Direct (Advanced)

If you have direct MongoDB access, you can create an admin user directly:

```javascript
// Connect to MongoDB
use legal_guardian

// Hash password (use bcrypt with 10 rounds)
// Password: "your-secure-password"
// Hashed: "$2a$10$..." (generate using Node.js bcrypt)

db.users.insertOne({
  id: "unique-uuid-here", // Generate using uuid
  email: "admin@example.com",
  password: "$2a$10$...", // Bcrypt hashed password
  full_name: "Administrator",
  phone: null,
  role: "admin",
  created_at: new Date().toISOString()
})
```

⚠️ **Warning:** This method requires direct database access and manual password hashing. The CLI script is safer and recommended.

## Access Control

### Backend Protection

- **Registration Endpoint:** `/api/auth/register` explicitly rejects any attempts to create admin users
- **Admin Routes:** All admin endpoints require authentication and admin role verification via `requireAdmin` middleware
- **Role Verification:** Every admin request checks the user's role from the JWT token

### Frontend Protection

- **Route Guards:** Admin routes (`/admin`, `/admin/settings`) check for admin role before rendering
- **Authentication:** Users must be logged in and have `role: 'admin'` to access admin pages
- **Automatic Redirect:** Non-admin users attempting to access admin pages are redirected to their dashboard

## Admin Routes (All Require Authentication + Admin Role)

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/stories` - All stories management
- `PUT /api/admin/stories/:id/moderate` - Moderate stories
- `GET /api/admin/contacts` - Contact submissions
- `GET /api/admin/advocates` - Advocate applications
- `PUT /api/admin/advocates/:id/moderate` - Moderate advocates
- `GET /api/admin/grants` - Grant applications
- `PUT /api/admin/grants/:id/moderate` - Moderate grants
- `GET /api/admin/merchandise` - Merchandise management
- `GET /api/admin/orders` - Order management
- `PUT /api/admin/orders/:id/status` - Update order status
- `PUT /api/admin/settings` - Update site settings
- `POST /api/admin/settings/logo` - Upload logo
- `POST /api/admin/settings/professional-image` - Upload professional image
- `PUT /api/admin/credentials` - Update admin credentials

## Security Best Practices

1. **Strong Passwords:** Use passwords with at least 12 characters, including uppercase, lowercase, numbers, and symbols
2. **Unique Emails:** Each admin should have a unique email address
3. **Limit Admin Count:** Only create as many admin accounts as necessary
4. **Regular Audits:** Periodically review admin accounts and remove unused ones
5. **Credential Updates:** Change default admin password immediately after setup
6. **Environment Variables:** Keep sensitive configuration in `.env` files (never commit to git)

## Default Admin Account

On first startup, the server creates a default admin account:

- **Email:** `admin@admin.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login using the admin panel (`/admin/settings`) or by creating a new admin and deleting the default one.

## Troubleshooting

### "Admin registration is not allowed"
- This is expected behavior. Admin users cannot be created through the frontend registration form.
- Use the CLI script: `node scripts/create-admin.js`

### "Admin access required" when logged in
- Your user account does not have `role: 'admin'` in the database
- Use the CLI script to create an admin account or update your existing user's role

### Cannot access admin panel
1. Verify you're logged in
2. Check your user's role in the database (should be `'admin'`)
3. Try logging out and logging back in
4. Clear browser cache and localStorage

