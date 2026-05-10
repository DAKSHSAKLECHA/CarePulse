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
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/doctors", getAllDoctors);

// Patient only
router.post("/book", authMiddleware, roleMiddleware("patient"), bookAppointment);
router.get("/my", authMiddleware, roleMiddleware("patient"), getMyAppointments);

// Doctor only
router.get("/doctor/all", authMiddleware, roleMiddleware("doctor"), getDoctorAppointments);
router.get("/doctor/patients", authMiddleware, roleMiddleware("doctor"), getDoctorPatients);
router.get("/doctor/stats", authMiddleware, roleMiddleware("doctor"), getDoctorStats);
router.put("/doctor/update/:id", authMiddleware, roleMiddleware("doctor"), updateAppointment);

export default router;