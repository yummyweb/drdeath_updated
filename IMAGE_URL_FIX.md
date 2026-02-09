# Image URL Fix - Images Not Visible

## Problem
Images were not displaying on the stories page and throughout the application because image URLs stored in the database were relative paths (e.g., `/uploads/images/stories/filename.jpg`), which the browser tried to load from the frontend domain instead of the backend domain.

## Solution
Created a helper function `getImageUrl()` that:
1. Detects if the image is already a Base64 data URL (old format) and returns it as-is
2. Detects if it's already a full URL (http/https) and returns it as-is  
3. For relative paths starting with `/uploads/`, prefixes with the backend URL from `REACT_APP_BACKEND_URL`
4. Provides fallback handling for edge cases

## Files Modified

### New File
- `frontend/src/utils/imageUrl.js` - Helper function for image URL resolution

### Updated Files
- `frontend/src/pages/Stories.js` - Uses `getImageUrl()` for story card images
- `frontend/src/pages/StoryDetail.js` - Uses `getImageUrl()` for story detail images
- `frontend/src/pages/Admin.js` - Uses `getImageUrl()` for admin panel images
- `frontend/src/pages/AdminSettings.js` - Uses `getImageUrl()` for settings images
- `frontend/src/pages/Resources.js` - Uses `getImageUrl()` for case images
- `frontend/src/pages/About.js` - Uses `getImageUrl()` for team member and professional images
- `frontend/src/pages/Store.js` - Uses `getImageUrl()` for merchandise images

## Testing
1. **Verify backend is serving static files**: Check that `server.js` has:
   ```javascript
   app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
   ```

2. **Check environment variable**: Ensure `REACT_APP_BACKEND_URL` is set in frontend `.env`:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. **Test image loading**:
   - Visit `/stories` page - images should display
   - Visit a story detail page - images should display
   - Check browser console for any image load errors

## Image Formats Supported
- ✅ Base64 data URLs (old format): `data:image/jpeg;base64,...`
- ✅ Full URLs: `http://example.com/image.jpg`
- ✅ Relative paths: `/uploads/images/stories/filename.jpg`
- ✅ Error handling: Images that fail to load are hidden gracefully

## Next Steps
- If images still don't load:
  1. Check browser console for 404 errors
  2. Verify the image files exist in `backend-node/public/uploads/images/stories/`
  3. Verify backend server is running and serving static files
  4. Check CORS settings if loading from different domain
  5. Verify `REACT_APP_BACKEND_URL` is correctly set in production

---

**Status**: ✅ Fixed - Images should now display correctly throughout the application.

