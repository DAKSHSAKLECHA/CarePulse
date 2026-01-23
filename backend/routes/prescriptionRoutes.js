import express from "express";
import { uploadPrescription, getPrescriptions } from "../controllers/prescriptionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js"; // Multer middleware for file upload

const router = express.Router();

// Route to upload a prescription (Protected & File Upload)
router.post("/upload", authMiddleware, upload.single("file"), uploadPrescription);

// Route to get all prescriptions (Protected)
router.get("/", authMiddleware, getPrescriptions);

export default router;
