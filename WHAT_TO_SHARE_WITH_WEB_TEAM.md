# What to Share with Your Web Team for Deployment

## ✅ What They Need:

### 1. MongoDB Atlas Connection String

Share these **environment variables** securely (password manager, encrypted message):

```env
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

**⚠️ SECURITY:** Share this securely - never via email or public channels!

### 2. Other Backend Environment Variables (if needed)

```env
# Server Configuration
PORT=8000
JWT_SECRET=your-strong-secret-key-change-in-production

# CORS - Allow your frontend domain
CORS_ORIGINS=https://www.drdeath.in,https://drdeath.in

# Optional: Email configuration (if using email features)
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password
```

### 3. Frontend Environment Variable

```env
REACT_APP_BACKEND_URL=https://api.drdeath.in
# OR if backend is on same domain:
# REACT_APP_BACKEND_URL=https://www.drdeath.in/api
```

**Note:** Replace `api.drdeath.in` with your actual backend API URL (ask your developer).

## ❌ What They DON'T Need:

- ❌ JSON export files - Data is already in Atlas
- ❌ Local database backups - Everything is in Atlas
- ❌ Source code files - They should have the code already
- ❌ Admin credentials - They should use their own admin account or you can create one for them

## ✅ What's Already Done:

- ✅ Data migrated to MongoDB Atlas
- ✅ All collections imported
- ✅ Admin accounts available
- ✅ Images stored in database
- ✅ Settings configured

## 📋 Quick Checklist for Your Web Team:

1. **Set environment variables** on production server with the connection string above
2. **Whitelist server IP** in MongoDB Atlas Network Access
3. **Configure backend URL** in frontend `.env`
4. **Set CORS_ORIGINS** to include your domain
5. **Test connection** - Backend should connect to Atlas
6. **Test admin login** - Should work with your credentials

## 🔒 Security Reminders:

- ✅ Share connection string securely (password manager, encrypted message)
- ✅ Don't commit `.env` files to git
- ✅ Use strong JWT_SECRET in production
- ✅ Restrict MongoDB Atlas IP access to production server only
- ✅ Change default passwords after deployment

## 📝 Example Message to Send:

```
Hi [Developer Name],

For the MongoDB Atlas connection, please use these environment variables:

MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian

Please make sure your production server IP is whitelisted in Atlas Network Access.

All data has been migrated and is ready in Atlas.

Thanks!
```

## That's It!

Just the connection string is what they need to connect your application to the database. Everything else (data, users, images, settings) is already in MongoDB Atlas.

