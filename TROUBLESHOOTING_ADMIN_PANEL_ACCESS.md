# Troubleshooting: Admin Panel Inaccessible (https://drdeath.in/admin)

## Problem
The admin panel at `https://drdeath.in/admin` is inaccessible.

## Root Cause
The Admin component has strict access control:
1. **Must be logged in** - Otherwise redirects to `/login`
2. **Must have admin role** - Otherwise shows error and redirects to `/dashboard`

## Quick Diagnosis Steps

### Step 1: Check if You're Logged In

**In Browser Console (F12 → Console tab):**
```javascript
// Check if you have a token
localStorage.getItem('token')
// Should return a JWT token string, not null

// Check stored user data (if any)
localStorage.getItem('user')
```

**If no token exists:**
- You're not logged in
- **Solution:** Go to `https://drdeath.in/login` and log in with your admin credentials

### Step 2: Check Your User Role

**In Browser Console:**
1. Open Network tab (F12 → Network)
2. Navigate to `https://drdeath.in/admin`
3. Look for a request to `/api/auth/me`
4. Check the response - it should show your user object with `role: "admin"`

**Or manually test:**
```javascript
// In browser console
fetch('https://api.drdeath.in/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Your user data:', data);
  console.log('Your role:', data.role);
  console.log('Is admin?', data.role === 'admin');
});
```

### Step 3: Common Issues & Solutions

#### Issue A: "Redirected to Login Page"
**Cause:** Not logged in or token expired

**Solutions:**
1. Go to `https://drdeath.in/login`
2. Log in with admin credentials:
   - Email: `mailfornishantverma@gmail.com`
   - Password: `Elizian@123`
3. After login, you should be redirected to `/admin` automatically

#### Issue B: "Redirected to Dashboard with 'Admin access required' Error"
**Cause:** Your account doesn't have `role: 'admin'` in the database

**Solutions:**
1. **Check your account role in database:**
   - Your account email: `mailfornishantverma@gmail.com`
   - Need to verify this account has `role: 'admin'` in MongoDB Atlas

2. **Convert your account to admin:**
   - You need backend access to run the admin creation script
   - Or contact your developer to update your user's role in the database

3. **Create a new admin account:**
   ```bash
   cd backend-node
   node scripts/create-admin.js mailfornishantverma@gmail.com Elizian@123 "Nishant Bharihoke"
   ```

#### Issue C: "Backend API Errors (Network/CORS)"
**Cause:** Backend server not accessible or CORS misconfigured

**Check:**
1. Open browser console (F12)
2. Go to Network tab
3. Try accessing `/admin` again
4. Look for failed requests to `/api/auth/me` or `/api/admin/*`

**Common errors:**
- `404 Not Found` → Backend URL incorrect
- `CORS error` → Backend CORS not configured for `https://drdeath.in`
- `Network Error` → Backend server down or unreachable

**Solutions:**
1. Verify backend is running and accessible
2. Check `REACT_APP_BACKEND_URL` in frontend environment variables
3. Verify backend `CORS_ORIGINS` includes `https://drdeath.in`

#### Issue D: "Page Loads but Shows Loading Forever"
**Cause:** Backend API calls failing or timing out

**Check:**
1. Open browser console → Network tab
2. Look for requests to `/api/admin/stats`, `/api/admin/stories`, etc.
3. Check their status codes

**Solutions:**
1. Verify backend server is running
2. Check MongoDB Atlas connection
3. Verify backend environment variables are set correctly
4. Check backend server logs for errors

### Step 4: Verify Admin User in Database

**If you have MongoDB Atlas access:**
1. Connect to MongoDB Atlas using Compass or MongoDB shell
2. Navigate to `legal_guardian` database
3. Open `users` collection
4. Find your user document:
   ```javascript
   { email: "mailfornishantverma@gmail.com" }
   ```
5. Check the `role` field - it should be `"admin"`, not `"user"`

**If role is `"user"`:**
- Your account needs to be converted to admin
- Use the `create-admin.js` script or update directly in database

### Step 5: Clear Browser Cache & LocalStorage

Sometimes cached data causes issues:

1. **Clear LocalStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   // Then refresh page and log in again
   ```

2. **Clear Browser Cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear and refresh

3. **Try Incognito/Private Window:**
   - This ensures no cached data interferes
   - Log in fresh in incognito mode

## Quick Test Checklist

- [ ] Can access `https://drdeath.in/login` ✅
- [ ] Can log in with `mailfornishantverma@gmail.com` / `Elizian@123` ✅
- [ ] After login, automatically redirected to `/admin` ✅
- [ ] Browser console shows no errors ✅
- [ ] Network tab shows successful API calls to `/api/auth/me` and `/api/admin/*` ✅
- [ ] User object from API shows `role: "admin"` ✅

## Expected Behavior

When everything works correctly:

1. **Not logged in:** Visiting `/admin` → Redirects to `/login`
2. **Logged in as admin:** Visiting `/admin` → Shows admin panel with:
   - Statistics dashboard
   - Pending stories, advocates, grants tabs
   - Moderation controls
   - Settings link

3. **Logged in as non-admin:** Visiting `/admin` → Shows error toast "Admin access required" → Redirects to `/dashboard`

## Still Not Working?

If none of the above works, check:

1. **Backend Server Status:**
   - Is the backend server running on production?
   - Check with your developer/hosting provider

2. **Environment Variables:**
   - Verify `REACT_APP_BACKEND_URL` is set correctly in frontend
   - Verify backend environment variables (MONGO_URL, JWT_SECRET, CORS_ORIGINS) are correct

3. **MongoDB Atlas:**
   - Is the database accessible?
   - Are network access rules configured?
   - Is the connection string correct?

4. **Check Server Logs:**
   - Backend logs should show authentication attempts
   - Check for errors related to MongoDB connection, JWT validation, etc.

## Contact Your Developer

Share these details with your developer:

1. **What happens when you visit `/admin`:**
   - Redirected to login?
   - Redirected to dashboard?
   - Shows error message?
   - Page loads but shows loading spinner?

2. **Browser Console Errors:**
   - Screenshot of console errors
   - Screenshot of Network tab showing failed requests

3. **Your Account Details:**
   - Email: `mailfornishantverma@gmail.com`
   - Expected role: `admin`
   - Current behavior: [describe what you see]

4. **Backend Status:**
   - Can they verify backend is running?
   - Can they verify your user has `role: 'admin'` in database?

---

**Quick Fix:** Most likely you need to either:
1. Log in first at `https://drdeath.in/login`
2. OR your account needs `role: 'admin'` set in the database
