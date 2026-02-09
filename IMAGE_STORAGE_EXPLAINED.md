# Where Are Images Stored?

## Short Answer:
**All images are stored as Base64-encoded strings directly in MongoDB Atlas.**

## Detailed Explanation:

### Storage Method: Base64 Encoding in Database

Your application uses **Base64 encoding** to store images directly in MongoDB collections. This means:

1. **Images are converted to text** - Each image is converted to a base64 string
2. **Stored in MongoDB** - The base64 string is saved directly in the database document
3. **No separate file storage** - Images are NOT stored in:
   - File system folders
   - Cloud storage (AWS S3, Google Cloud Storage, etc.)
   - CDN services
   - Separate image server

### Where Images Are Stored by Type:

| Image Type | Collection | Field Name | Format |
|------------|-----------|------------|--------|
| **Story Images** | `stories` | `images` (array) | Base64 data URLs |
| **Case Images** | `cases` | `image_url` | Base64 data URL |
| **Merchandise Images** | `merchandise` | `image_url` | Base64 data URL |
| **Team Member Photos** | `team_members` | `image_url` | Base64 data URL |
| **Site Logo** | `settings` | `logo_url` | Base64 data URL |
| **Professional Image** | `settings` | `professional_image_url` | Base64 data URL |
| **Advocate Profile** | `advocates` | `profile_image` | Base64 data URL |

### Example of How It's Stored:

A typical image in MongoDB looks like this:

```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicmNygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkgtLT4+Pj..."
  ]
}
```

The format is: `data:[mime-type];base64,[base64-encoded-image-data]`

### Why This Approach?

**Advantages:**
- ✅ Simple setup - No need for file storage services
- ✅ Everything in one place - All data in MongoDB
- ✅ Easy backup - Database backup includes all images
- ✅ Works immediately - No additional configuration needed

**Disadvantages:**
- ⚠️ Larger database size - Base64 increases file size by ~33%
- ⚠️ Slower queries - Larger documents take longer to transfer
- ⚠️ Database size limits - MongoDB Atlas free tier has 512MB limit
- ⚠️ Memory usage - Loading images loads entire document

### Current Storage Location:

Since you've migrated to MongoDB Atlas, **all your images are now stored in MongoDB Atlas** in the `legal_guardian` database.

**Database:** `legal_guardian`  
**Collections with images:**
- `stories` - Contains `images` array field
- `cases` - Contains `image_url` field
- `merchandise` - Contains `image_url` field
- `team_members` - Contains `image_url` field
- `settings` - Contains `logo_url` and `professional_image_url`
- `advocates` - Contains `profile_image` field

### File Sizes You Might See:

Looking at your exported JSON files:
- `stories.json` - 3.2 MB (contains base64-encoded images)
- `team_members.json` - 3.3 MB (contains base64-encoded images)
- `cases.json` - 464 KB (contains base64-encoded images)
- `settings.json` - 1.8 MB (contains logo and professional images)

This explains why these files are large - they contain the actual image data as text!

### How Images Are Uploaded:

1. User uploads image through frontend
2. Backend receives image file
3. Backend converts image to base64 string
4. Base64 string is saved in MongoDB document
5. When displayed, frontend uses the base64 string directly in `<img src="data:image/...">` tags

### Viewing Images in MongoDB Compass:

When you view documents in Compass, you'll see the base64 strings. Compass might show them as truncated. To view the actual image, you need to copy the base64 string and paste it into an image viewer or use it in an HTML img tag.

### If You Want to Change This in the Future:

If you need to migrate to file storage (AWS S3, Cloudinary, etc.):

1. Extract base64 images from MongoDB
2. Convert back to image files
3. Upload to file storage service
4. Replace base64 strings with URLs
5. Update application code to use URLs instead of base64

But for now, your current setup works fine for small to medium-sized applications!

