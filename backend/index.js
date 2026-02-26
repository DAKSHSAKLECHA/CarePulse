import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import symptomRoutes from "./routes/symptomRoutes.js";
import PatientRoute from "./routes/PatientRoute.js";
import DoctorRoute from "./routes/DoctorRoute.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import AppointmentRoute from "./routes/AppointmentRoute.js";

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ credentials: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/symptoms", symptomRoutes);
app.use("/api/auth", PatientRoute);
app.use("/api/doctor", DoctorRoute);
app.use("/api/storage", prescriptionRoutes);
app.use("/api/appointments", AppointmentRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));