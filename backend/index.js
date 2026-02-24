import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// DB Connection
import connectDB from "./config/db.js";

// Routes
import symptomRoutes from "./routes/symptomRoutes.js";
import PatientRoute from './routes/PatientRoute.js';
import DoctorRoute from './routes/DoctorRoute.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import AppointmentRoute from './routes/AppointmentRoute.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ credentials: true }));

// API Routes
app.use("/api/symptoms", symptomRoutes);
app.use('/api/auth', PatientRoute);
app.use('/api/doctor', DoctorRoute);
app.use('/api/storage', prescriptionRoutes);
app.use('/api/appointments', AppointmentRoute);

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
