// src/components/PatientRiskPanel.jsx
// ─── Patient Risk Flagging (Doctor Dashboard Widget) ──────────
// HOW TO USE: Add to your DoctorDashboard.jsx Overview tab:
//
// import PatientRiskPanel from "../components/PatientRiskPanel";
// ...
// {tab === "overview" && (
//   <>
//     <OverviewTab ... />
//     <PatientRiskPanel patients={patients} />  ← add this
//   </>
// )}
//
// Uses: GET /api/symptoms/  (existing doctor route — returns all symptoms)
// AI:   Gemini assessPatientRisk per patient (batched, max 5)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { assessPatientRisk } from "../../services/aiService";
import {
  ShieldAlert, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Clock, TrendingUp,
} from "lucide-react";

console.log("NEW AI SERVICE VERSION LOADED");

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY = "#0d1b2a";
const card = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

const RISK_CONFIG = {
  low:      { color: "#16a34a", bg: "#f0fdf4", border: "rgba(22,163,74,0.2)",    icon: "🟢", pulse: false },
  medium:   { color: "#b45309", bg: "#fffbeb", border: "rgba(180,83,9,0.2)",     icon: "🟡", pulse: false },
  high:     { color: "#dc2626", bg: "#fef2f2", border: "rgba(220,38,38,0.2)",    icon: "🔴", pulse: true  },
  critical: { color: "#7c2d12", bg: "#fff7ed", border: "rgba(124,45,18,0.3)",    icon: "🚨", pulse: true  },
};

function RiskGauge({ score, color }) {
  const angle = (score / 100) * 180 - 90; // -90 to 90 degrees
  return (
    <div style={{ position: "relative", width: 60, height: 36, overflow: "hidden" }}>
      <svg width="60" height="36" viewBox="0 0 60 36">
        {/* Track */}
        <path d="M5,35 A25,25 0 0,1 55,35" fill="none" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
        {/* Fill */}
        <path d="M5,35 A25,25 0 0,1 55,35" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 78.5} 78.5`} />
        {/* Needle */}
        <line x1="30" y1="35" x2="30" y2="12"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${angle}, 30, 35)`} />
        <circle cx="30" cy="35" r="3" fill={color} />
      </svg>
    </div>
  );
}

