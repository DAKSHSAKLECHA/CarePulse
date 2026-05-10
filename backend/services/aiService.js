import fetch from "node-fetch";

const MODELS = {
  fast:    "claude-haiku-4-5-20251001",
  default: "claude-sonnet-4-6",
  power:   "claude-opus-4-6",
};

const SYSTEM_PROMPT =
  "You are a medical AI assistant integrated into CarePulse, a healthcare platform. " +
  "Always respond with valid JSON only. No markdown, no explanation, no code fences. " +
  "Just the raw JSON object exactly as specified.";


function parseAIJson(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error(
      "No JSON found in AI response: " + raw.slice(0, 200)
    );
  }

  return JSON.parse(match[0]);
}

// ── Core helper: calls Anthropic API ─────────────────────────
async function callClaude(messages, model = MODELS.default, systemPrompt = SYSTEM_PROMPT, maxTokens = 1500) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set in .env");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt, // ✅ FIXED
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Claude API error");
  }

  const raw = data.content?.[0]?.text || "";
  return parseAIJson(raw);
}


// helper for chat bot
async function callClaudeText(
  messages,
  model = MODELS.fast,
  systemPrompt = ""
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set in .env");
  }

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        system: systemPrompt,
        messages,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message || "Claude API error"
    );
  }

  return data.content?.[0]?.text || "";
}

