import Symptom from "../models/Symptom.js";
import Appointment from "../models/Appointment.js";

// Create
export const createSymptom = async (req, res) => {
  try {
    const { date, mood, symptoms, notes, aiSuggestion } = req.body;

    const newSymptom = await Symptom.create({
      patient: req.user.id,
      date,
      mood,
      symptoms,
      notes,
      aiSuggestion: aiSuggestion || null,
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
    const doctorId = req.user.id;

    const appointments = await Appointment.find({
      doctor: doctorId,
    }).select("patient");

    const patientIds = appointments.map(a => a.patient);

    const symptoms = await Symptom.find({
      patient: { $in: patientIds },
    })
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

    const { date, mood, symptoms, notes, aiSuggestion } = req.body;

    // Build a partial update so fields the caller didn't send (e.g. a
    // follow-up request that only attaches the AI suggestion) don't wipe
    // out existing values with undefined.
    const updateFields = {};
    if (date !== undefined) updateFields.date = date;
    if (mood !== undefined) updateFields.mood = mood;
    if (symptoms !== undefined) updateFields.symptoms = symptoms;
    if (notes !== undefined) updateFields.notes = notes;
    if (aiSuggestion !== undefined) updateFields.aiSuggestion = aiSuggestion;

    const updated = await Symptom.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

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