function PatientRiskCard({ patient, symptoms, index }) {
  const [assessment, setAssessment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const patientSymptoms = symptoms.filter(
          s => String(s.patient?._id || s.patient) === String(patient._id)
        );
        if (patientSymptoms.length === 0) {
          setAssessment({ riskLevel: "low", riskScore: 10, riskColor: "green", riskBadge: "No Symptoms", topConcerns: [], deterioratingPattern: false, alertMessage: "No recent symptom logs.", recommendedAction: "Routine follow-up", daysMonitored: 0 });
        } else {
          const result = await assessPatientRisk(patient.name, patientSymptoms);
          console.log("AI RISK RESULT:", {
            patient: patient.name,
            result,
          });
          setAssessment(result);
        }
      } catch (err) {
        console.error("RISK ASSESSMENT ERROR:", err);
        setAssessment({ riskLevel: "low", riskScore: 0, riskColor: "green", riskBadge: "N/A", topConcerns: [], deterioratingPattern: false, alertMessage: "Could not assess risk.", recommendedAction: "Manual review needed", daysMonitored: 0 });
      } finally {
        setLoading(false);
      }
    };
    // Stagger API calls to avoid rate limiting
    const timer = setTimeout(run, index * 1200);
    return () => clearTimeout(timer);
  }, [patient, symptoms, index]);

  const cfg = assessment ? RISK_CONFIG[assessment.riskLevel] || RISK_CONFIG.low : null;
  const isHighRisk = assessment?.riskLevel === "high" || assessment?.riskLevel === "critical";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      style={{ borderRadius: 16, border: `1.5px solid ${cfg ? cfg.border : "#e8edf2"}`, background: cfg ? cfg.bg : "white", overflow: "hidden", transition: "border-color 0.3s" }}>

      {/* High risk pulse indicator */}
      {cfg?.pulse && (
        <div style={{ height: 3, background: "linear-gradient(90deg, #dc2626, #f87171, #dc2626)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />
      )}

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg ? `${cfg.color}15` : "#f1f5f9", color: cfg?.color || "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.95rem", flexShrink: 0, position: "relative" }}>
            {patient.name?.charAt(0)}
            {isHighRisk && (
              <div style={{ position: "absolute", top: -4, right: -4, width: 12, height: 12, borderRadius: "50%", background: "#dc2626", border: "2px solid white", animation: "ping 1s ease-in-out infinite" }} />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.85rem" }}>{patient.name}</p>
              {assessment && !loading && (
                <span style={{ background: cfg.color, color: "white", borderRadius: 99, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.04em" }}>
                  {cfg.icon} {assessment.riskBadge}
                </span>
              )}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: "1px 0 0" }}>{patient.email}</p>
          </div>

          {/* Gauge */}
          {loading ? (
            <div style={{ width: 60, height: 36, background: "#f1f5f9", borderRadius: 8, animation: "pulse 1s ease-in-out infinite" }} />
          ) : (
            <RiskGauge score={assessment.riskScore} color={cfg.color} />
          )}

          {/* Expand toggle */}
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Alert message */}
        {!loading && assessment?.alertMessage && isHighRisk && (
          <div style={{ marginTop: 10, background: "rgba(220,38,38,0.08)", borderRadius: 9, padding: "7px 10px", fontSize: "0.75rem", color: "#dc2626", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
            {assessment.alertMessage}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && assessment && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: `1px solid ${cfg.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px" }}>
              {assessment.topConcerns?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>Top Concerns</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {assessment.topConcerns.map((c, i) => (
                      <span key={i} style={{ background: `${cfg.color}10`, color: cfg.color, borderRadius: 99, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${cfg.border}` }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.03)", borderRadius: 9, padding: "8px 10px" }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>Recommended Action</p>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: NAVY, margin: 0 }}>{assessment.recommendedAction}</p>
                </div>
                {assessment.daysMonitored > 0 && (
                  <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 9, padding: "8px 10px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>Days</p>
                    <p style={{ fontSize: "1rem", fontWeight: 800, color: cfg.color, margin: 0 }}>{assessment.daysMonitored}</p>
                  </div>
                )}
              </div>

              {assessment.deterioratingPattern && (
                <div style={{ marginTop: 8, background: "#fef2f2", borderRadius: 9, padding: "6px 10px", fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  <TrendingUp size={12} /> Deteriorating pattern detected
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.4);opacity:.3} }
        @keyframes shimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </motion.div>
  );
}

export default function PatientRiskPanel({ patients }) {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [allSymptoms, setAllSymptoms] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [active,      setActive]      = useState(false);
  const [refreshKey,  setRefreshKey]  = useState(0);

  const highRiskCount = 0; // will be tracked if needed

  const runAnalysis = async () => {
    setAnalyzing(true);
    setLoading(true);
    try {
      console.log("Fetching symptoms...");
      const res = await axios.get("/api/symptoms/", { headers });
      console.log("Symptoms fetched:", res.data);

      setAllSymptoms(res.data || []);
      setActive(true);
    } catch(err) {
      // Symptoms endpoint might need doctor auth — fallback to empty
      console.error("SYMPTOMS FETCH ERROR:", err);
      setAllSymptoms([]);
      setActive(true);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  // Only assess top 5 patients to manage API costs
  const patientsToAssess = patients.slice(0, 5);

  if (!active) {
    return (
      <div style={{ ...card, padding: "1.6rem", marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert size={18} color="#dc2626" />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem" }}>AI Patient Risk Assessment</p>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>Flag high-risk patients based on symptom patterns</p>
            </div>
          </div>
          <button onClick={runAnalysis} disabled={analyzing}
            style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #dc2626, #f87171)", color: "white", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(220,38,38,0.25)", opacity: analyzing ? 0.7 : 1 }}>
            <ShieldAlert size={14} />
            {analyzing ? "Running…" : `Assess ${patientsToAssess.length} Patients`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...card, padding: "1.6rem", marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 7 }}>
            <ShieldAlert size={16} color="#dc2626" /> AI Risk Assessment
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: "2px 0 0" }}>✦ AI-Assisted patient risk analysis</p>
        </div>
        <button onClick={() => { setRefreshKey(k => k + 1); setActive(false); runAnalysis(); }}
          style={{ padding: "6px 14px", borderRadius: 9, background: "#f1f5f9", border: "none", color: "#64748b", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {patientsToAssess.map((patient, i) => (
          <PatientRiskCard
            key={`${patient._id}-${refreshKey}`}
            patient={patient}
            symptoms={allSymptoms}
            index={i}
          />
        ))}
        {patients.length > 5 && (
          <p style={{ color: "#94a3b8", fontSize: "0.75rem", textAlign: "center", margin: "4px 0 0" }}>
            Showing top 5 patients. {patients.length - 5} more not assessed.
          </p>
        )}
      </div>
    </div>
  );
}