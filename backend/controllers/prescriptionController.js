import Prescription from "../models/Prescription.js";
import cloudinary from "../utils/cloudinary.js";

// Upload Prescription
export const uploadPrescription = async (req, res) => {
  try {
    const { documentName } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert buffer to a stream and upload to Cloudinary
    const uploadStream = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "prescriptions" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save to DB
    const prescription = new Prescription({
      patient: req.user.id, // Get logged-in user ID from auth middleware
      documentName,
      prescriptionUrl: uploadStream.secure_url,
      cloudinaryId: uploadStream.public_id, // Save Cloudinary ID for deletion
      originalFilename: req.file.originalname,
    });

    await prescription.save();
    res.status(201).json({ message: "Prescription uploaded successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Patient's Prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Prescription
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this prescription" });
    }

    // Delete from Cloudinary using stored Cloudinary ID
    await cloudinary.uploader.destroy(prescription.cloudinaryId);

    // Delete from database
    await prescription.deleteOne();
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
