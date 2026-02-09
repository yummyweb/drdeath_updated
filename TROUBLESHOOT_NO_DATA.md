# Troubleshooting: Why Can't I See Data?

## Quick Checks:

### 1. In MongoDB Compass (Atlas):

**Did you import the data?**
- Check if you actually clicked "Import" in Compass
- Look at the document count - should show numbers > 0

**Refresh the view:**
- Click the refresh button (circular arrow) in Compass
- Collections might show cached/count

**Check the right database:**
- Make sure you're looking at `legal_guardian` database
- Not `local` or other databases

**Click on a collection:**
- Click on "users" or "stories" collection
- You should see documents listed below

### 2. On Your Live Site (www.drdeath.in):

**Is the backend connected to Atlas?**
- Your production backend needs to use the Atlas connection string
- Check if environment variables are set correctly on your server

**Check backend logs:**
- Look for connection errors
- Should see "MongoDB connected" message

**Clear browser cache:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear browser cache completely

### 3. Common Issues:

**Issue: Data imported but not visible in Compass**
- Solution: Click refresh button
- Solution: Click on the collection name to view documents
- Solution: Check you're in the right database (`legal_guardian`)

**Issue: Data in Atlas but not showing on live site**
- Solution: Verify backend is using Atlas connection string (not local)
- Solution: Check CORS_ORIGINS includes your domain
- Solution: Check backend is running and connected

**Issue: Import seemed to work but documents are 0**
- Solution: Check JSON file format (should be JSON array)
- Solution: Try importing again
- Solution: Check for error messages during import

