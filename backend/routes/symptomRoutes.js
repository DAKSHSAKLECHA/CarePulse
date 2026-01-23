import express from "express";
import {
  createSymptom,
  getSymptomsByPatient,
  getAllSymptoms,
  updateSymptom,
  deleteSymptom,
} from "../controllers/symptomController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Ensure only logged-in users access

const router = express.Router();

router.post("/add", authMiddleware, createSymptom);
router.get("/patient/:patientId", authMiddleware, getSymptomsByPatient);
router.get("/", authMiddleware, getAllSymptoms); // Admin/Doctor route
router.put("/:id", authMiddleware, updateSymptom);
router.delete("/:id", authMiddleware, deleteSymptom);

export default router;
