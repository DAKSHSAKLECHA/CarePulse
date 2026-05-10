// src/components/ClinicalDecisionSupport.jsx
// ─── CareAI Clinical Decision Support System (CDSS) ──────────
//
// The most clinically advanced feature in CarePulse.
// Used by real hospitals worldwide — now in your project.
//
// Contains 4 components:
//   1. ClinicalBrief       → Doctor sees AI pre-analysis per patient
//   2. SOAPNoteGenerator   → Auto-generates hospital-standard notes
//   3. PreAppointmentBrief → Patient gets "what to tell your doctor"
//   4. DiagnosisAssist     → 3 ranked differentials with reasoning
//
// DOCTOR DASHBOARD usage:
//   import { ClinicalBrief, SOAPNoteGenerator, DiagnosisAssist } from "../components/ClinicalDecisionSupport";
//
// PATIENT DASHBOARD usage:
//   import { PreAppointmentBrief } from "../components/ClinicalDecisionSupport";
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Stethoscope, FileText, AlertTriangle, ChevronDown,
  ChevronUp, Sparkles, RefreshCw, Copy, CheckCircle,
  Brain, Shield, Clock, User, Pill, TrendingUp,
  AlertCircle, BookOpen, Zap, Activity,
} from "lucide-react";
import { 
  generateClinicalBrief,
  generateSOAPNote,
  generatePreAppointmentBrief,
  generateDiagnosisAssist,
} from "../../services/aiService";

// ── Design tokens ─────────────────────────────────────────────
const FF    = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY  = "#0d1b2a";
const TEAL  = "#0a7e6e";
const INDIGO = "#4f46e5";
const card  = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };


