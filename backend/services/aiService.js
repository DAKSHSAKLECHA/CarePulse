import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });


const MODELS = {
  fast:    process.env.GEMINI_MODEL_FAST    || "gemini-3.5-flash-lite",
  default: process.env.GEMINI_MODEL_DEFAULT || "gemini-3.5-flash-lite",
  power:   process.env.GEMINI_MODEL_POWER   || "gemini-3.5-flash-lite"
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT =
  "You are a medical AI assistant integrated into CarePulse, a healthcare platform. " +
  "Always respond with valid JSON only. No markdown, no explanation, no code fences. " +
  "Just the raw JSON object exactly as specified.";

function removeUnvalidatedMetrics(value) {
  if (Array.isArray(value)) return value.map(removeUnvalidatedMetrics);
  if (!value || typeof value !== "object") return value;
  const blocked = new Set(["confidence", "confidencescore", "probability", "diagnosisprobability", "riskscore", "riskpercentage", "healthscore", "healthgrade", "urgencyscore", "daysmonitored"]);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !blocked.has(key.replace(/[_-]/g, "").toLowerCase())).map(([key, entry]) => [key, removeUnvalidatedMetrics(entry)]));
}

function parseAIJson(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error(
      "No JSON found in AI response: " + raw.slice(0, 200)
    );
  }

  return removeUnvalidatedMetrics(JSON.parse(match[0]));
}

function toGeminiContents(messages) {
  return messages.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";

    if (typeof m.content === "string") {
      return { role, parts: [{ text: m.content }] };
    }

    const parts = (m.content || []).map((block) => {
      if (block.type === "image") {
        return {
          inline_data: {
            mime_type: block.source.media_type,
            data: block.source.data
          }
        };
      }

      return { text: block.text || "" };
    });

    return { role, parts };
  });
}

function extractGeminiText(data) {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((p) => p.text || "").join("");
}

