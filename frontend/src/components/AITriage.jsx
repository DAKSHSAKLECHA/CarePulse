// src/components/AITriage.jsx
// ─── AI Triage System ─────────────────────────────────────────
// HOW TO USE: Wrap your booking button in DoctorsList.jsx
//
// import AITriage from "../components/AITriage";
//
// In your DoctorsList, replace the direct booking button with:
//   <AITriage onTriageComplete={(result) => {
//     if (result.shouldBook) setBookingModalOpen(true);
//   }} />
//
// Or render it as a standalone pre-booking screen.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTriageAssessment } from "../../services/aiService";
import toast from "react-hot-toast";
import {
  Activity, ChevronRight, AlertTriangle, CheckCircle,
  Phone, Clock, Home, Stethoscope, X, ArrowLeft,
} from "lucide-react";

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY = "#0d1b2a";

const card = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

const URGENCY_STYLES = {
  emergency: {
    grad:   "linear-gradient(135deg, #7c2d12, #dc2626)",
    color:  "#dc2626",
    bg:     "#fef2f2",
    icon:   "🚨",
    border: "rgba(220,38,38,0.2)",
  },
  urgent: {
    grad:   "linear-gradient(135deg, #92400e, #b45309)",
    color:  "#b45309",
    bg:     "#fffbeb",
    icon:   "⚠️",
    border: "rgba(180,83,9,0.2)",
  },
  routine: {
    grad:   "linear-gradient(135deg, #1d4ed8, #4f46e5)",
    color:  "#1d4ed8",
    bg:     "#eff6ff",
    icon:   "📅",
    border: "rgba(29,78,216,0.2)",
  },
  self_care: {
    grad:   "linear-gradient(135deg, #065f46, #0a7e6e)",
    color:  "#0a7e6e",
    bg:     "#f0fdf9",
    icon:   "🏠",
    border: "rgba(10,126,110,0.2)",
  },
};

const STEPS = [
  {
    id: "mainSymptom",
    question: "What's your main symptom or concern?",
    type: "text",
    placeholder: "e.g. chest pain, fever, severe headache…",
    icon: "🩺",
  },
  {
    id: "duration",
    question: "How long have you had this symptom?",
    type: "select",
    options: ["Just started (today)", "1-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks", "Comes and goes"],
    icon: "⏱",
  },
  {
    id: "severity",
    question: "Rate your pain/discomfort severity",
    type: "slider",
    min: 1, max: 10,
    icon: "📊",
  },
  {
    id: "existingConditions",
    question: "Do you have any existing medical conditions?",
    type: "text",
    placeholder: "e.g. diabetes, hypertension, or type 'none'",
    icon: "📋",
  },
  {
    id: "ageGroup",
    question: "What is your age group?",
    type: "select",
    options: ["Under 18", "18–30", "31–45", "46–60", "60–75", "75+"],
    icon: "👤",
  },
];

function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Step {step} of {total}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4f46e5" }}>{Math.round((step / total) * 100)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${(step / total) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4f46e5, #6366f1)" }}
        />
      </div>
    </div>
  );
}

