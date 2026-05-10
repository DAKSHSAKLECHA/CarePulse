import { 
  predictDiseaseService,
  chatService, 
  triageSymptomsService,
  scanPrescriptionService,
  assessPatientRiskService,
  generateHealthTimelineService,
  generateClinicalBriefService,
  generateSOAPNoteService,
  generatePreAppointmentBriefService,
  generateDiagnosisAssistService,
} from "../services/aiService.js";

// ─────────────────────────────────────────────────────────────
// FEATURE 1: Symptom → Disease Prediction
// POST /api/ai/predict-disease  |  Role: patient
// ─────────────────────────────────────────────────────────────
export const predictDisease = async (req, res) => {
  try {
    const result = await predictDiseaseService(req.body.symptomEntries);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "AI error.", error: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 2: ChatBot 
// POST /api/ai/chat  |  Role: patient
// ─────────────────────────────────────────────────────────────
export const chatWithAI = async (req, res) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ message: "Invalid history" });
    }

    const result = await chatService(history);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 3: AITriage 
// POST /api/ai/chat  |  Role: patient
// ─────────────────────────────────────────────────────────────
export const triageSymptoms = async (req, res) => {
  try {
    const result = await triageSymptomsService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "AI error.",
      error: error.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 4: Smart Prescription Scanner
// POST /api/ai/scan-prescription
// ─────────────────────────────────────────────────────────────
export const scanPrescription = async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;

    const result = await scanPrescriptionService(base64Data, mimeType);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "AI error.",
      error: error.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 5: Patient Risk Assessment
// ─────────────────────────────────────────────────────────────
export const assessPatientRisk = async (req, res) => {
  try {
    const { patientName, recentSymptoms } = req.body;

    const result = await assessPatientRiskService(
      patientName,
      recentSymptoms
    );

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({
      message: "AI error.",
      error: error.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 6: Health TimeLine
// ─────────────────────────────────────────────────────────────
export const generateHealthTimeline = async (req, res) => {
  try {
    const { patientData, mode } = req.body;
    const result = await generateHealthTimelineService(
      patientData,
      mode
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
    message: "AI error.",
    error: error.message,
  });
  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 7: Clinical Brief Generator
// ─────────────────────────────────────────────────────────────
export const generateClinicalBrief = async (req, res) => {
  try {

    const {
      patient,
      appointments,
      symptoms,
    } = req.body;

    const result =
      await generateClinicalBriefService(
        patient,
        appointments,
        symptoms
      );

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      message: "Clinical brief generation failed.",
      error: error.message,
    });

  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 8: SOAP Note Generator
// ─────────────────────────────────────────────────────────────
export const generateSOAPNote = async (req, res) => {
  try {

    const {
      patient,
      appointment,
    } = req.body;

    const result =
      await generateSOAPNoteService(
        patient,
        appointment
      );

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      message: "SOAP note generation failed.",
      error: error.message,
    });

  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 9: Pre-Appointment brief Generator
// ─────────────────────────────────────────────────────────────
export const generatePreAppointmentBrief = async (req, res) => {
  try {

    const {
      appointment,
      recentSymptoms,
    } = req.body;

    const result =
      await generatePreAppointmentBriefService(
        appointment,
        recentSymptoms
      );

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      message: "Pre-appointment brief generation failed.",
      error: error.message,
    });

  }
};


// ─────────────────────────────────────────────────────────────
// FEATURE 10: Generate Diagnosis Assist
// ─────────────────────────────────────────────────────────────
export const generateDiagnosisAssist = async (req, res) => {
  try {

    const {
      patient,
      symptoms,
    } = req.body;

    const result =
      await generateDiagnosisAssistService(
        patient,
        symptoms
      );

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      message: "Diagnosis assist generation failed.",
      error: error.message,
    });

  }
};