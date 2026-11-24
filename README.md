# CarePulse

Health-record and appointment workspace using React, Express and MongoDB.

## Run

Keep the root .env private. Configure the database, JWT, file-storage and Gemini settings used by the backend.

Backend: `cd backend`, `npm ci`, `npm run dev`.
Frontend in another terminal: `cd frontend`, `npm ci`, `npm run dev`.
Production frontend: `npm run build` inside frontend.

Dashboard counts come from saved records. No sample vital signs, fabricated platform statistics or AI-generated numerical clinical scores are displayed. AI output is unverified assistance and requires qualified clinical review. Doctor profile information is self-reported. Existing patient data and credentials are not modified by the source cleanup.