// ─────────────────────────────────────────────────────────────
// FEATURE 1: Symptom → Disease Prediction
// ─────────────────────────────────────────────────────────────
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
          "confidence": 72,
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
    - overallRisk values: low | medium | high  
    - confidence is 0-100 integer
    - Provide exactly 2-3 predictions ranked by confidence
    - Never definitively diagnose — frame as "possible" or "may indicate"
    - Always recommend consulting a qualified doctor`;

    
    // 🔄 REAL CALL (later)
    return await callClaude(
      [{ role: "user", content: prompt }],
      MODELS.default
    );

    // ✅ MOCK RESPONSE (works correctly)
    // return {
    //   predictions: [
    //     {
    //       condition: "Migraine",
    //       confidence: 75,
    //       description: "Symptoms like headache and mood changes suggest possible migraine patterns.",
    //       urgency: "low",
    //       recommendation: "Stay hydrated, rest, and consult a doctor if symptoms persist."
    //     },
    //     {
    //       condition: "Tension Headache",
    //       confidence: 60,
    //       description: "Stress-related symptoms and mild headache patterns.",
    //       urgency: "low",
    //       recommendation: "Reduce stress and maintain proper posture."
    //     }
    //   ],
    //   redFlags: [],
    //   overallRisk: "low",
    //   patternSummary: "Symptoms indicate mild recurring headache patterns without alarming signs.",
    //   nextSteps: "Monitor symptoms and consult a doctor if frequency increases."
    // };
};

// ─────────────────────────────────────────────────────────────
// FEATURE 2: ChatBot
// ─────────────────────────────────────────────────────────────
export const chatService = async (history) => {
  if (!history || !Array.isArray(history)) {
    throw new Error("No history");
  }

  // ✅ FIXED MOCK (Claude format)
  // return {
  //   reply: "That sounds uncomfortable. Based on what you described, it could be related to mild stress or fatigue.\n\n• Try resting well\n• Stay hydrated\n• Monitor symptoms\n\nIf it continues, it's best to consult a doctor 🙂"
  // };

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

  // 🔄 REAL CALL
  const reply = await callClaudeText(
    history,
    MODELS.fast,
    CHAT_SYSTEM_PROMPT
  );

  return { reply };
};


// ─────────────────────────────────────────────────────────────
// FEATURE 3: AITriage
// ─────────────────────────────────────────────────────────────
export const triageSymptomsService = async (answers) => {
  const {
    mainSymptom,
    duration,
    severity,
    existingConditions,
    ageGroup,
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
    "urgencyScore": 4,
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

// 🔄 REAL CALL LATER
  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.fast
  );

  // ✅ MOCK RESPONSE
  // return {
  //   urgencyLevel: severity >= 8 ? "urgent" : "routine",
  //   urgencyScore: severity,
  //   urgencyLabel:
  //     severity >= 8 ? "Urgent Medical Attention" : "Book Appointment Soon",
  //   color: severity >= 8 ? "orange" : "yellow",
  //   headline:
  //     severity >= 8
  //       ? "Your symptoms may require urgent care."
  //       : "Your symptoms should be checked by a doctor.",
  //   explanation:
  //     severity >= 8
  //       ? "Higher severity symptoms may indicate a more serious issue."
  //       : "Current symptoms appear manageable but should be monitored.",
  //   redFlagSymptoms:
  //     severity >= 8
  //       ? ["Severe discomfort", "Persistent symptoms"]
  //       : [],
  //   suggestedSpecialty: "General Physician",
  //   estimatedWait:
  //     severity >= 8 ? "Within 24 hours" : "Within 3 days",
  //   homeCareTips: [
  //     "Stay hydrated",
  //     "Rest properly",
  //     "Track symptom progression",
  //   ],
  //   shouldBook: true,
  //   emergencyNote:
  //     severity >= 9
  //       ? "Seek emergency care if symptoms worsen rapidly."
  //       : null,
  // };
};

// ─────────────────────────────────────────────────────────────
// FEATURE 4: Smart Prescription Scanner
// ─────────────────────────────────────────────────────────────
export const scanPrescriptionService = async (base64Data, mimeType) => {
  if (!base64Data || !mimeType) {
    throw new Error("base64Data and mimeType are required.");
  }

  // const safeMime =
  //   mimeType === "application/pdf"
  //     ? "image/jpeg"
  //     : mimeType;

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
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
    "documentType": "prescription",
    "confidence": 88
  }

  documentType must be one of: prescription | lab_report | discharge_summary | other
  confidence is 0-100 based on image clarity and completeness
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
            data: base64Data,
          },
        },
        {
          type: "text",
          text: prompt,
        },
      ],
    },
  ];

  return await callClaude(
    messages,
    MODELS.default
  );


  // ✅ TEMP MOCK RESPONSE
  // return {
  //   doctorName: "Dr. Sharma",
  //   patientName: "Rahul Verma",
  //   date: "2026-05-06",
  //   diagnosis: "Viral Fever",
  //   medicines: [
  //     {
  //       name: "Paracetamol",
  //       dosage: "500mg",
  //       frequency: "Twice daily",
  //       duration: "5 days",
  //       instructions: "After meals"
  //     },
  //     {
  //       name: "Vitamin C",
  //       dosage: "1000mg",
  //       frequency: "Once daily",
  //       duration: "7 days",
  //       instructions: null
  //     }
  //   ],
  //   labTests: ["CBC Blood Test"],
  //   followUpDate: "2026-05-12",
  //   warnings: ["Avoid cold drinks"],
  //   interactions: [],
  //   documentType: "prescription",
  //   confidence: 91
  // };
};



// ─────────────────────────────────────────────────────────────
// FEATURE 5: Patient Risk Assessment
// ─────────────────────────────────────────────────────────────
export const assessPatientRiskService = async (
  patientName,
  recentSymptoms
) => {

  if (!patientName || !recentSymptoms?.length) {
    throw new Error("patientName and recentSymptoms are required.");
  }

  // 🔄 REAL CLAUDE CALL
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
    "riskScore": 22,
    "riskColor": "green",
    "riskBadge": "Low Risk",
    "topConcerns": ["specific concern 1", "specific concern 2"],
    "deterioratingPattern": false,
    "alertMessage": "One concise sentence alerting the doctor to the most important finding",
    "recommendedAction": "Specific recommended action e.g. Schedule follow-up within 2 weeks",
    "daysMonitored": 7
  }

  Rules:
  - riskLevel: low | medium | high | critical
  - riskColor: green | yellow | orange | red
  - riskScore: 0-100 integer
  - deterioratingPattern: true if symptoms are clearly worsening
  - topConcerns: specific symptoms or patterns
  - riskBadge: short UI-friendly label`;

  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.default
  );

  // ✅ MOCK RESPONSE
  // return {
  //   riskLevel: "medium",
  //   riskScore: 58,
  //   riskColor: "yellow",
  //   riskBadge: "Medium Risk",
  //   topConcerns: [
  //     "Recurring headaches",
  //     "Mood fluctuations",
  //   ],
  //   deterioratingPattern: true,
  //   alertMessage:
  //     "Symptoms appear to be increasing over recent days.",
  //   recommendedAction:
  //     "Schedule clinical follow-up within 3 days.",
  //   daysMonitored: recentSymptoms.length,
  // }; 
};


