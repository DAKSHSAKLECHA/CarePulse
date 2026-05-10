# CarePulse

A healthcare web app built for patients and doctors. Patients can track symptoms, book appointments, scan prescriptions, and chat with an AI assistant. Doctors get a clinical dashboard with AI-generated SOAP notes, risk assessments, and pre-appointment briefs — all powered by the Claude API.

---

## What it does

**For Patients**
- Symptom tracker — log symptoms over time and see them charted on a health timeline
- Symptom predictor — describe what you're feeling, get a possible disease prediction with confidence levels
- AI triage — quick urgency check (low / medium / high) based on symptoms
- Chatbot — conversational medical assistant for general health questions
- Smart prescription scanner — upload a prescription image and get it parsed into structured data
- Medicine reminders — set reminders for medications
- Document upload — store and manage medical documents via Cloudinary
- Book appointments with doctors

**For Doctors**
- Full clinical dashboard with patient list and appointment management
- AI-generated SOAP notes from patient data
- Pre-appointment brief — summary generated before the patient walks in
- Diagnosis assist — AI suggests possible diagnoses based on symptoms and history
- Patient risk panel — overall risk score with contributing factors
- Health timeline — visual history of the patient's logged symptoms and conditions
- Clinical decision support component

---

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, React Router v7, Recharts, Framer Motion, Lucide React

**Backend** — Node.js, Express, MongoDB (Mongoose), JWT auth, Helmet, rate limiting

**AI** — Anthropic Claude API (Haiku for fast calls, Sonnet as default, Opus for heavy tasks)

**Storage** — Cloudinary for prescription/document images

---

## Project Structure

```
Project_Care_Pulse/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers (auth, appointments, AI, etc.)
│   ├── middleware/       # JWT auth, role check, multer file upload
│   ├── models/          # Mongoose schemas (Patient, Doctor, Appointment, Prescription, Symptom)
│   ├── routes/          # Express routers
│   ├── services/        # aiService.js — all Claude API calls live here
│   ├── utils/           # Cloudinary setup
│   └── index.js         # App entry point
└── frontend/
    ├── src/
    │   ├── components/   # AITriage, ClinicalDecisionSupport, HealthTimeline, PatientRiskPanel, etc.
    │   ├── pages/        # All page-level components
    │   └── App.jsx       # Routes
    └── services/         # Frontend AI service calls
```

---

## Setup

**Prerequisites:** Node.js, MongoDB Atlas account, Cloudinary account, Anthropic API key

**Backend**

```bash
cd backend
npm install
```

Create a `.env` file in the root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
PORT=5000
```

```bash
npm start
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## AI Features (Claude API)

All AI logic is in `backend/services/aiService.js`. The service picks the right model based on task weight:

| Feature | Endpoint | Description |
|---|---|---|
| Disease Prediction | `POST /api/ai/predict-disease` | Predicts possible conditions from symptom entries |
| Chatbot | `POST /api/ai/chat` | Conversational medical Q&A |
| AI Triage | `POST /api/ai/triage` | Urgency classification from symptoms |
| Prescription Scanner | `POST /api/ai/scan-prescription` | Parses uploaded prescription image |
| Patient Risk Assessment | `POST /api/ai/assess-risk` | Risk score with contributing factors |
| Health Timeline | `POST /api/ai/health-timeline` | Structured timeline from patient history |
| Clinical Brief | `POST /api/ai/clinical-brief` | Summary for doctor before appointment |
| SOAP Note | `POST /api/ai/soap-note` | Generates formatted SOAP note |
| Pre-Appointment Brief | `POST /api/ai/pre-appointment` | Patient context before consultation |
| Diagnosis Assist | `POST /api/ai/diagnosis-assist` | Differential diagnosis suggestions |

---

## Roles

There are two roles — `patient` and `doctor`. Routes are protected by JWT middleware and a role check middleware. Patients can't access doctor-only clinical endpoints and vice versa.

---

## Notes

- The `.env` file should never be committed. Add it to `.gitignore`.
- The Anthropic API key needs to be set for any AI feature to work — if it's missing, the backend throws a clear error.
- Image uploads (prescriptions, documents) go through Cloudinary. Make sure the credentials are correct or the upload routes will fail.
- Rate limiting is set to 100 requests per 15 minutes per IP.

