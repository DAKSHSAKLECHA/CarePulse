import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age:      { type: Number, required: true },

  // ✅ FIXED — matches Login.jsx values exactly (all lowercase)
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },

  role: { type: String, default: "patient" },
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;