// ─────────────────────────────────────────────────────────────
// FEATURE 6: Health Timeline
// ─────────────────────────────────────────────────────────────
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
    medicines = [],
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

  Write their health story as a series of 3-5 meaningful "chapters". Each chapter represents a distinct phase of their health journey.

  Return ONLY this JSON (no other text):
  {
    "patientName": "${name}",
    "overallArc": "One sentence describing the overall health journey arc — like a book summary",
    "healthScore": 72,
    "healthGrade": "B+",
    "trend": "up",
    "trendReason": "Short reason why health is trending this direction",
    "chapters": [
      {
        "id": 1,
        "title": "Chapter title — evocative, like a book chapter",
        "period": "e.g. Early November 2024",
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
  - healthScore is 0-100
  - healthGrade is A+/A/B+/B/C+/C/D/F
  - mood must be: improving, declining, stable
  - Be warm and human, not clinical and cold
  - If data is sparse, write a hopeful "beginning of journey" narrative
  - Never be alarmist — always frame challenges as opportunities`

  // 🔄 REAL CLAUDE CALL
  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.default,
    TIMELINE_SYSTEM_PROMPT,
    3000
  );

  // ✅ TEMP MOCK RESPONSE
  // return {
  // patientName: patientData.name,
  // overallArc: "Your health journey shows steady improvement with increasing self-awareness and consistent follow-up care.",
  // healthScore: 78,
  // healthGrade: "B+",
  // trend: "up",
  // trendReason: "Symptoms appear more controlled and health tracking has been consistent.",
  // chapters: [
  //   {
  //     id: 1,
  //     title: "The Beginning of Awareness",
  //     period: "Early 2026",
  //     type: "challenge",

  //     headline:
  //       "Recurring symptoms encouraged closer attention to personal health.",

  //     story:
  //       "Initial symptom patterns suggested periods of stress and fatigue. Logging symptoms consistently helped create a clearer understanding of health trends over time.",

  //     keyEvents: [
  //       "Started symptom tracking",
  //       "Noticed recurring headaches",
  //     ],
  //     mood: "improving",
  //     insight:
  //       "Consistency in health tracking is helping identify patterns earlier.",
  //   },

  //   {
  //     id: 2,
  //     title: "Building Stability",
  //     period: "Recent Weeks",
  //     type: "improvement",

  //     headline:
  //       "Regular monitoring and appointments helped stabilize symptoms.",

  //     story:
  //       "Recent entries indicate better symptom awareness and healthier routines. Appointment follow-ups appear to be supporting gradual improvement.",

  //     keyEvents: [
  //       "Attended follow-up appointments",
  //       "Maintained medicine adherence",
  //     ],

  //     mood: "stable",

  //     insight:
  //       "Continued follow-up and healthy routines may further improve long-term wellbeing.",
  //   },
  // ],

  // aiMessage: "You've shown encouraging consistency in monitoring your health. Small, steady habits are creating meaningful progress over time.",
  // nextChapter: "With continued tracking and timely care, the next stage of your health journey may become more stable and predictable.",
  // strengths: [
  //   "Consistent symptom tracking",
  //   "Improved self-awareness",
  //   "Following medical guidance",
  // ],

  // watchPoints: [
  //   "Monitor recurring fatigue",
  //   "Continue regular follow-ups",
  // ],
  // };
};


// ─────────────────────────────────────────────────────────────
// FEATURE 7: Generate Clinical Brief
// ─────────────────────────────────────────────────────────────
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
            "probability": "High",
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

      priorityLevel: routine | urgent | critical
      probability: High | Moderate | Low`;


    // 🔄 REAL CLAUDE CALL
    return await callClaude(
      [{ role: "user", content: prompt }],
      MODELS.default,
      CLINICAL_BRIEF_SYSTEM_PROMPT
    );  


  // Mock Return
  // return {
  //   clinicalSummary:
  //     "Patient shows recurring fatigue and headache patterns with stable vitals overall.",

  //   redFlags: [
  //     "Persistent headaches for multiple days"
  //   ],

  //   differentials: [
  //     {
  //       condition: "Migraine",
  //       probability: "High",
  //       reasoning:
  //         "Headache pattern and symptom history are clinically consistent."
  //     },
  //     {
  //       condition: "Tension Headache",
  //       probability: "Moderate",
  //       reasoning:
  //         "Stress-related symptom overlap present."
  //     }
  //   ],

  //   recommendedTests: [
  //     "CBC",
  //     "Blood Pressure Monitoring",
  //     "Vitamin D Test"
  //   ],

  //   currentMedications: [
  //     "Paracetamol"
  //   ],

  //   drugInteractionRisk: false,

  //   drugInteractionNote: null,

  //   priorityLevel: "routine",

  //   priorityReason:
  //     "Symptoms appear manageable but require follow-up.",

  //   talkingPoints: [
  //     "Discuss headache frequency",
  //     "Review sleep quality"
  //   ],

  //   lastVisitSummary:
  //     "Previous visit involved fatigue and mild headache concerns."
  // };
};

// ─────────────────────────────────────────────────────────────
// FEATURE 8: Generate SOAP note service
// ─────────────────────────────────────────────────────────────
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

  // 🔄 REAL CLAUDE CALL
  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.default,
    SOAP_SYSTEM_PROMPT
  );

  // Mock Return 
  // return {
  //   subjective: {
  //     chiefComplaint:
  //       "Recurring headaches and fatigue",

  //     historyOfPresentIllness:
  //       "Patient reports intermittent headaches over the last several days associated with mild fatigue.",

  //     reviewOfSystems: [
  //       "Headache present",
  //       "No fever",
  //       "No vomiting"
  //     ]
  //   },

  //   objective: {
  //     vitalSigns: "Stable",

  //     physicalExam:
  //       "No acute distress observed.",

  //     labResults:
  //       "Pending"
  //   },

  //   assessment: {
  //     primaryDiagnosis:
  //       "Migraine",

  //     differentialDiagnoses: [
  //       "Tension headache",
  //       "Sinus headache"
  //     ],

  //     clinicalImpression:
  //       "Symptoms most consistent with migraine without alarming neurological findings."
  //   },

  //   plan: {
  //     medications: [
  //       "Paracetamol 500mg"
  //     ],

  //     investigations: [
  //       "CBC"
  //     ],

  //     followUp:
  //       "Review in 5 days if symptoms persist.",

  //     patientEducation:
  //       "Advised hydration and proper sleep hygiene.",

  //     referrals: []
  //   },

  //   icdCode: "G43.909",

  //   icdDescription:
  //     "Migraine, unspecified"
  // };
};


