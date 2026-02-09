const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  stories: 'public/uploads/images/stories',
  cases: 'public/uploads/images/cases',
  merchandise: 'public/uploads/images/merchandise',
  teamMembers: 'public/uploads/images/team-members',
  advocates: 'public/uploads/images/advocates',
  settings: 'public/uploads/images/settings',
  storyDocuments: 'public/uploads/documents/stories',
  caseDocuments: 'public/uploads/documents/cases',
  grantDocuments: 'public/uploads/documents/grants'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on route
    let uploadPath = uploadDirs.stories; // default
    
    const url = req.originalUrl || req.url;
    // Check for document uploads first (more specific)
    if (url.includes('/stories/') && url.includes('/document')) {
      uploadPath = uploadDirs.storyDocuments;
    } else if (url.includes('/cases/') && url.includes('/document')) {
      uploadPath = uploadDirs.caseDocuments;
    } else if (url.includes('/grants/') && (url.includes('/document') || url.includes('/documents'))) {
      uploadPath = uploadDirs.grantDocuments;
    } 
    // Check for settings images
    else if (url.includes('/settings/logo') || url.includes('/settings/professional-image')) {
      uploadPath = uploadDirs.settings;
    } 
    // Check for regular image uploads (less specific)
    else if (url.includes('/cases/')) {
      uploadPath = uploadDirs.cases;
    } else if (url.includes('/merchandise/')) {
      uploadPath = uploadDirs.merchandise;
    } else if (url.includes('/team-members/')) {
      uploadPath = uploadDirs.teamMembers;
    } else if (url.includes('/advocates/')) {
      uploadPath = uploadDirs.advocates;
    } else if (url.includes('/stories/')) {
      uploadPath = uploadDirs.stories;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for documents (PDFs)
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/pdf/.test(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Create multer instances
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  },
  fileFilter: imageFileFilter
});

const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for PDFs
  },
  fileFilter: documentFileFilter
});

module.exports = {
  upload,
  uploadDocument,
  uploadDirs
};
