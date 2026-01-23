import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// DB Connection
import connectDB from "./config/db.js";

// Routes
import symptomRoutes from "./routes/symptomRoutes.js";
import PatientRoute from './routes/PatientRoute.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';

dotenv.config();
connectDB();

const app = express();
const _dirname = path.resolve();

// Middleware
app.use(express.json());

// ✅ FIX: Allow Frontend to communicate with Backend
app.use(cors({
    origin: "http://localhost:5173", // Allow your Vite Frontend
    credentials: true
}));

// API Routes
app.use("/api/symptoms", symptomRoutes);
app.use('/api/auth', PatientRoute);
app.use('/api/storage', prescriptionRoutes);

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
