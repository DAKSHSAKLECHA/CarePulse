import Patient from "../models/Patient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register Patient
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6+ characters." });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      role: "patient",
    });

    const token = createToken(newPatient._id, "patient");

    res.status(201).json({
      token,
      user: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
        role: newPatient.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Patient
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(patient._id, "patient");

    res.status(200).json({
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: patient.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Patient Profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
