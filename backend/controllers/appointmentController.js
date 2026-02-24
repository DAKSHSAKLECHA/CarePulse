import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// Patient books an appointment with a doctor
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      reason,
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully.", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Patient: get my appointments
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialization experience")
      .sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Doctor: get all appointments assigned to me
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email age gender")
      .sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Doctor: update appointment status / add notes
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: req.user.id },
      { status, notes },
      { new: true }
    ).populate("patient", "name email age gender");

    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Doctor: get all patients who have appointments with this doctor
export const getDoctorPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email age gender")
      .sort({ createdAt: -1 });

    // unique patients
    const seen = new Set();
    const patients = [];
    appointments.forEach((appt) => {
      if (appt.patient && !seen.has(String(appt.patient._id))) {
        seen.add(String(appt.patient._id));
        patients.push({
          ...appt.patient.toObject(),
          lastVisit: appt.date,
          lastReason: appt.reason,
          appointmentStatus: appt.status,
        });
      }
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Doctor: stats
export const getDoctorStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments({ doctor: req.user.id });
    const today = new Date().toISOString().split("T")[0];
    const todayCount = await Appointment.countDocuments({ doctor: req.user.id, date: today });
    const pending = await Appointment.countDocuments({ doctor: req.user.id, status: "pending" });

    const allAppts = await Appointment.find({ doctor: req.user.id }).distinct("patient");
    const uniquePatients = allAppts.length;

    res.status(200).json({ total, todayCount, pending, uniquePatients });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get all doctors (public, for patient to browse)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
