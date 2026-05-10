import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory (for Cloudinary)

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

export default upload;