import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  getDoctorPatients,
  getDoctorStats,
  getAllDoctors,
} from "../controllers/appointmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/doctors", getAllDoctors);

// Patient routes
router.post("/book", authMiddleware, bookAppointment);
router.get("/my", authMiddleware, getMyAppointments);

// Doctor routes
router.get("/doctor/all", authMiddleware, getDoctorAppointments);
router.get("/doctor/patients", authMiddleware, getDoctorPatients);
router.get("/doctor/stats", authMiddleware, getDoctorStats);
router.put("/doctor/update/:id", authMiddleware, updateAppointment);

export default router;
