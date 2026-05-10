import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },  // FIXED
    time: { type: String, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexing for performance
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ date: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;