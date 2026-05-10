export async function scanPrescription(base64Data, mimeType) {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/ai/scan-prescription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      base64Data,
      mimeType,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Scan failed");
  }

  return await res.json();
}

export async function getTriageAssessment(answers, token) {
  const response = await fetch("/api/ai/triage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(answers),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Triage failed");
  }

  return data;
}


export async function assessPatientRisk(patientName, recentSymptoms) {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/assess-risk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      patientName,
      recentSymptoms,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Risk assessment failed");
  }

  return data;
}

export async function generateHealthTimeline(patientData, mode) {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/ai/health-timeline", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
    patientData,
    mode,
    }),
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.message || "Timeline generation failed");
    }

    return data;
}


export async function generateClinicalBrief(
  patient,
  appointments = [],
  symptoms = []
) {

  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/clinical-brief", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      patient,
      appointments,
      symptoms,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Clinical brief generation failed"
    );
  }

  return data;
}


export async function generateSOAPNote(
  patient,
  appointment
) {

  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/soap-note", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      patient,
      appointment,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "SOAP note generation failed"
    );
  }

  return data;
}


export async function generatePreAppointmentBrief(
  appointment,
  recentSymptoms = []
) {

  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/pre-appointment-brief", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      appointment,
      recentSymptoms,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Pre-appointment brief generation failed"
    );
  }

  return data;
}


export async function generateDiagnosisAssist(
  patient,
  symptoms = []
) {

  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/diagnosis-assist", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      patient,
      symptoms,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Diagnosis assist generation failed"
    );
  }

  return data;
}


export async function sendChatMessage(history) {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ history }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Chat request failed");
  }

  return data;
}


export async function predictDisease(payload) {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/ai/predict-disease", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Disease prediction failed");
  }

  return data;
}