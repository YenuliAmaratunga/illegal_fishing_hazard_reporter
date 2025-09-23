const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB max per file (adjust as you like)
  },
  fileFilter: (req, file, cb) => {
    // license: allow pdf or images
    if (file.fieldname === 'license') {
      if (/pdf|image/.test(file.mimetype)) return cb(null, true);
      return cb(new Error('License must be an image or PDF'));
    }
    // images: only image/* 
    if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) return cb(null, true);
      return cb(new Error('Images must be image files'));
    }
    cb(null, false);
  }
});

module.exports = upload;