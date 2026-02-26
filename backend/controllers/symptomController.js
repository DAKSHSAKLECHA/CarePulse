import Symptom from "../models/Symptom.js";

// Create
export const createSymptom = async (req, res) => {
  try {
    const { date, mood, symptoms, notes } = req.body;

    const newSymptom = await Symptom.create({
      patient: req.user.id,
      date,
      mood,
      symptoms,
      notes,
    });

    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Symptoms
export const getSymptomsByPatient = async (req, res) => {
  try {
    const symptoms = await Symptom.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Symptoms (Admin/Doctor)
export const getAllSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find()
      .populate("patient", "name email age gender")
      .sort({ createdAt: -1 });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update (Ownership Check Added)
export const updateSymptom = async (req, res) => {
  try {
    const symptom = await Symptom.findById(req.params.id);

    if (!symptom || symptom.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Symptom.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete (Ownership Check Added)
export const deleteSymptom = async (req, res) => {
  try {
    const symptom = await Symptom.findById(req.params.id);

    if (!symptom || symptom.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await symptom.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};