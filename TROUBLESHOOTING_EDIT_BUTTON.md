# Troubleshooting: Edit Button Not Visible

## Problem
The Edit button is not showing up for your story "Brother's 10 years fight to seek justice" in the Dashboard.

## Root Cause
The story belongs to user ID: `c99180d1-2ddf-4cd2-92ca-452e50121b91`
The Dashboard only shows stories where the logged-in user's ID matches the story's `user_id`.

## Possible Issues & Solutions

### Issue 1: Wrong Account Logged In
**Symptom:** You can't see the story at all in the Dashboard, or you see different stories.

**Solution:**
1. Check which account you're logged in with:
   - Open browser Developer Tools (F12 or Cmd+Option+I on Mac)
   - Go to Application/Storage tab
   - Check Local Storage → Look for `token`
   - Or check the Network tab when loading `/api/auth/me` to see your user details

2. Log out and log in with the correct account:
   - The account should be: `mailfornishantverma@gmail.com`
   - If this account doesn't exist, you may need to register it first

### Issue 2: Story Not Showing in Dashboard
**Symptom:** The story doesn't appear in your Dashboard at all.

**Check:**
1. Is the story visible on the public stories page? (`/stories`)
2. Check browser console for errors (F12 → Console tab)
3. Check Network tab to see if `/api/stories/my` returns the story

**Quick Test:**
- Direct URL to edit: `http://your-site.com/edit-story/b0d96d1b-3fc9-4e8f-a017-86758157540e`
- If this works, the button is just not showing (CSS/styling issue)
- If this shows "You can only edit your own stories", you're logged in with wrong account

### Issue 3: CSS/Styling Issue Hiding Button
**Symptom:** You see the story but no buttons visible.

**Check:**
1. Open browser Developer Tools (F12)
2. Inspect the story card element
3. Look for the button container (should have class `flex items-center gap-2`)
4. Check if buttons are hidden by CSS (display: none, visibility: hidden, opacity: 0)

**Quick Fix:**
- Try using the direct edit URL: `/edit-story/b0d96d1b-3fc9-4e8f-a017-86758157540e`

### Issue 4: User ID Mismatch
**Symptom:** Your account exists but the story was created with a different user ID.

**Solution:**
If you have admin access, you can check the database to see which user ID created the story and ensure you're logged in with that account.

## Quick Diagnostic Steps

1. **Check Your Login Status:**
   ```
   Visit: /api/auth/me (while logged in)
   Check the returned user.id - it should match: c99180d1-2ddf-4cd2-92ca-452e50121b91
   ```

2. **Check if Story is Returned:**
   ```
   Visit: /api/stories/my (while logged in)
   Check if story ID b0d96d1b-3fc9-4e8f-a017-86758157540e is in the response
   ```

3. **Try Direct Edit URL:**
   ```
   Visit: /edit-story/b0d96d1b-3fc9-4e8f-a017-86758157540e
   If it works, the button is just not visible (CSS issue)
   If it says "You can only edit your own stories", wrong account logged in
   ```

## Alternative: Edit as Admin (If Needed)

If you need to edit as an admin, we can add admin edit functionality to the admin panel. However, the standard way is to edit from your user account.

