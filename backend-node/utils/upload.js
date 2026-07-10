const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// ── Cloudinary setup ──────────────────────────────────────────────────────────
let cloudinary = null;
function getCloudinary() {
  if (!cloudinary) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinary;
}

const useCloudinary = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET);

// ── Folder map for Cloudinary ─────────────────────────────────────────────────
const CLOUDINARY_FOLDERS = {
  stories:     'voice/images/stories',
  cases:       'voice/images/cases',
  merchandise: 'voice/images/merchandise',
  teamMembers: 'voice/images/team-members',
  advocates:   'voice/images/advocates',
  settings:    'voice/images/settings',
};

// ── Local disk dirs (fallback + documents) ────────────────────────────────────
const uploadDirs = {
  stories:        'public/uploads/images/stories',
  cases:          'public/uploads/images/cases',
  merchandise:    'public/uploads/images/merchandise',
  teamMembers:    'public/uploads/images/team-members',
  advocates:      'public/uploads/images/advocates',
  settings:       'public/uploads/images/settings',
  storyDocuments: 'public/uploads/documents/stories',
  caseDocuments:  'public/uploads/documents/cases',
  grantDocuments: 'public/uploads/documents/grants',
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Determine folder key from request URL ─────────────────────────────────────
function folderKey(url) {
  if (url.includes('/settings/logo') || url.includes('/settings/professional-image')) return 'settings';
  if (url.includes('/cases/'))       return 'cases';
  if (url.includes('/merchandise/')) return 'merchandise';
  if (url.includes('/team-members/')) return 'teamMembers';
  if (url.includes('/advocates/'))   return 'advocates';
  return 'stories';
}

// ── Image file filter ─────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
          && /image/.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

// ── Document file filter ──────────────────────────────────────────────────────
const documentFileFilter = (req, file, cb) => {
  const ok = /pdf/.test(path.extname(file.originalname).toLowerCase())
          || /application\/pdf/.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only PDF files are allowed'));
};

// ── Cloudinary multer storage engine ─────────────────────────────────────────
const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    const folder = CLOUDINARY_FOLDERS[folderKey(req.originalUrl || req.url)];
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `${folder}/${uniqueId}`;

    const uploadStream = getCloudinary().uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', overwrite: false },
      (err, result) => {
        if (err) return cb(err);
        // Store the secure URL as the "filename" so callers get a full HTTPS URL
        cb(null, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          filename: result.secure_url, // used by routes that call req.file.filename
          path: result.secure_url,
          size: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (file.cloudinaryPublicId) {
      getCloudinary().uploader.destroy(file.cloudinaryPublicId, cb);
    } else {
      cb(null);
    }
  },
};

// ── Disk storage for images (fallback when Cloudinary not configured) ─────────
const diskImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    const url = req.originalUrl || req.url;
    const key = folderKey(url);
    cb(null, uploadDirs[key] || uploadDirs.stories);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// ── Disk storage for documents (always disk — PDFs aren't shown inline) ───────
const diskDocStorage = multer.diskStorage({
  destination(req, file, cb) {
    const url = req.originalUrl || req.url;
    let dest = uploadDirs.storyDocuments;
    if (url.includes('/cases/') && url.includes('/document'))  dest = uploadDirs.caseDocuments;
    if (url.includes('/grants/'))                               dest = uploadDirs.grantDocuments;
    cb(null, dest);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// ── Exported multer instances ─────────────────────────────────────────────────
const upload = multer({
  storage: useCloudinary() ? cloudinaryStorage : diskImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

const uploadDocument = multer({
  storage: diskDocStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: documentFileFilter,
});

// ── Helper: upload a buffer directly to Cloudinary (used by PDF resource route) ─
async function uploadBufferToCloudinary(buffer, folder, resourceType = 'image') {
  if (!useCloudinary()) throw new Error('Cloudinary not configured');
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => err ? reject(err) : resolve(result)
    );
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { upload, uploadDocument, uploadDirs, uploadBufferToCloudinary, useCloudinary };
