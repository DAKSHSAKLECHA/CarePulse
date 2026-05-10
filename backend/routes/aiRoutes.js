import express from "express";
import {
  predictDisease,
  chatWithAI,
  scanPrescription,
  triageSymptoms,
  assessPatientRisk,
  // checkDrugInteractions,
  // generateConsultationSummary,
  generateHealthTimeline,
  generateClinicalBrief,
  generateSOAPNote,
  generatePreAppointmentBrief,
  generateDiagnosisAssist,
} from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Patient routes
router.post("/predict-disease", authMiddleware, roleMiddleware("patient"), predictDisease);
router.post("/chat", authMiddleware, chatWithAI);
router.post("/scan-prescription", authMiddleware, roleMiddleware("patient"), scanPrescription);
router.post("/triage", authMiddleware, roleMiddleware("patient"), triageSymptoms);
router.post("/health-timeline", authMiddleware, roleMiddleware("patient"), generateHealthTimeline);
router.post("/pre-appointment-brief", authMiddleware, roleMiddleware("patient"), generatePreAppointmentBrief);

// Doctor routes
router.post("/assess-risk", authMiddleware, roleMiddleware("doctor"), assessPatientRisk);
router.post("/clinical-brief", authMiddleware, roleMiddleware("doctor"),  generateClinicalBrief);
router.post("/soap-note", authMiddleware, roleMiddleware("doctor"), generateSOAPNote);
router.post("/diagnosis-assist", authMiddleware, roleMiddleware("doctor"), generateDiagnosisAssist);
// router.post("/drug-interactions",    authMiddleware, roleMiddleware("doctor"), checkDrugInteractions);
// router.post("/consultation-summary", authMiddleware, roleMiddleware("doctor"), generateConsultationSummary);

export default router;