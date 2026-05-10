import express from "express";
import {
  createSymptom,
  getSymptomsByPatient,
  getAllSymptoms,
  updateSymptom,
  deleteSymptom,
} from "../controllers/symptomController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Ensure only logged-in users access
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, roleMiddleware("patient"), createSymptom);
router.get("/patient/:patientId", authMiddleware, roleMiddleware("patient"), getSymptomsByPatient);
router.get("/", authMiddleware, roleMiddleware("doctor"), getAllSymptoms); // Admin/Doctor route
router.put("/:id", authMiddleware, roleMiddleware("patient"), updateSymptom);
router.delete("/:id", authMiddleware, roleMiddleware("patient"), deleteSymptom);

export default router;