async function callGemini(model, contents, systemPrompt, maxTokens) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set in .env");
  }

  const body = {
    contents,
    generationConfig: {

      maxOutputTokens: maxTokens
    }
  };

  body.system_instruction = { parts: [{ text: [systemPrompt, "Never invent patient readings, measurements, medication doses, dates, events or treatment outcomes. Missing or unreadable values must be null or explicitly unavailable, never typical example values. Do not generate confidence percentages, disease probabilities, numerical risk/health/urgency scores, or health grades: no validated scoring model is provided. Lack of symptom data does not imply low risk. Clinical outputs are drafts for qualified professional review, not confirmed diagnoses."].filter(Boolean).join("\n") }] };

  const response = await fetch(
    `${GEMINI_BASE}/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000)
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Gemini API error");
  }

  const text = extractGeminiText(data);

  if (!text) {

    const finishReason = data?.candidates?.[0]?.finishReason;
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(
      `Gemini returned no text (finishReason: ${finishReason || "unknown"}${
        blockReason ? `, blockReason: ${blockReason}` : ""
      })`
    );
  }

  return text;
}

async function callAIJson(messages, model = MODELS.default, systemPrompt = SYSTEM_PROMPT, maxTokens = 1500) {
  const contents = toGeminiContents(messages);
  const raw = await callGemini(model, contents, systemPrompt, maxTokens);
  return parseAIJson(raw);
}

async function callAIText(
  messages,
  model = MODELS.fast,
  systemPrompt = ""
) {
  const contents = toGeminiContents(messages);
  return await callGemini(model, contents, systemPrompt, 700);
}

export const predictDiseaseService = async (symptomEntries) => {
  if (!symptomEntries || symptomEntries.length === 0) {
    throw new Error("No symptom entries provided.");
  }

  const formatted = symptomEntries
    .slice(0, 14)
    .map((s, i) =>
      `Day ${i + 1} (${s.date}): Mood=${s.mood}, Symptoms=${s.symptoms}, Notes=${s.notes || "none"}`
    )
    .join("\n");

  const prompt =  `Analyze these patient symptom log entries and identify possible health conditions.

    Patient Symptom History (${symptomEntries.length} entries):
    ${formatted}

    Return ONLY this JSON structure:
    {
      "predictions": [
        {
          "condition": "Condition Name",
          "description": "Why this matches the symptom pattern observed",
          "urgency": "low",
          "recommendation": "Specific actionable advice for this condition"
        }
      ],
      "redFlags": ["any alarming symptoms that need immediate attention"],
      "overallRisk": "low",
      "patternSummary": "2-3 sentence summary of the health pattern observed across all entries",
      "nextSteps": "Single most important next step for this patient"
    }

    Rules:
    - urgency values: low | medium | high | emergency
    - overallRisk values: low | medium | high | unknown
    - When evidence is insufficient, use unknown, empty predictions and explain the missing information.
    - Never definitively diagnose — frame as "possible" or "may indicate"
    - Always recommend consulting a qualified doctor`;

    return await callAIJson(
      [{ role: "user", content: prompt }],
      MODELS.default
    );

};

export const chatService = async (history) => {
  if (!history || !Array.isArray(history)) {
    throw new Error("No history");
  }

  const CHAT_SYSTEM_PROMPT = `
    You are CareAI, a clinically-intelligent health assistant built into the CarePulse platform.

    Your role:
    - Help users understand symptoms and what they might indicate
    - Explain medical terms in simple language
    - Advise when symptoms need urgent care vs home care
    - Suggest which type of doctor to see for different conditions
    - Answer general health and wellness questions

    Your tone:
    - Warm, empathetic, and reassuring
    - Use simple language, avoid jargon
    - Be concise — 3-5 sentences max unless a detailed explanation is needed
    - Use bullet points for lists of symptoms or advice
    - Add relevant emojis sparingly for warmth

    Safety rules:
    - ALWAYS recommend seeing a real doctor for diagnosis
    - For chest pain, breathing difficulty, or stroke symptoms — immediately say "call emergency services"
    - Never prescribe specific medications or dosages
    - Never diagnose definitively — say "this may indicate" or "could be related to"
    - If someone seems distressed, be extra gentle and empathetic
    `;

  const reply = await callAIText(
    history,
    MODELS.fast,
    CHAT_SYSTEM_PROMPT
  );

  return { reply };
};

export const triageSymptomsService = async (answers) => {
  const {
    mainSymptom,
    duration,
    severity,
    existingConditions,
    ageGroup
  } = answers;

  if (!mainSymptom || !severity) {
    throw new Error("mainSymptom and severity are required.");
  }

  const prompt = `You are a medical triage system. Assess this patient's urgency level based on their answers.

  Patient Information:
  - Main symptom or concern: ${answers.mainSymptom}
  - Duration: ${answers.duration}
  - Severity (1-10 scale): ${answers.severity}
  - Existing medical conditions: ${answers.existingConditions || "none reported"}
  - Age group: ${answers.ageGroup}

  Return ONLY this JSON structure:
  {
    "urgencyLevel": "routine",
    "urgencyLabel": "Book Appointment Soon",
    "color": "yellow",
    "headline": "One clear action-oriented sentence telling patient exactly what to do",
    "explanation": "2-3 sentence medical explanation of why this urgency level was assigned",
    "redFlagSymptoms": ["only list if emergency symptoms detected, else empty array"],
    "suggestedSpecialty": "e.g. General Physician / Cardiologist / Dermatologist",
    "estimatedWait": "e.g. See doctor within 24 hours / Within 3 days / When convenient",
    "homeCareTips": ["practical tip 1", "practical tip 2", "practical tip 3"],
    "shouldBook": true,
    "emergencyNote": null
  }

  Rules:
  - urgencyLevel: emergency | urgent | routine | self_care
  - color: red | orange | yellow | green
  - emergencyNote: short string with immediate action if urgencyLevel is emergency, else null
  - shouldBook: false only if urgencyLevel is self_care
  - severity 8-10 or chest pain/breathing issues should trigger urgent or emergency`;

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.fast
  );

};

export const scanPrescriptionService = async (base64Data, mimeType) => {
  if (!base64Data || !mimeType) {
    throw new Error("base64Data and mimeType are required.");
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(
      "Only image files are currently supported."
    );
  }

  const prompt = `Extract all information from this medical document/prescription image.

  Return ONLY this JSON structure (use null for any field not found):
  {
    "doctorName": "Dr. Full Name or null",
    "patientName": "Patient Name or null",
    "date": "date as written or null",
    "diagnosis": "diagnosis/condition or null",
    "medicines": [
      {
        "name": "Medicine Name",
        "dosage": "e.g. 500mg",
        "frequency": "e.g. twice daily / BD",
        "duration": "e.g. 7 days",
        "instructions": "e.g. after meals, or null"
      }
    ],
    "labTests": ["any lab tests ordered"],
    "followUpDate": "follow-up date/timeframe or null",
    "warnings": ["any warnings or precautions mentioned"],
    "interactions": [],
    "documentType": "prescription"
  }

  documentType must be one of: prescription | lab_report | discharge_summary | other
  Extract ALL medicines listed, even if partially visible`;

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType,
            data: base64Data
          }
        },
        {
          type: "text",
          text: prompt
        }
      ]
    }
  ];

  return await callAIJson(
    messages,
    MODELS.default
  );

};

export const assessPatientRiskService = async (
  patientName,
  recentSymptoms
) => {

  if (!patientName || !recentSymptoms?.length) {
    throw new Error("patientName and recentSymptoms are required.");
  }

  const formatted = recentSymptoms
    .slice(0, 7)
    .map(
      (s) =>
        `${s.date}: Symptoms="${s.symptoms}" | Mood="${s.mood}"`
    )
    .join("\n");

  const prompt = `Assess the clinical risk level for this patient based on their recent symptom logs.

  Patient Name: ${patientName}

  Recent Entries (${Math.min(recentSymptoms.length, 7)} of ${recentSymptoms.length} shown):
  ${formatted}

  Return ONLY this JSON structure:
  {
    "riskLevel": "low",
    "riskColor": "green",
    "riskBadge": "Low Risk",
    "topConcerns": ["specific concern 1", "specific concern 2"],
    "deterioratingPattern": false,
    "alertMessage": "One concise sentence alerting the doctor to the most important finding",
    "recommendedAction": "Specific recommended action e.g. Schedule follow-up within 2 weeks"
  }

  Rules:
  - riskLevel: low | medium | high | critical
  - riskColor: green | yellow | orange | red
  - deterioratingPattern: true if symptoms are clearly worsening
  - topConcerns: specific symptoms or patterns
  - riskBadge: short UI-friendly label`;

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.default
  );

};

export const generateHealthTimelineService = async (
  patientData,
  mode) => {

  if (!patientData || !patientData.name) {
    throw new Error("patientData with name is required.");
  }

  const {
    name,
    symptoms = [],
    appointments = [],
    medicines = []
  } = patientData;

  const symptomSummary = symptoms
    .slice(0, 20)
    .map(
      (s) =>
        `${s.date}: mood=${s.mood}, symptoms="${s.symptoms}", notes="${s.notes || "none"}"`
    )
    .join("\n");

  const appointmentSummary = appointments
    .slice(0, 10)
    .map(
      (a) =>
        `${a.date || a.createdAt}: ${a.reason || "General"} — ${a.status}${
          a.notes ? ", notes: " + a.notes : ""
        }`
    )
    .join("\n");

  const medicineList =
    medicines.length > 0
      ? medicines.map((m) => m.name || m).join(", ")
      : "none recorded";

  const TIMELINE_SYSTEM_PROMPT = `You are a compassionate medical AI storyteller.
  Always respond with valid JSON only.
  No markdown, no explanation, just the raw JSON object.`;

  const prompt = `Your task : Read this patient's health data and write their PERSONAL HEALTH TIMELINE — a chronological story of their health journey told with warmth, insight, and clinical awareness.

  Patient: ${name}
  ${symptoms.length > 0 ? `\nSymptom History (${symptoms.length} entries):\n${symptomSummary}` : "\nNo symptom data yet."}
  ${appointments.length > 0 ? `\nAppointment History (${appointments.length} visits):\n${appointmentSummary}` : "\nNo appointments yet."}
  Medicines: ${medicineList}

  Summarize only actual dated entries. Use only as many chapters as the records support; return an empty chapters array if records are insufficient.

  Return ONLY this JSON (no other text):
  {
    "patientName": "${name}",
    "overallArc": "One sentence describing the overall health journey arc — like a book summary",
    "trend": "up",
    "trendReason": "Short reason why health is trending this direction",
    "chapters": [
      {
        "id": 1,
        "title": "Chapter title — evocative, like a book chapter",
        "period": "Exact period from submitted records, or unknown",
        "type": "recovery",
        "headline": "One powerful sentence that captures this phase",
        "story": "2-3 sentences telling this chapter of their health story with warmth and clinical insight. Be specific to their actual data.",
        "keyEvents": ["specific event 1", "specific event 2"],
        "mood": "improving",
        "insight": "One actionable clinical insight or positive observation for this period"
      }
    ],
    "aiMessage": "A warm, personalized 2-sentence message from AI to this patient about their journey — encouraging and specific to their data",
    "nextChapter": "One sentence about what the next chapter of their health journey could look like if they stay on track",
    "strengths": ["health strength 1", "health strength 2", "health strength 3"],
    "watchPoints": ["thing to monitor 1", "thing to monitor 2"]
  }

  Rules:
  - chapter type must be one of: recovery, challenge, milestone, stable, concern, improvement
  - trend must be: up, down, or flat
  - mood must be: improving, declining, stable
  - Be warm and human, not clinical and cold
  - If data is sparse, explain what is missing; do not invent events or improvement
  - Do not claim improvement, recovery, adherence or safety without supporting records`

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.default,
    TIMELINE_SYSTEM_PROMPT,
    3000
  );

};

export const generateClinicalBriefService = async (
  patient,
  appointments = [],
  symptoms = []
) => {

  appointments = Array.isArray(appointments)
    ? appointments
    : [];

  symptoms = Array.isArray(symptoms)
    ? symptoms
    : [];

  const apptSummary = appointments
    .slice(0, 8)
    .map(a =>
      `${a.date || a.createdAt}: ${a.reason || "General"} — ${a.status}${
        a.notes ? " | Notes: " + a.notes : ""
      }`
    )
    .join("\n");

  const symptomSummary = symptoms
    .slice(0, 10)
    .map(s =>
      `${s.date}: ${s.symptoms} (mood: ${s.mood})`
    )
    .join("\n");

    const CLINICAL_BRIEF_SYSTEM_PROMPT = `
      You are CareAI, a clinically-intelligent medical assistant for doctors.

      Always respond with valid JSON only.
      No markdown.
      No explanations outside JSON.
      `;

    const prompt = `Generate a clinical pre-consultation brief for this patient.

      Patient: ${patient?.name || "Unknown Patient"}, Age: ${patient?.age || "unknown"}, Gender: ${patient?.gender || "unknown"}
      ${appointments.length > 0 ? `\nAppointment History (${appointments.length} visits):\n${apptSummary}` : "\nNo prior appointments."}
      ${symptoms.length > 0 ? `\nRecent Symptom Logs:\n${symptomSummary}` : ""}

      Return ONLY this JSON:
      {
        "clinicalSummary": "2-3 sentence clinical overview of this patient's health status",
        "redFlags": ["urgent concern 1", "urgent concern 2"],
        "differentials": [
          {
            "condition": "Most likely condition",
            "reasoning": "Brief clinical reasoning"
          }
        ],
        "recommendedTests": ["test 1", "test 2"],
        "currentMedications": ["med 1 if mentioned in notes"],
        "drugInteractionRisk": false,
        "drugInteractionNote": null,
        "priorityLevel": "routine",
        "priorityReason": "Why this priority level",
        "talkingPoints": ["Key thing for doctor to address", "Second key point"],
        "lastVisitSummary": "What happened at last visit or null"
      }

      priorityLevel: routine | urgent | critical`;

    return await callAIJson(
      [{ role: "user", content: prompt }],
      MODELS.default,
      CLINICAL_BRIEF_SYSTEM_PROMPT
    );

};

export const generateSOAPNoteService = async (
  patient,
  appointment
) => {
  const SOAP_SYSTEM_PROMPT = `
    You are CareAI, a professional clinical documentation assistant.

    Always return valid JSON only.
    No markdown.
    No explanations outside JSON.
    `;

    const prompt = `Generate a professional SOAP note for a clinical consultation.

      Patient: ${patient?.name}, Age: ${patient?.age || "N/A"}, Gender: ${patient?.gender || "N/A"}
      Chief Complaint / Visit Reason: ${appointment?.reason || "General consultation"}
      Doctor's Notes: ${appointment?.notes || "No notes recorded"}
      Appointment Status: ${appointment?.status || "completed"}
      Date: ${appointment?.date || new Date().toLocaleDateString("en-IN")}

      Return ONLY this JSON (SOAP format used in all hospitals):
      {
        "subjective": {
          "chiefComplaint": "Chief complaint in clinical language",
          "historyOfPresentIllness": "HPI narrative paragraph",
          "reviewOfSystems": ["positive finding 1", "negative finding 1"]
        },
        "objective": {
          "vitalSigns": "Vitals if mentioned or 'Not recorded'",
          "physicalExam": "Physical examination findings or 'Not documented'",
          "labResults": "Lab results if mentioned or 'Pending'"
        },
        "assessment": {
          "primaryDiagnosis": "Primary diagnosis",
          "differentialDiagnoses": ["differential 1", "differential 2"],
          "clinicalImpression": "2-sentence clinical impression"
        },
        "plan": {
          "medications": ["medication 1 with dosage", "medication 2"],
          "investigations": ["test ordered 1"],
          "followUp": "Follow-up plan",
          "patientEducation": "What patient was counselled about",
          "referrals": []
        },
        "icdCode": "Suggested ICD-10 code",
        "icdDescription": "ICD code description"
      }`;

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.default,
    SOAP_SYSTEM_PROMPT
  );

};

export const generatePreAppointmentBriefService = async (
  appointment,
  recentSymptoms = []
) => {

  recentSymptoms = Array.isArray(recentSymptoms)
    ? recentSymptoms
    : [];

  appointment = appointment || {};

  const symptomSummary = recentSymptoms
    .slice(0, 7)
    .map(s =>
      `${s.date}: ${s.symptoms} (mood: ${s.mood})`
    )
    .join("\n");

  const PRE_APPOINTMENT_SYSTEM_PROMPT = `
    You are CareAI, a caring health assistant.

    Write for patients in warm, simple, encouraging language.

    Always respond with valid JSON only.
    No markdown.
    No explanations outside JSON.
    `;

  const prompt =`
You are CareAI preparing a patient for their upcoming medical appointment.

Upcoming Appointment:
- Doctor: ${appointment?.doctor?.name || "their doctor"}
- Specialization: ${appointment.doctor?.specialization || "General Physician"}
- Date: ${appointment?.date}
- Reason: ${appointment?.reason || "General consultation"}

Patient's Recent Symptoms (last 7 entries):
${symptomSummary || "No recent symptom logs"}

Generate a friendly, helpful pre-appointment brief FOR THE PATIENT (not doctor).
Write in simple, warm language. Not clinical jargon.

Return ONLY this JSON:
{
  "greeting": "Warm personalized opening sentence about their upcoming appointment",
  "keySymptomsToBring": ["Specific symptom to mention 1", "Specific symptom to mention 2"],
  "questionsToAsk": ["Important question to ask doctor 1", "Question 2", "Question 3"],
  "doBeforeAppointment": ["Practical prep tip 1", "Practical prep tip 2"],
  "whatToExpect": "2 sentence description of what this type of appointment will be like",
  "bringWith": ["ID/insurance card", "List of current medications"],
  "symptomSummary": "1-2 sentence plain-English summary of recent health for patient to read to doctor",
  "urgentFlag": false,
  "urgentMessage": null
}

urgentFlag: true if symptoms suggest something needing urgent discussion
urgentMessage: message to patient if urgentFlag is true, else null`;

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.default,
    PRE_APPOINTMENT_SYSTEM_PROMPT
  );

};

export const generateDiagnosisAssistService = async (
  patient,
  symptoms = []
) => {
  const symptomSummary = symptoms
    .slice(0, 10)
    .map(
      (s) =>
        `${s.date}: ${s.symptoms} (mood: ${s.mood}, notes: ${s.notes || "none"})`
    )
    .join("\n");

    const DIAGNOSIS_ASSIST_SYSTEM_PROMPT = `You are a clinical decision support AI assisting healthcare professionals.
      Always respond with valid JSON only.
      No markdown.
      No explanations outside JSON.`;

  const prompt = `You are a clinical decision support AI assisting a doctor with differential diagnosis.

    Patient: ${patient?.name || "Unknown Patient"}, Age: ${patient?.age || "unknown"}, Gender: ${patient?.gender || "unknown"}
    Recent Symptom History:
    ${symptomSummary || "No symptom data available"}

    Generate evidence-based differential diagnoses without numerical probabilities; all suggestions require clinician verification.

    Return ONLY this JSON:
    {
      "primaryDiagnosis": {
        "name": "Most likely diagnosis",
        "icdCode": "ICD-10 code",
        "clinicalBasis": "Why this is most likely based on symptoms",
        "keyFindings": ["finding supporting this diagnosis"],
        "firstLineManagement": "Standard first-line treatment"
      },
      "differentials": [
        {
          "name": "Second likely diagnosis",
          "icdCode": "ICD-10 code",
          "distinguishingFeature": "What makes this different from primary",
          "rulingOutTest": "Test to rule this out"
        }
      ],
      "mustRuleOut": {
        "condition": "Dangerous condition to rule out",
        "reason": "Why this must be excluded",
        "urgentTest": "Test to order immediately"
      },
      "suggestedInvestigations": ["investigation 1", "investigation 2", "investigation 3"],
      "redFlagSymptoms": ["symptom that would change management"],
      "clinicalPearl": "One important clinical insight for this presentation",
      "referralNeeded": false,
      "referralSpecialty": null }`;

  return await callAIJson(
    [{ role: "user", content: prompt }],
    MODELS.default,
    DIAGNOSIS_ASSIST_SYSTEM_PROMPT
  );

};