// ─────────────────────────────────────────────────────────────
// FEATURE 9: Generate Pre-Appointment service
// ─────────────────────────────────────────────────────────────
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

  // 🔄 REAL CLAUDE CALL
  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.default,
    PRE_APPOINTMENT_SYSTEM_PROMPT
  );

  // ✅ TEMP MOCK RESPONSE
  // return {
  //   greeting:
  //     "You're well prepared for your upcoming appointment.",

  //   keySymptomsToBring: [
  //     "Headache frequency",
  //     "Fatigue levels"
  //   ],

  //   questionsToAsk: [
  //     "What may be causing these headaches?",
  //     "Do I need additional tests?",
  //     "Are lifestyle changes recommended?"
  //   ],

  //   doBeforeAppointment: [
  //     "Bring previous prescriptions",
  //     "Stay hydrated before visit"
  //   ],

  //   whatToExpect:
  //     "Your doctor will likely review symptoms, ask about duration, and may recommend tests.",

  //   bringWith: [
  //     "Government ID",
  //     "Medication list"
  //   ],

  //   symptomSummary:
  //     "Recent symptoms mainly involve headaches and tiredness.",

  //   urgentFlag: false,

  //   urgentMessage: null
  // };
};


// ─────────────────────────────────────────────────────────────
// FEATURE 10: Diagnosis Assist service
// ─────────────────────────────────────────────────────────────
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

    Generate evidence-based differential diagnoses ranked by clinical probability.

    Return ONLY this JSON:
    {
      "primaryDiagnosis": {
        "name": "Most likely diagnosis",
        "icdCode": "ICD-10 code",
        "probability": 78,
        "clinicalBasis": "Why this is most likely based on symptoms",
        "keyFindings": ["finding supporting this diagnosis"],
        "firstLineManagement": "Standard first-line treatment"
      },
      "differentials": [
        {
          "name": "Second likely diagnosis",
          "icdCode": "ICD-10 code",
          "probability": 45,
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

  // 🔄 REAL CLAUDE CALL
  return await callClaude(
    [{ role: "user", content: prompt }],
    MODELS.default,
    DIAGNOSIS_ASSIST_SYSTEM_PROMPT
  );
  

  // ✅ TEMP MOCK RESPONSE
  // return {
  //   primaryDiagnosis: {
  //     name: "Migraine",

  //     icdCode: "G43.909",

  //     probability: 78,

  //     clinicalBasis:
  //       "Pattern of recurring headaches strongly suggests migraine.",

  //     keyFindings: [
  //       "Recurring headache history",
  //       "Fatigue association"
  //     ],

  //     firstLineManagement:
  //       "Hydration, rest, trigger avoidance, analgesics"
  //   },

  //   differentials: [
  //     {
  //       name: "Tension Headache",

  //       icdCode: "G44.209",

  //       probability: 45,

  //       distinguishingFeature:
  //         "Typically stress related with band-like pain.",

  //       rulingOutTest:
  //         "Clinical evaluation"
  //     }
  //   ],

  //   mustRuleOut: {
  //     condition:
  //       "Intracranial pathology",

  //     reason:
  //       "Persistent headaches may rarely indicate serious disease.",

  //     urgentTest:
  //       "MRI Brain"
  //   },

  //   suggestedInvestigations: [
  //     "CBC",
  //     "MRI Brain",
  //     "Blood Pressure Monitoring"
  //   ],

  //   redFlagSymptoms: [
  //     "Sudden severe headache",
  //     "Vision changes"
  //   ],

  //   clinicalPearl:
  //     "Migraine diagnosis is often clinical and pattern-based.",

  //   referralNeeded: false,

  //   referralSpecialty: null
  // };
};
