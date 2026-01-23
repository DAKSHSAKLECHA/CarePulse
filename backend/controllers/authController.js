import Patient from "../models/Patient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register a new patient
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    // Check if the email is already in use
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new patient
    const newPatient = new Patient({ 
      name, 
      email, 
      password: hashedPassword, 
      age, 
      gender,
      role: "patient"
    });

    await newPatient.save();

    // ✅ FIX: Generate Token immediately after Signup
    const token = createToken(newPatient._id);

    res.status(201).json({ 
        message: "Patient registered successfully.", 
        token, // <--- IMPORTANT: Sending token to frontend
        user: { 
            id: newPatient._id, 
            name: newPatient.name, 
            email: newPatient.email, 
            role: newPatient.role 
        }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Login a patient
export const loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;
  
        const patient = await Patient.findOne({ email });

        if (!patient) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, patient.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = createToken(patient._id);

        res.status(200).json({
            token,
            user: { id: patient._id, name: patient.name, email: patient.email, role: patient.role },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};