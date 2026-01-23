import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // References the Patient model
      required: true,
    },
    documentName: {
      type: String,
      required: true, // Stores the name of the document
    },
    prescriptionUrl: {
      type: String,
      required: true, // Stores Cloudinary URL
    },
    originalFilename: {
      type: String,
      required: true, // Stores original file name
    },
    uploadedAt: {
      type: Date,
      default: Date.now, // Timestamp of upload
    },
  },
  { timestamps: true }
);
const Prescription = mongoose.model("Prescription", PrescriptionSchema);
export default Prescription
