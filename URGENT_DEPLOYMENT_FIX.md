# URGENT: Fix Site Downtime - Image Storage Migration

## Current Situation
Your site `drdeath.in` is down with `ERR_CONNECTION_TIMED_OUT`. This is likely due to:
- **Database size exceeded** (Base64 images bloating MongoDB)
- **Server crashed** from memory/connection issues
- **Database connection limits** reached

## Solution: Deploy File Storage Migration

We've just completed migrating from Base64 storage to file storage. Here's how to fix it:

---

## Step 1: Contact Your Developer/Hosting Provider

**Immediate Action Required:**
1. **SSH into your production server** (or ask your developer to do this)
2. **Restart the backend server** to get it running again temporarily
3. **Then deploy the new code** to fix the root cause

---

## Step 2: Deploy New Code to Production

### Files to Upload:
Upload these new/modified files to your production server:

```
backend-node/
├── utils/
│   └── upload.js                    [NEW]
├── routes/
│   ├── settings.js                  [UPDATED]
│   ├── stories.js                   [UPDATED]
│   ├── cases.js                     [UPDATED]
│   ├── merchandise.js               [UPDATED]
│   └── teamMembers.js               [UPDATED]
├── server.js                        [UPDATED]
├── scripts/
│   └── migrate-images-to-files.js   [NEW]
└── public/
    └── uploads/
        └── images/
            ├── stories/             [CREATE DIRECTORY]
            ├── cases/               [CREATE DIRECTORY]
            ├── merchandise/         [CREATE DIRECTORY]
            ├── team-members/        [CREATE DIRECTORY]
            ├── advocates/           [CREATE DIRECTORY]
            └── settings/            [CREATE DIRECTORY]
```

---

## Step 3: Create Directories on Production Server

**SSH into your server and run:**

```bash
cd /path/to/your/backend-node
mkdir -p public/uploads/images/stories
mkdir -p public/uploads/images/cases
mkdir -p public/uploads/images/merchandise
mkdir -p public/uploads/images/team-members
mkdir -p public/uploads/images/advocates
mkdir -p public/uploads/images/settings

# Set proper permissions (adjust user/group as needed)
chmod -R 755 public/uploads
```

---

## Step 4: Install Dependencies (if needed)

```bash
cd /path/to/your/backend-node
npm install
```

(Should already have multer, but verify)

---

## Step 5: Run Migration Script

**This converts existing Base64 images to files:**

```bash
cd /path/to/your/backend-node
node scripts/migrate-images-to-files.js
```

**Expected output:**
```
✅ Connected to MongoDB
📁 Created directory: public/uploads/images/settings
📸 Migrating Settings images...
  ✅ Migrated logo
  ✅ Migrated professional image
📸 Migrating Story images...
  ✅ Migrated 50 stories
📸 Migrating Case images...
  ✅ Migrated 10 cases
...
✅ Migration complete! Migrated 150 images total.
```

**This will:**
- Extract all Base64 images from database
- Save them as files
- Update database with new file URLs
- **Reduce database size significantly**

---

## Step 6: Restart Server

```bash
# Stop current server (if running)
pm2 stop backend  # or systemctl stop your-service, or kill process

# Start server
pm2 start server.js --name backend  # or your preferred method
# OR
npm start
# OR
node server.js
```

---

## Step 7: Verify Everything Works

1. **Check server is running:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

2. **Check images are accessible:**
   - Visit: `https://www.drdeath.in/uploads/images/settings/...`
   - Should see an image file

3. **Test the website:**
   - Visit: `https://www.drdeath.in`
   - Check that images display correctly
   - Test uploading a new image (should save as file now)

---

## If Server Won't Start

### Check MongoDB Connection:
```bash
# Test MongoDB connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URL).then(() => { console.log('✅ MongoDB connected'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

### Check Database Size:
- Log into MongoDB Atlas dashboard
- Check database size - should be much smaller after migration
- If still large, migration may not have completed

### Check Server Logs:
```bash
# View logs
pm2 logs backend  # if using PM2
# OR
tail -f /var/log/your-app.log  # if using systemd
# OR
# Check console output where server is running
```

---

## Quick Commands Reference

```bash
# 1. Create directories
mkdir -p public/uploads/images/{stories,cases,merchandise,team-members,advocates,settings}

# 2. Set permissions
chmod -R 755 public/uploads

# 3. Run migration
node scripts/migrate-images-to-files.js

# 4. Restart server
pm2 restart backend  # or your restart command
```

---

## After Deployment

✅ **Database size will be drastically reduced** (from MB to KB)  
✅ **Site will stop crashing** from database size issues  
✅ **Images will load faster** (served as files, not from database)  
✅ **Server will be more stable** (less memory usage)

---

## Need Help?

If you're stuck:
1. **Check server logs** for specific errors
2. **Verify MongoDB connection** is working
3. **Ensure all files were uploaded** correctly
4. **Check file permissions** on uploads directory
5. **Contact your developer/hosting provider** if you don't have server access

---

## Prevention

After this fix:
- ✅ All new images will save as files (not Base64)
- ✅ Database will stay small
- ✅ Site won't crash from image storage
- ⚠️ **Make sure to run the migration script** to convert existing images!

---

**Priority:** 🔴 URGENT - Site is currently down  
**Estimated Fix Time:** 15-30 minutes  
**Impact:** Will prevent future crashes and improve performance significantly