export default function AITriage({ onTriageComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers,     setAnswers]     = useState({ severity: 5 });
  const [analyzing,   setAnalyzing]   = useState(false);
  const [result,      setResult]      = useState(null);

  const token = localStorage.getItem("token");

  const step = STEPS[currentStep];

  const updateAnswer = (id, value) => setAnswers(a => ({ ...a, [id]: value }));

  const next = async (currentValue = answers[step.id]) => {
    if (!currentValue && step.type !== "slider") {
      toast.error("Please answer before continuing.");
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Final step — run triage
      setAnalyzing(true);
      try {
        const res = await getTriageAssessment(answers, token);
        setResult(res);
      } catch (e) {
        toast.error("AI triage failed.");
        console.error(e);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const urgCfg = result ? URGENCY_STYLES[result.urgencyLevel] || URGENCY_STYLES.routine : null;

  // ── Result screen ──
  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Urgency Banner */}
        <div style={{ background: urgCfg.grad, borderRadius: 20, padding: "1.8rem 2rem", marginBottom: 18, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(20px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{urgCfg.icon}</div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.3rem", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{result.urgencyLabel}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", margin: "0 0 12px" }}>{result.headline}</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", margin: 0 }}>{result.explanation}</p>
          </div>
        </div>

        {/* Emergency action */}
        {result.urgencyLevel === "emergency" && result.emergencyNote && (
          <div style={{ background: "#fef2f2", borderRadius: 16, padding: "14px 18px", border: "2px solid rgba(220,38,38,0.3)", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 800, color: "#dc2626", margin: "0 0 4px", fontSize: "0.9rem" }}>Immediate Action Required</p>
              <p style={{ color: "#dc2626", fontSize: "0.82rem", margin: 0 }}>{result.emergencyNote}</p>
              <button style={{ marginTop: 10, padding: "8px 18px", borderRadius: 10, background: "#dc2626", color: "white", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={13} /> Call Emergency Services
              </button>
            </div>
          </div>
        )}

        {/* Details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[
            { icon: <Stethoscope size={14} />, label: "Suggested Specialty", value: result.suggestedSpecialty, color: "#4f46e5" },
            { icon: <Clock size={14} />,       label: "Recommended Wait",    value: result.estimatedWait,      color: "#b45309" },
          ].map((f, i) => (
            <div key={i} style={{ ...card, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: f.color, marginBottom: 5 }}>
                {f.icon}<span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</span>
              </div>
              <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.88rem" }}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* Home care tips (if applicable) */}
        {result.homeCareTips?.length > 0 && result.urgencyLevel !== "emergency" && (
          <div style={{ ...card, padding: "1.2rem 1.4rem", marginBottom: 14 }}>
            <h4 style={{ fontWeight: 800, color: NAVY, fontSize: "0.82rem", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <Home size={14} /> While you wait
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {result.homeCareTips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "0.8rem", color: "#4a6070", margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {result.shouldBook && (
            <button onClick={() => onTriageComplete?.(result)}
              style={{ flex: 1, padding: "12px 20px", borderRadius: 12, background: urgCfg.grad, color: "white", fontWeight: 800, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Book Appointment <ChevronRight size={15} />
            </button>
          )}
          <button onClick={() => { setResult(null); setCurrentStep(0); setAnswers({ severity: 5 }); }}
            style={{ padding: "12px 18px", borderRadius: 12, background: "#f1f5f9", border: "none", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: FF }}>
            Redo Triage
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Analyzing screen ──
  if (analyzing) {
    return (
      <div style={{ ...card, padding: "3rem", textAlign: "center" }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <Activity size={40} color="#4f46e5" style={{ marginBottom: 16 }} />
        </motion.div>
        <p style={{ fontWeight: 800, color: NAVY, margin: "0 0 6px", fontSize: "1rem" }}>✦ CareAI Clinical Assessment in Progress…</p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>Assessing urgency level and recommendations</p>
      </div>
    );
  }

  // ── Question screen ──
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={currentStep}>

      {/* Header */}
      <div style={{ ...card, padding: "1.6rem 2rem", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,70,229,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              {step.icon}
            </div>
            <div>
              <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem" }}>✦ CareAI Pre-Screening</p>
              <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0 }}>Quick 5-question pre-screening</p>
            </div>
          </div>
          {onSkip && (
            <button onClick={onSkip} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontFamily: FF, fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              Skip <ChevronRight size={12} />
            </button>
          )}
        </div>
        <ProgressBar step={currentStep + 1} total={STEPS.length} />

        <h2 style={{ fontWeight: 800, color: NAVY, margin: "0 0 16px", fontSize: "1rem" }}>{step.question}</h2>

        {/* Input types */}
        {step.type === "text" && (
          <input
            value={answers[step.id] || ""}
            onChange={e => updateAnswer(step.id, e.target.value)}
            placeholder={step.placeholder}
            onKeyDown={e => e.key === "Enter" && next()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: "0.9rem", color: NAVY, outline: "none", fontFamily: FF, boxSizing: "border-box" }}
            autoFocus
          />
        )}

        {step.type === "select" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {step.options.map(opt => (
              <button key={opt} onClick={() => {
                updateAnswer(step.id, opt);
                next(opt);
                }}
                style={{ padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${answers[step.id] === opt ? "#4f46e5" : "#e2e8f0"}`, background: answers[step.id] === opt ? "rgba(79,70,229,0.06)" : "#f8fafc", color: answers[step.id] === opt ? "#4f46e5" : "#4a6070", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: FF, textAlign: "left", transition: "all 0.15s" }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.type === "slider" && (
          <div style={{ padding: "8px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Mild</span>
              <span style={{ fontWeight: 800, color: "#4f46e5", fontSize: "1.2rem" }}>{answers.severity}/10</span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Severe</span>
            </div>
            <input type="range" min="1" max="10" value={answers.severity}
              onChange={e => updateAnswer("severity", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#4f46e5" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <span key={n} style={{ fontSize: "0.65rem", color: n <= answers.severity ? "#4f46e5" : "#cbd5e1", fontWeight: n === answers.severity ? 800 : 400 }}>{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        {currentStep > 0 && (
          <button onClick={() => setCurrentStep(s => s - 1)}
            style={{ padding: "11px 18px", borderRadius: 12, background: "#f1f5f9", border: "none", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5 }}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        {step.type !== "select" && (
          <button onClick={next}
            style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "white", fontWeight: 800, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 6px 18px rgba(79,70,229,0.28)" }}>
            {currentStep === STEPS.length - 1 ? "🧠 Analyze" : "Next"} <ChevronRight size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}