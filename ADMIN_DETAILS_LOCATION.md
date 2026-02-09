# Where Are Admin Details Stored?

## Location:

**Database:** `legal_guardian`  
**Collection:** `users`  
**Filter:** Documents where `role: "admin"`

## Admin User Structure:

Admin users are stored in the `users` collection with the following fields:

```json
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "email": "admin@example.com",
  "password": "$2b$10$...hashed...",  // Bcrypt hashed password
  "full_name": "Administrator Name",
  "phone": "optional-phone-number",
  "role": "admin",  // ← This field identifies admin users
  "created_at": "2025-12-21T05:29:49.660Z"
}
```

## Your Admin Account:

Based on earlier migration, your admin account should be:

**Email:** `mailfornishantverma@gmail.com`  
**Password:** `Elizian@123` (hashed in database)  
**Role:** `admin`  
**Name:** `Nishant Bharihoke`

## How to View Admin Details:

### Option 1: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your Atlas cluster
3. Go to `legal_guardian` database
4. Click on `users` collection
5. Filter by `role: "admin"` or search for admin email
6. View admin user documents

### Option 2: Admin Panel (Web Interface)

1. Go to: https://www.drdeath.in/admin/settings
2. Login with admin credentials
3. Go to "Credentials" tab (if available)
4. View/update admin account details

### Option 3: Database Query

```javascript
// In MongoDB shell or Compass query
db.users.find({ role: "admin" })
```

## Important Fields:

- **email** - Admin login email
- **password** - Bcrypt hashed (cannot be decrypted, only reset)
- **full_name** - Admin's display name
- **role** - Must be `"admin"` (not `"user"`)
- **id** - Unique identifier (UUID)

## Security Notes:

⚠️ **Passwords are hashed** - The password field contains a bcrypt hash, not the actual password. You cannot "see" the original password.

🔒 **To change password:**
- Use admin panel settings page
- Or use the create-admin script to reset password
- Or update directly in database (requires re-hashing the password)

## Finding All Admin Users:

To see all admin accounts:

```javascript
// MongoDB query
db.users.find({ role: "admin" }, { email: 1, full_name: 1, role: 1, created_at: 1 })
```

This will show all admin users without showing the password hash.

## Your Current Admin Users:

Based on your data migration, you likely have these admin users:

1. **mailfornishantverma@gmail.com** - Nishant Bharihoke (role: admin)
2. **admin@admin.com** - Administrator (default admin, if it exists)
3. Possibly others depending on your local database

All stored in: `legal_guardian.users` collection with `role: "admin"`

