import express from "express";
import { registerPatient, loginPatient, getPatientProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient registration
router.post("/register", registerPatient);

// Patient login
router.post("/login", loginPatient);

// Get patient profile (Protected)
router.get("/profile", authMiddleware, getPatientProfile);

export default router;
