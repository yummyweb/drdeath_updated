# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Sign Up for MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create an account (use Google, GitHub, or email)

### 2. Create a Free Cluster

1. After signing up, you'll be asked to:
   - **Choose a cloud provider**: AWS, Google Cloud, or Azure (all free tier)
   - **Choose a region**: Pick closest to your users
   - **Choose cluster tier**: Select **M0 Free** (512MB storage, shared resources)
   - Click "Create Cluster"

2. Wait 3-5 minutes for cluster to be created

### 3. Set Up Database Access (Create User)

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose authentication method: **"Password"**
4. Enter:
   - **Username**: (e.g., `voice_admin` or your email)
   - **Password**: Click "Autogenerate Secure Password" (SAVE THIS!) or create your own
   - **Database User Privileges**: Select **"Atlas admin"** (or "Read and write to any database")
5. Click **"Add User"**
6. **IMPORTANT**: Copy and save the password securely - you won't see it again!

### 4. Configure Network Access (Whitelist IPs)

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development/testing:
   - Click **"Allow Access from Anywhere"** (IP: `0.0.0.0/0`)
   - ⚠️ This is okay for development but restrict IPs for production
4. For production (recommended):
   - Click **"Add Current IP Address"** (adds your IP)
   - Or add your server's IP address
   - Or add specific IP ranges
5. Click **"Confirm"**

### 5. Get Your Connection String

1. In the left sidebar, click **"Database"** (or "Overview")
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **"Driver"**: Node.js
5. Choose **"Version"**: 5.5 or later
6. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Complete Your Connection String

Replace the placeholders in the connection string:

```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legal_guardian?retryWrites=true&w=majority
```

**Important parts:**
- Replace `<username>` with the database user you created (e.g., `voice_admin`)
- Replace `<password>` with the password you saved
- Add `/legal_guardian` after `.net/` (this is your database name)
- Keep the `?retryWrites=true&w=majority` part

**Final example:**
```
mongodb+srv://voice_admin:MySecurePass123@cluster0.abc123.mongodb.net/legal_guardian?retryWrites=true&w=majority
```

### 7. Share with Your Developer

Share these environment variables securely:

```
MONGO_URL=mongodb+srv://voice_admin:MySecurePass123@cluster0.abc123.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

⚠️ **SECURITY**: Share this via secure channel (password manager, encrypted message, not via email/chat)

### 8. Test the Connection (Optional)

You can test if the connection works from your local machine:

```bash
cd backend-node
# Update .env with your Atlas connection string
MONGO_URL=mongodb+srv://your-connection-string
npm start
```

You should see: `✅ MongoDB connected`

## Migration: Moving Data from Local to Atlas

If you have data in your local MongoDB, you can migrate it:

### Option 1: Using mongodump and mongorestore

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/legal_guardian" --out=./backup

# Import to Atlas
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/legal_guardian" ./backup/legal_guardian
```

### Option 2: Using MongoDB Compass (GUI Tool)

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect to local MongoDB
3. Export collections
4. Connect to Atlas
5. Import collections

## Security Best Practices

1. **Strong Passwords**: Use a strong, unique password for your database user
2. **IP Whitelisting**: For production, only allow specific IP addresses
3. **Regular Backups**: Atlas free tier includes automated backups
4. **Monitoring**: Set up alerts in Atlas dashboard
5. **Rotate Credentials**: Change passwords periodically

## Free Tier Limitations

- **Storage**: 512 MB (good for small to medium applications)
- **RAM**: Shared resources
- **No dedicated IP**: Uses shared cluster IPs
- **Backups**: Automated backups included

## When to Upgrade

Consider upgrading from free tier when:
- You exceed 512 MB storage
- You need more performance
- You need dedicated resources
- You need advanced features (analytics, data lake, etc.)

## Troubleshooting

### "Authentication failed"
- Check username and password are correct
- Make sure you URL-encoded special characters in password
- Verify database user exists in Atlas

### "IP not whitelisted"
- Add your IP address in Network Access
- For development, you can temporarily allow all IPs (0.0.0.0/0)

### "Connection timeout"
- Check your internet connection
- Verify cluster is running (check Atlas dashboard)
- Check firewall settings

## Support

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Community Support: https://www.mongodb.com/community/forums/

