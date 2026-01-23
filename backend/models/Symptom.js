import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }, // Attach patient
  date: String,
  mood: String,
  symptoms: String,
  notes: String,
});

const Symptom = mongoose.model("Symptom", symptomSchema);
export default Symptom;
