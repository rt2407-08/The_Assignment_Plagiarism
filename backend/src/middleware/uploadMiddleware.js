const multer = require("multer");
const path = require("node:path");

// Use memory storage so we can directly read code and text files without extra disk I/O
const storage = multer.memoryStorage();

// Allowed file extensions for code & text submissions
const ALLOWED_EXTENSIONS = [
  ".txt",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".js",
  ".ts",
  ".html",
  ".css",
  ".json",
  ".md"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || file.mimetype.startsWith("text/")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${ext} is not supported. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

module.exports = upload;
