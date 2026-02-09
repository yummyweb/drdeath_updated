# Troubleshooting: Advocates Tab Not Working

## Quick Checks

1. **Open Browser Console** (F12 or Cmd+Option+I on Mac)
   - Check for any JavaScript errors (red text)
   - Look for console logs showing "Advocates loaded: X"

2. **Verify Tab is Clickable**
   - The "Advocates" tab should be visible in the tab list
   - Try clicking other tabs (Stories, Contacts, Grants) - do they work?
   - If other tabs work but Advocates doesn't, it's a tab-specific issue

3. **Check Network Requests**
   - Open Browser DevTools → Network tab
   - Refresh the admin page
   - Look for: `GET /api/admin/advocates`
   - Check if it returns status 200 and contains advocate data

4. **Verify Admin Authentication**
   - Make sure you're logged in as admin
   - Check that `user.role === 'admin'` in the console

## Common Issues & Fixes

### Issue 1: Tab Doesn't Switch When Clicked
**Symptoms:** Clicking "Advocates" tab doesn't show content

**Fix:**
- Hard refresh the page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Check browser console for errors

### Issue 2: Tab Shows "No advocate registrations" but advocate exists
**Symptoms:** Tab loads but shows empty message

**Possible Causes:**
- Advocate data not loading from API
- Advocate status is not "pending"
- API endpoint returning empty array

**Debug:**
1. Open browser console
2. Type: `localStorage.getItem('token')` - should return your JWT token
3. Check Network tab for `/api/admin/advocates` request
4. Verify the response contains the advocate data

### Issue 3: JavaScript Error Preventing Tab Switch
**Symptoms:** Tab click does nothing, console shows error

**Fix:**
- Check browser console for specific error
- Common errors:
  - `Cannot read property 'length' of undefined` - advocates array not initialized
  - `TypeError` - missing data structure
  - CORS error - backend not allowing requests

## Manual Verification Steps

1. **Check Backend API:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/admin/advocates
   ```
   Should return JSON array of advocates

2. **Check Frontend Data:**
   - Open browser console
   - Type: React DevTools (if installed) or check React state
   - Verify `advocates` state has data

3. **Verify Tab Structure:**
   - Inspect element on "Advocates" tab
   - Should have `data-testid="tab-advocates"`
   - Click event should trigger tab switch

## Quick Test

Add this temporary code to Admin.js (around line 98, in the useEffect):

```javascript
useEffect(() => {
  console.log('Current activeTab:', activeTab);
  console.log('Advocates data:', advocates);
}, [activeTab, advocates]);
```

This will log when the tab changes and show what advocate data is available.

## Still Not Working?

1. **Restart Frontend:**
   ```bash
   cd frontend
   npm start
   ```

2. **Check Backend:**
   ```bash
   cd backend-node
   npm start
   ```

3. **Verify MongoDB:**
   ```bash
   mongosh legal_guardian
   db.advocates.find().pretty()
   ```

If the advocate exists in MongoDB but doesn't show in the admin panel, there's a data loading issue.

