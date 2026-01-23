import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory (for Cloudinary)
const upload = multer({ storage });

export default upload;
