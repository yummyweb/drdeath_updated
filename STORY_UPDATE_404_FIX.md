# Fix: Story Update 404 Error

## Issue
Getting 404 error when trying to update a story: "Failed to load resource: the server responded with a status of 404 (Not Found)"

## Root Cause
The route was correctly defined, but there might be route ordering issues or the server needs to be restarted.

## Solution Applied

1. **Reordered routes** - Moved PUT route before GET route to ensure proper route matching
2. **Verified route syntax** - All routes are correctly defined

## If Still Getting 404:

### Step 1: Restart Backend Server
```bash
cd backend-node
# Stop the server (Ctrl+C if running)
npm start
# Or
node server.js
```

### Step 2: Verify Route is Working
Test the endpoint manually:
```bash
# Test with curl (replace STORY_ID and TOKEN)
curl -X PUT http://localhost:8000/api/stories/YOUR_STORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Title","description":"Test"}'
```

### Step 3: Check Backend Logs
Look for any errors in the console when making the PUT request. The route handler should log errors if they occur.

### Step 4: Verify API URL
Check that `REACT_APP_BACKEND_URL` in frontend `.env` matches your backend URL:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Step 5: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try updating the story
4. Check the failed request:
   - What URL is it hitting?
   - What's the exact error message?
   - What's the response body?

## Expected Behavior

- **For regular users**: `PUT /api/stories/:storyId` - must own the story
- **For admins**: `PUT /api/admin/stories/:storyId` - can edit any story

Both routes should work now after server restart.

## Common Issues

1. **Backend not running**: Start the server first
2. **Wrong API URL**: Check `.env` file in frontend
3. **CORS error**: Check backend CORS settings
4. **Authentication token missing**: Make sure user is logged in
5. **Story ownership**: Regular users can only edit their own stories

---

**Status**: Routes fixed and reordered. Restart backend server to apply changes.