// ── Shared loading state ──────────────────────────────────────
function AILoader({ label = "CareAI is analysing…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "linear-gradient(135deg,#f0fdf9,#eff6ff)", borderRadius: 14, border: "1px solid rgba(10,126,110,0.12)" }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${TEAL}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
      <p style={{ fontWeight: 600, color: TEAL, margin: 0, fontSize: "0.82rem" }}>{label}</p>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: copied ? "#f0fdf9" : "#f8fafc", border: `1px solid ${copied ? "rgba(10,126,110,0.2)" : "#e2e8f0"}`, color: copied ? TEAL : "#64748b", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", fontFamily: FF, transition: "all 0.2s" }}>
      {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 1: ClinicalBrief
// Shows on doctor's patient card — AI pre-analysis of the patient
// before the doctor opens the appointment
// ─────────────────────────────────────────────────────────────
export function ClinicalBrief({ patient, appointments = [], symptoms = [] }) {
  const [brief,   setBrief]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  appointments = Array.isArray(appointments)
    ? appointments
    : [];

  symptoms = Array.isArray(symptoms)
    ? symptoms
    : [];

  if (!patient?._id) {
    return null;
  }

  const patientAppts = appointments.filter(
    a => String(a.patient?._id || a.patient) === String(patient._id)
  );

  const generate = useCallback(async () => {
    if (brief) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const apptSummary = patientAppts.slice(0, 8).map(a =>
        `${a.date || a.createdAt}: ${a.reason || "General"} — ${a.status}${a.notes ? " | Notes: " + a.notes : ""}`
      ).join("\n");

      const symptomSummary = symptoms.slice(0, 10).map(s =>
        `${s.date}: ${s.symptoms} (mood: ${s.mood})`
      ).join("\n");

      const result = await generateClinicalBrief(
        patient,
        patientAppts,
        symptoms
      );

      setBrief(result);
      setOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("CareAI clinical brief unavailable.");
    } finally {
      setLoading(false);
    }
  }, [patient, patientAppts, symptoms, brief]);

  const priorityColor = brief?.priorityLevel === "critical" ? "#dc2626"
    : brief?.priorityLevel === "urgent" ? "#b45309" : TEAL;

  return (
    <div style={{ marginTop: 10 }}>
      {/* Trigger button */}
      <button onClick={generate} disabled={loading}
        style={{ width: "100%", padding: "9px 14px", borderRadius: 11, background: brief ? "#f8fafc" : `linear-gradient(135deg, ${INDIGO}, #6366f1)`, border: brief ? "1px solid #e2e8f0" : "none", color: brief ? "#64748b" : "white", fontWeight: 700, fontSize: "0.78rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: !brief ? "0 4px 14px rgba(79,70,229,0.3)" : "none", opacity: loading ? 0.8 : 1 }}>
        {loading ? (
          <><div style={{ width: 12, height: 12, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Generating Brief…</>
        ) : brief ? (
          <>{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? "Hide" : "View"} Clinical Brief</>
        ) : (
          <><Brain size={13} /> ✦ Generate Clinical Brief</>
        )}
      </button>

      {/* Brief content */}
      <AnimatePresence>
        {open && brief && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 10, background: "linear-gradient(160deg, #f8fafc, #f0f9ff)", borderRadius: 16, border: "1px solid #e0e7ff", overflow: "hidden" }}>

              {/* Priority banner */}
              <div style={{ padding: "10px 16px", background: `${priorityColor}10`, borderBottom: `1px solid ${priorityColor}20`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor, animation: brief.priorityLevel === "critical" ? "pulse 1.5s ease-in-out infinite" : "none" }} />
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: priorityColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>{brief.priorityLevel} priority</span>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{brief.priorityReason}</span>
              </div>

              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Clinical summary */}
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Clinical Overview</p>
                  <p style={{ fontSize: "0.82rem", color: "#1e293b", margin: 0, lineHeight: 1.65, fontStyle: "italic" }}>"{brief.clinicalSummary}"</p>
                </div>

                {/* Red flags */}
                {brief.redFlags?.length > 0 && (
                  <div style={{ background: "#fef2f2", borderRadius: 11, padding: "10px 13px", border: "1px solid rgba(220,38,38,0.15)" }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertTriangle size={10} /> Red Flags
                    </p>
                    {brief.redFlags.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#dc2626", flexShrink: 0, marginTop: 7 }} />
                        <p style={{ fontSize: "0.75rem", color: "#7f1d1d", margin: 0 }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Differentials */}
                {brief.differentials?.length > 0 && (
                  <div>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 7px" }}>Likely Differentials</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {brief.differentials.map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 10, padding: "9px 12px", border: "1px solid #e8edf2", display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, background: i === 0 ? `${INDIGO}10` : "#f8fafc", color: i === 0 ? INDIGO : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.7rem", flexShrink: 0 }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                              <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.8rem" }}>{d.condition}</p>
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: d.probability === "High" ? "#dc2626" : d.probability === "Moderate" ? "#b45309" : "#16a34a", background: d.probability === "High" ? "#fef2f2" : d.probability === "Moderate" ? "#fffbeb" : "#f0fdf4", padding: "1px 7px", borderRadius: 99 }}>{d.probability}</span>
                            </div>
                            <p style={{ fontSize: "0.73rem", color: "#64748b", margin: 0 }}>{d.reasoning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom row: tests + talking points */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {brief.recommendedTests?.length > 0 && (
                    <div style={{ background: "white", borderRadius: 11, padding: "10px 12px", border: "1px solid #e8edf2" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Activity size={9} /> Suggested Tests
                      </p>
                      {brief.recommendedTests.slice(0, 3).map((t, i) => (
                        <p key={i} style={{ fontSize: "0.73rem", color: "#334155", margin: "0 0 3px" }}>• {t}</p>
                      ))}
                    </div>
                  )}
                  {brief.talkingPoints?.length > 0 && (
                    <div style={{ background: "white", borderRadius: 11, padding: "10px 12px", border: "1px solid #e8edf2" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Stethoscope size={9} /> Address Today
                      </p>
                      {brief.talkingPoints.slice(0, 2).map((t, i) => (
                        <p key={i} style={{ fontSize: "0.73rem", color: "#334155", margin: "0 0 3px" }}>• {t}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drug interaction warning */}
                {brief.drugInteractionRisk && (
                  <div style={{ background: "#fffbeb", borderRadius: 11, padding: "9px 13px", border: "1px solid rgba(180,83,9,0.2)", display: "flex", gap: 8 }}>
                    <AlertCircle size={14} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: "0.75rem", color: "#92400e", margin: 0 }}><strong>Drug Interaction Risk:</strong> {brief.drugInteractionNote}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 2: SOAPNoteGenerator
// Auto-generates hospital-standard SOAP notes
// Place inside PatientsTab or AppointmentsTab
// ─────────────────────────────────────────────────────────────
export function SOAPNoteGenerator({ patient, appointment }) {
  const [soap,    setSoap]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const generate = useCallback(async () => {
    if (soap) { setOpen(o => !o); return; }
    setLoading(true);
    try {

      const result = await generateSOAPNote(
        patient,
        appointment
      );

      setSoap(result);
      setOpen(true);
    } catch (e) {
      toast.error("SOAP note generation failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [patient, appointment, soap]);

  const soapText = soap ? `SOAP NOTE — ${patient?.name}
Date: ${appointment?.date || new Date().toLocaleDateString("en-IN")}
ICD-10: ${soap.icdCode} — ${soap.icdDescription}

SUBJECTIVE
Chief Complaint: ${soap.subjective?.chiefComplaint}
HPI: ${soap.subjective?.historyOfPresentIllness}
ROS: ${soap.subjective?.reviewOfSystems?.join(", ")}

OBJECTIVE
Vitals: ${soap.objective?.vitalSigns}
Physical Exam: ${soap.objective?.physicalExam}
Labs: ${soap.objective?.labResults}

ASSESSMENT
Primary Dx: ${soap.assessment?.primaryDiagnosis}
Differentials: ${soap.assessment?.differentialDiagnoses?.join(", ")}
Impression: ${soap.assessment?.clinicalImpression}

PLAN
Medications: ${soap.plan?.medications?.join(", ")}
Investigations: ${soap.plan?.investigations?.join(", ")}
Follow-up: ${soap.plan?.followUp}
Patient Education: ${soap.plan?.patientEducation}` : "";

  return (
    <div style={{ ...card, overflow: "hidden", marginTop: 14 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #0d1b2a, #1e3a5f)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={15} color="white" />
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "0.88rem" }}>✦ AI-Assisted SOAP Note</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", margin: 0 }}>Hospital-standard clinical documentation</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {soap && <CopyBtn text={soapText} />}
          <button onClick={generate} disabled={loading}
            style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: "0.72rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5 }}>
            {loading ? <><div style={{ width: 10, height: 10, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating…</> : soap ? <>{open ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {open ? "Hide" : "Show"} SOAP</> : <><Sparkles size={12} /> Generate SOAP</>}
          </button>
        </div>
      </div>

      {/* SOAP content */}
      <AnimatePresence>
        {open && soap && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px" }}>

              {/* ICD badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${INDIGO}08`, borderRadius: 9, padding: "5px 12px", border: `1px solid ${INDIGO}20`, marginBottom: 16 }}>
                <Shield size={12} color={INDIGO} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: INDIGO }}>ICD-10: {soap.icdCode}</span>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>— {soap.icdDescription}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* S */}
                <SOAPSection letter="S" title="Subjective" color="#0a7e6e">
                  <SOAPRow label="Chief Complaint" value={soap.subjective?.chiefComplaint} />
                  <SOAPRow label="HPI" value={soap.subjective?.historyOfPresentIllness} />
                  {soap.subjective?.reviewOfSystems?.length > 0 && (
                    <SOAPRow label="ROS" value={soap.subjective.reviewOfSystems.join(" · ")} />
                  )}
                </SOAPSection>

                {/* O */}
                <SOAPSection letter="O" title="Objective" color="#1d4ed8">
                  <SOAPRow label="Vitals" value={soap.objective?.vitalSigns} />
                  <SOAPRow label="Exam" value={soap.objective?.physicalExam} />
                  <SOAPRow label="Labs" value={soap.objective?.labResults} />
                </SOAPSection>

                {/* A */}
                <SOAPSection letter="A" title="Assessment" color="#7c3aed">
                  <SOAPRow label="Primary Dx" value={soap.assessment?.primaryDiagnosis} highlight />
                  {soap.assessment?.differentialDiagnoses?.length > 0 && (
                    <SOAPRow label="Differentials" value={soap.assessment.differentialDiagnoses.join(", ")} />
                  )}
                  <SOAPRow label="Impression" value={soap.assessment?.clinicalImpression} />
                </SOAPSection>

                {/* P */}
                <SOAPSection letter="P" title="Plan" color="#b45309">
                  {soap.plan?.medications?.length > 0 && (
                    <SOAPRow label="Medications" value={soap.plan.medications.join(" · ")} />
                  )}
                  {soap.plan?.investigations?.length > 0 && (
                    <SOAPRow label="Investigations" value={soap.plan.investigations.join(", ")} />
                  )}
                  <SOAPRow label="Follow-up" value={soap.plan?.followUp} />
                  <SOAPRow label="Education" value={soap.plan?.patientEducation} />
                </SOAPSection>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SOAPSection({ letter, title, color, children }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 14, padding: "13px 14px", border: "1px solid #f0f4f8" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.85rem" }}>{letter}</div>
        <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.8rem" }}>{title}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{children}</div>
    </div>
  );
}

function SOAPRow({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div>
      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: "0.75rem", color: highlight ? NAVY : "#334155", fontWeight: highlight ? 700 : 400, margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 3: PreAppointmentBrief
// Patient-facing — shown on patient dashboard before appointment
// "What to tell your doctor today"
// ─────────────────────────────────────────────────────────────
export function PreAppointmentBrief({ appointment, recentSymptoms = [] }) {
  const [brief,   setBrief]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  if (!appointment) return null;

  const generate = useCallback(async () => {
    if (brief) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const symptomSummary = recentSymptoms.slice(0, 7).map(s =>
        `${s.date}: ${s.symptoms} (mood: ${s.mood})`
      ).join("\n");

      const result = await generatePreAppointmentBrief(
        appointment,
        recentSymptoms
      );
      setBrief(result);
      setOpen(true);
    } catch (e) {
      toast.error("CareAI brief unavailable. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [appointment, recentSymptoms, brief]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...card, overflow: "hidden", marginBottom: 16 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={16} color="white" />
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "0.9rem" }}>✦ Pre-Appointment Brief</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", margin: 0 }}>
              Appointment with Dr. {appointment.doctor?.name} · {appointment.date}
            </p>
          </div>
        </div>
        <button onClick={generate} disabled={loading}
          style={{ padding: "7px 16px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "white", fontWeight: 700, fontSize: "0.75rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <><div style={{ width: 11, height: 11, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Preparing…</> : brief ? open ? "Hide" : "Show Brief" : <><Sparkles size={13} /> Prepare Me</>}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {open && brief && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Greeting */}
              <p style={{ fontSize: "0.875rem", color: "#1e293b", margin: 0, lineHeight: 1.65, fontStyle: "italic" }}>"{brief.greeting}"</p>

              {/* Urgent flag */}
              {brief.urgentFlag && (
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(220,38,38,0.2)", display: "flex", gap: 8 }}>
                  <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.78rem", color: "#dc2626", margin: 0, fontWeight: 600 }}>{brief.urgentMessage}</p>
                </div>
              )}

              {/* Symptom summary to read out */}
              <div style={{ background: `${TEAL}08`, borderRadius: 12, padding: "11px 14px", border: `1px solid ${TEAL}15` }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>Read This to Your Doctor</p>
                <p style={{ fontSize: "0.82rem", color: "#1e293b", margin: 0, lineHeight: 1.6 }}>{brief.symptomSummary}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Symptoms to mention */}
                <BriefCard icon={<Activity size={13} />} title="Mention These Symptoms" color={TEAL} items={brief.keySymptomsToBring} />
                {/* Questions to ask */}
                <BriefCard icon={<BookOpen size={13} />} title="Questions to Ask" color={INDIGO} items={brief.questionsToAsk} />
                {/* Do before */}
                <BriefCard icon={<CheckCircle size={13} />} title="Before You Go" color="#16a34a" items={brief.doBeforeAppointment} />
                {/* Bring with */}
                <BriefCard icon={<User size={13} />} title="Bring With You" color="#b45309" items={brief.bringWith} />
              </div>

              {/* What to expect */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "11px 14px", border: "1px solid #e8edf2" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>What to Expect</p>
                <p style={{ fontSize: "0.8rem", color: "#334155", margin: 0, lineHeight: 1.6 }}>{brief.whatToExpect}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BriefCard({ icon, title, color, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "11px 13px", border: "1px solid #e8edf2" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, marginBottom: 8 }}>
        {icon}
        <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{title}</p>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 7 }} />
          <p style={{ fontSize: "0.75rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 4: DiagnosisAssist
// Shown in PrescriptionTab — CareAI suggests differential diagnoses
// based on patient symptoms before doctor writes prescription
// ─────────────────────────────────────────────────────────────
export function DiagnosisAssist({ patient, symptoms = [], onDiagnosisSelect }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const generate = useCallback(async () => {
    if (result) { setOpen(o => !o); return; }
    if (!patient) { toast.error("Select a patient first."); return; }
    setLoading(true);
    try {
      const symptomSummary = symptoms.slice(0, 10).map(s =>
        `${s.date}: ${s.symptoms} (mood: ${s.mood}, notes: ${s.notes || "none"})`
      ).join("\n");
 
      const res = await generateDiagnosisAssist(
        patient,
        symptoms
      );
      setResult(res);
      setOpen(true);
    } catch (e) {
      toast.error("CareAI diagnosis assist unavailable.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [patient, symptoms, result]);

  return (
    <div style={{ ...card, overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #4c1d95, #7c3aed)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "0.9rem" }}>✦ CareAI Diagnosis Assist</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.65rem", margin: 0 }}>Evidence-based differential diagnoses</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading || !patient}
          style={{ padding: "7px 16px", borderRadius: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontWeight: 700, fontSize: "0.75rem", cursor: loading || !patient ? "not-allowed" : "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6, opacity: !patient ? 0.5 : 1 }}>
          {loading ? <><div style={{ width: 11, height: 11, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Analysing…</> : result ? <>{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? "Hide" : "Show"} Diagnoses</> : <><Zap size={13} /> Analyse Patient</>}
        </button>
      </div>

      {!patient && (
        <div style={{ padding: "14px 18px", color: "#94a3b8", fontSize: "0.8rem", fontStyle: "italic" }}>
          Select a patient above to enable CareAI diagnosis assistance.
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {open && result && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Primary diagnosis */}
              <div style={{ background: "linear-gradient(135deg, #4c1d9510, #7c3aed08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(124,58,237,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>Primary Diagnosis</span>
                    <h3 style={{ fontWeight: 800, color: NAVY, margin: "3px 0 0", fontSize: "1rem" }}>{result.primaryDiagnosis?.name}</h3>
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>ICD-10: {result.primaryDiagnosis?.icdCode}</span>
                  </div>
                  <div style={{ textAlign: "center", background: "white", borderRadius: 12, padding: "8px 12px", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <p style={{ fontWeight: 800, color: "#7c3aed", margin: 0, fontSize: "1.2rem", lineHeight: 1 }}>{result.primaryDiagnosis?.probability}%</p>
                    <p style={{ fontSize: "0.58rem", color: "#94a3b8", margin: 0 }}>probability</p>
                  </div>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#334155", margin: "0 0 10px", lineHeight: 1.6 }}>{result.primaryDiagnosis?.clinicalBasis}</p>
                <div style={{ background: "white", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(124,58,237,0.1)" }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>First-line Management</p>
                  <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0 }}>{result.primaryDiagnosis?.firstLineManagement}</p>
                </div>
                {onDiagnosisSelect && (
                  <button onClick={() => onDiagnosisSelect(result.primaryDiagnosis?.name)}
                    style={{ marginTop: 10, padding: "7px 16px", borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "white", fontWeight: 700, fontSize: "0.72rem", border: "none", cursor: "pointer", fontFamily: FF }}>
                    Use This Diagnosis →
                  </button>
                )}
              </div>

              {/* Differentials */}
              {result.differentials?.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Differential Diagnoses</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {result.differentials.map((d, i) => (
                      <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "11px 14px", border: "1px solid #e8edf2", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.82rem" }}>{d.name}</p>
                            <span style={{ fontSize: "0.62rem", color: "#94a3b8" }}>{d.icdCode}</span>
                          </div>
                          <p style={{ fontSize: "0.73rem", color: "#64748b", margin: "0 0 4px" }}>{d.distinguishingFeature}</p>
                          <p style={{ fontSize: "0.7rem", color: TEAL, margin: 0, fontWeight: 600 }}>Rule out: {d.rulingOutTest}</p>
                        </div>
                        <div style={{ textAlign: "center", flexShrink: 0 }}>
                          <p style={{ fontWeight: 800, color: "#64748b", margin: 0, fontSize: "0.9rem" }}>{d.probability}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Must rule out */}
              {result.mustRuleOut && (
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px", display: "flex", alignItems: "center", gap: 5 }}>
                    <AlertTriangle size={10} /> Must Rule Out
                  </p>
                  <p style={{ fontWeight: 700, color: "#7f1d1d", margin: "0 0 3px", fontSize: "0.82rem" }}>{result.mustRuleOut.condition}</p>
                  <p style={{ fontSize: "0.75rem", color: "#991b1b", margin: "0 0 5px" }}>{result.mustRuleOut.reason}</p>
                  <p style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600, margin: 0 }}>Order: {result.mustRuleOut.urgentTest}</p>
                </div>
              )}

              {/* Bottom row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {result.suggestedInvestigations?.length > 0 && (
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "11px 13px", border: "1px solid #e8edf2" }}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 7px", display: "flex", alignItems: "center", gap: 4 }}><Activity size={9} /> Investigations</p>
                    {result.suggestedInvestigations.map((inv, i) => (
                      <p key={i} style={{ fontSize: "0.73rem", color: "#334155", margin: "0 0 3px" }}>• {inv}</p>
                    ))}
                  </div>
                )}
                <div style={{ background: "#f0fdf9", borderRadius: 12, padding: "11px 13px", border: "1px solid rgba(10,126,110,0.12)" }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 7px", display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={9} /> Clinical Pearl</p>
                  <p style={{ fontSize: "0.75rem", color: "#1e293b", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>"{result.clinicalPearl}"</p>
                </div>
              </div>

              {result.referralNeeded && (
                <div style={{ background: "#eff6ff", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(29,78,216,0.15)", display: "flex", gap: 8, alignItems: "center" }}>
                  <User size={14} color="#1d4ed8" />
                  <p style={{ fontSize: "0.78rem", color: "#1e40af", fontWeight: 600, margin: 0 }}>Referral recommended: <strong>{result.referralSpecialty}</strong></p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}