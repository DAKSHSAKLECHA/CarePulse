import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  // Add the gender field here
  gender: { 
    type: String, 
    required: true, 
    enum: ["male", "female", "other"] 
  },
  role: { type: String, default: "doctor" },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;