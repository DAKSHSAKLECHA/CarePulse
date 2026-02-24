import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register a new doctor
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, experience } = req.body;

    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      experience,
      role: "doctor",
    });

    await newDoctor.save();

    const token = createToken(newDoctor._id, "doctor");

    res.status(201).json({
      message: "Doctor registered successfully.",
      token,
      user: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        role: newDoctor.role,
        specialization: newDoctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor Registration Error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Login a doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = createToken(doctor._id, "doctor");

    res.status(200).json({
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor Login Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
