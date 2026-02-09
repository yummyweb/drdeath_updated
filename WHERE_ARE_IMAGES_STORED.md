# Where Are Images Stored?

## Current Storage System (After Migration)

**Images are now stored as files on the server filesystem**, not as Base64 strings in the database.

## Image Storage Locations

All images are stored in the `backend-node/public/uploads/images/` directory, organized by type:

```
backend-node/
└── public/
    └── uploads/
        ├── images/                    # All image files
        │   ├── stories/               # Story images
        │   ├── cases/                 # Case images  
        │   ├── merchandise/           # Product images
        │   ├── team-members/          # Team member photos
        │   ├── advocates/             # Advocate profile images
        │   └── settings/              # Logo and professional images
        └── documents/                 # PDF documents
            ├── stories/               # Story PDFs
            └── cases/                 # Case PDFs
```

## How Images Are Accessed

Images are served via HTTP at these URLs:

- **Story images**: `http://your-domain.com/uploads/images/stories/{filename}`
- **Case images**: `http://your-domain.com/uploads/images/cases/{filename}`
- **Merchandise images**: `http://your-domain.com/uploads/images/merchandise/{filename}`
- **Team member photos**: `http://your-domain.com/uploads/images/team-members/{filename}`
- **Advocate images**: `http://your-domain.com/uploads/images/advocates/{filename}`
- **Settings images**: `http://your-domain.com/uploads/images/settings/{filename}`

## What's Stored in the Database

The database now stores **only the file paths/URLs**, not the actual image data:

```javascript
{
  "images": [
    "/uploads/images/stories/image-1234567890-987654321.jpg",
    "/uploads/images/stories/image-1234567891-123456789.png"
  ],
  "logo_url": "/uploads/images/settings/logo-1234567890-456789123.png",
  "image_url": "/uploads/images/cases/case-image-1234567890-789123456.jpg"
}
```

## Migration Status

- ✅ **New uploads**: All new images are saved as files
- ⚠️ **Existing images**: Some older images may still be Base64 in the database
  - Run the migration script to convert them: `node scripts/migrate-images-to-files.js`

## Image Types by Collection

| Image Type | Storage Location | Database Field | URL Format |
|------------|-----------------|----------------|------------|
| **Story Images** | `public/uploads/images/stories/` | `images` (array) | `/uploads/images/stories/{filename}` |
| **Case Images** | `public/uploads/images/cases/` | `image_url` | `/uploads/images/cases/{filename}` |
| **Merchandise Images** | `public/uploads/images/merchandise/` | `image_url` | `/uploads/images/merchandise/{filename}` |
| **Team Member Photos** | `public/uploads/images/team-members/` | `image_url` | `/uploads/images/team-members/{filename}` |
| **Site Logo** | `public/uploads/images/settings/` | `logo_url` | `/uploads/images/settings/{filename}` |
| **Professional Image** | `public/uploads/images/settings/` | `professional_image_url` | `/uploads/images/settings/{filename}` |
| **Advocate Profile** | `public/uploads/images/advocates/` | `profile_image` | `/uploads/images/advocates/{filename}` |

## File Naming Convention

Files are saved with unique names:
- Format: `{sanitized-original-name}-{timestamp}-{random}.{ext}`
- Example: `my-photo-1703567890123-123456789.jpg`
- This prevents filename conflicts

## Benefits of File Storage

✅ **Reduced database size** - Database stores only URLs (KB) instead of image data (MB)  
✅ **Faster queries** - Smaller documents = faster database queries  
✅ **Better scalability** - Can store unlimited images (limited by disk space)  
✅ **Easier backup** - Images can be backed up separately  
✅ **CDN ready** - Easy to move to CDN in the future  

## Production Deployment

When deploying to production:
1. **Upload the `public/uploads/` directory** to your server
2. **Set proper permissions**: `chmod -R 755 public/uploads`
3. **Ensure static file serving** is enabled in `server.js`
4. **Run migration script** to convert any remaining Base64 images

## Backup Recommendation

Back up both:
1. **Database** (MongoDB) - Contains metadata and image URLs
2. **Uploads directory** - Contains all actual image files

---

**Last Updated**: After image storage migration (2025-12-25)  
**Storage Method**: File-based (not Base64 in database)
