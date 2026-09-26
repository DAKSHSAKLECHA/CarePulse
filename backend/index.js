import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";


import symptomRoutes from "./routes/symptomRoutes.js";
import PatientRoute from "./routes/PatientRoute.js";
import DoctorRoute from "./routes/DoctorRoute.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import AppointmentRoute from "./routes/AppointmentRoute.js";
// import claudeRoute from "./routes/claudeRoute.js";
import aiRoutes from "./routes/aiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
connectDB();

const app = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(helmet());
app.use(express.json({ limit: "10mb" })); // increased for base64 image uploads
app.use(cors({ credentials: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// Routes
app.use("/api/symptoms", symptomRoutes);
app.use("/api/auth", PatientRoute);
app.use("/api/doctor", DoctorRoute);
app.use("/api/storage", prescriptionRoutes);
app.use("/api/appointments", AppointmentRoute);
// app.use("/api/claude", claudeRoute);
app.use("/api/ai", aiRoutes);       // ← new

app.get("/", (req, res) => res.json({ message: "CarePulse API is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
