import Symptom from "../models/Symptom.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

// ✅ Create a new symptom entry
export const createSymptom = async (req, res) => {
  try {
    // SECURITY FIX: Get patient ID from the logged-in user (req.user), not req.body
    const patientId = req.user.id; 
    const { date, mood, symptoms, notes } = req.body;

    // Validate if patient exists
    const existingPatient = await Patient.findById(patientId);
    if (!existingPatient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const newSymptom = new Symptom({
      patient: patientId, // Automatically link to the logged-in user
      date,
      mood,
      symptoms,
      notes,
    });

    await newSymptom.save();
    res.status(201).json(newSymptom);
  } catch (error) {
    console.error("❌ Error in createSymptom:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all symptoms for the LOGGED IN patient
export const getSymptomsByPatient = async (req, res) => {
  try {
    // SECURITY FIX: Only fetch symptoms for the logged-in user
    const patientId = req.user.id; 

    const symptoms = await Symptom.find({ patient: patientId }).sort({ date: -1 }); // Sorted by newest first
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all symptoms (Admin only - kept as is)
export const getAllSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find().populate("patient", "name age");
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a symptom entry
export const updateSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSymptom = await Symptom.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSymptom) return res.status(404).json({ error: "Symptom not found" });
    res.status(200).json(updatedSymptom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a symptom entry
export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSymptom = await Symptom.findByIdAndDelete(id);
    if (!deletedSymptom) return res.status(404).json({ error: "Symptom not found" });
    res.status(200).json({ message: "Symptom entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};