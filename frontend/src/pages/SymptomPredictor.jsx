// src/pages/SymptomPredictor.jsx
// ─── AI Symptom → Disease Prediction ─────────────────────────
// Route: /symptom-predictor  (add to your router)
// Uses: GET /api/symptoms/patient/:patientId  (existing route)
// AI:   Gemini 1.5 Flash via gemini.js
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { predictDisease } from "../../services/aiService";
import toast from "react-hot-toast";
import {
  Brain, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Shield, ChevronRight, RefreshCw,
  Stethoscope, Activity, Zap,
} from "lucide-react";

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const TEAL = "#0a7e6e";
const NAVY = "#0d1b2a";

const URGENCY_CONFIG = {
  low:       { color: "#16a34a", bg: "#f0fdf4", border: "rgba(22,163,74,0.2)",   icon: "🟢", label: "Low Risk"       },
  medium:    { color: "#b45309", bg: "#fffbeb", border: "rgba(180,83,9,0.2)",    icon: "🟡", label: "Moderate Risk"  },
  high:      { color: "#dc2626", bg: "#fef2f2", border: "rgba(220,38,38,0.2)",   icon: "🔴", label: "High Risk"      },
  emergency: { color: "#7c2d12", bg: "#fff7ed", border: "rgba(124,45,18,0.2)",   icon: "🚨", label: "Emergency"      },
};

const RISK_CONFIG = {
  low:    { color: "#16a34a", label: "Low Risk",      grad: "linear-gradient(135deg, #16a34a, #4ade80)" },
  medium: { color: "#b45309", label: "Medium Risk",   grad: "linear-gradient(135deg, #b45309, #f59e0b)" },
  high:   { color: "#dc2626", label: "High Risk",     grad: "linear-gradient(135deg, #dc2626, #f87171)" },
};

const card = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

function ConfidenceBar({ value, color }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>Confidence</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </div>
  );
}

function PulseLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", gap: 20 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${TEAL}`, animation: "ping 1.4s ease-in-out infinite", opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `3px solid ${TEAL}`, animation: "ping 1.4s ease-in-out 0.4s infinite", opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: `${TEAL}15`, border: `2px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Brain size={20} color={TEAL} />
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 800, color: NAVY, fontSize: "1rem", margin: "0 0 4px" }}>AI is analyzing your symptoms</p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>Scanning {" "}<span style={{ color: TEAL, fontWeight: 700 }}>14 days</span> of health data…</p>
      </div>
      <style>{`@keyframes ping { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.3);opacity:.1} }`}</style>
    </div>
  );
}

export default function SymptomPredictor() {
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  // const rawToken = localStorage.getItem("token");
  // const token = rawToken?.replace(/^"|"$/g, "");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [symptoms,    setSymptoms]    = useState([]);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/symptoms/patient/${user.id}`, { headers });
        setSymptoms(res.data || []);
      } catch {
        toast.error("Could not load symptom history.");
      } finally {
        setLoadingData(false);
      }
    };
    fetch();
  }, []);

  const runAnalysis = async () => {
    if (symptoms.length < 3) {
      toast.error("Log at least 3 symptom entries before running AI analysis.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const data = await predictDisease({
        symptomEntries: symptoms
      });

      console.log(data);
      setResult(data);
    } catch (e) {
      setError("CareAI analysis unavailable. Please try again shortly.");
      toast.error("AI error — see console for details.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overallCfg = result ? RISK_CONFIG[result.overallRisk] || RISK_CONFIG.low : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f9f6 0%, #ffffff 60%, #f0f4ff 100%)", fontFamily: FF, paddingTop: "5.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a3d35 100%)`, borderRadius: 24, padding: "2.2rem 2.5rem", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(10,126,110,0.2)", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", bottom: -40, left: 100, width: 140, height: 140, borderRadius: "50%", background: "rgba(79,70,229,0.12)", filter: "blur(40px)" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(10,126,110,0.25)", border: "1px solid rgba(10,126,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain size={20} color="#4ade80" />
                </div>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>✦ AI-Assisted Analysis</span>
              </div>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Symptom Prediction Engine</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", margin: 0, maxWidth: 500 }}>
                CareAI performs a clinical analysis of your logged symptoms to detect patterns and predict possible conditions with confidence scores.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 18px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <p style={{ color: "white", fontWeight: 800, fontSize: "1.5rem", margin: 0 }}>{symptoms.length}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", margin: 0, fontWeight: 500 }}>Entries Logged</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 18px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <p style={{ color: "white", fontWeight: 800, fontSize: "1.5rem", margin: 0 }}>AI</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", margin: 0, fontWeight: 500 }}>Powered</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Disclaimer ── */}
        <div style={{ background: "#fffbeb", borderRadius: 14, padding: "12px 18px", border: "1px solid rgba(180,83,9,0.18)", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: "0.8rem", color: "#b45309", margin: 0, fontWeight: 500 }}>
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>

        {/* ── Symptom history preview ── */}
        {!loadingData && symptoms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, padding: "1.6rem", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem" }}>Recent Symptom Data</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "2px 0 0" }}>AI will analyze your last {Math.min(symptoms.length, 14)} entries</p>
              </div>
              <span style={{ background: `${TEAL}10`, borderRadius: 99, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700, color: TEAL }}>
                {symptoms.length} entries
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {symptoms.slice(0, 7).map((s, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", border: "1px solid #e8edf2", fontSize: "0.75rem" }}>
                  <p style={{ fontWeight: 700, color: NAVY, margin: "0 0 2px" }}>{s.date}</p>
                  <p style={{ color: "#64748b", margin: 0 }}>{s.mood} · {(s.symptoms || "").slice(0, 30)}{(s.symptoms || "").length > 30 ? "…" : ""}</p>
                </div>
              ))}
              {symptoms.length > 7 && (
                <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "8px 12px", border: "1px solid #e8edf2", fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                  +{symptoms.length - 7} more
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Trigger button ── */}
        {!loading && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: 24 }}>
            {symptoms.length < 3 ? (
              <div style={{ ...card, padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
                <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>Not Enough Data Yet</h3>
                <p style={{ color: "#94a3b8", margin: "0 0 20px", fontSize: "0.875rem" }}>
                  Log at least <strong>3 symptom entries</strong> in the Symptom Tracker before running AI analysis.
                  You currently have {symptoms.length}.
                </p>
                <a href="/symptom" style={{ padding: "12px 24px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", display: "inline-block" }}>
                  Go to Symptom Tracker →
                </a>
              </div>
            ) : (
              <div style={{ ...card, padding: "2.5rem 3rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: `${TEAL}10`, border: `1px solid ${TEAL}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Brain size={28} color={TEAL} />
                </div>
                <h2 style={{ fontWeight: 800, color: NAVY, margin: "0 0 8px", fontSize: "1.2rem" }}>Ready to Analyze</h2>
                <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "0.875rem", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                  AI will scan your {symptoms.length} symptom entries and identify possible health patterns and conditions.
                </p>
                <button onClick={runAnalysis}
                  style={{ padding: "14px 36px", borderRadius: 14, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 800, fontSize: "1rem", border: "none", cursor: "pointer", fontFamily: FF, boxShadow: `0 8px 24px ${TEAL}35`, letterSpacing: "-0.01em" }}>
                  🧠 Run AI Analysis
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...card, marginBottom: 20 }}>
            <PulseLoader />
          </motion.div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#fef2f2", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(220,38,38,0.2)", marginBottom: 20, color: "#dc2626", fontSize: "0.875rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Overall risk banner */}
              <div style={{ background: overallCfg?.grad, borderRadius: 20, padding: "1.6rem 2rem", marginBottom: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Overall Assessment</p>
                  <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.4rem", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{overallCfg?.label}</h2>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", margin: 0 }}>{result.patternSummary}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "14px 20px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
                  <Shield size={24} color="white" style={{ marginBottom: 4 }} />
                  <p style={{ color: "white", fontWeight: 800, fontSize: "0.85rem", margin: 0 }}>{result.nextSteps}</p>
                </div>
              </div>

              {/* Predictions */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, color: NAVY, fontSize: "1rem", margin: "0 0 12px" }}>🔬 Possible Conditions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                  {result.predictions?.map((pred, i) => {
                    const urg = URGENCY_CONFIG[pred.urgency] || URGENCY_CONFIG.low;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ ...card, padding: "1.4rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem" }}>{pred.condition}</p>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: urg.color, background: urg.bg, padding: "2px 8px", borderRadius: 99, border: `1px solid ${urg.border}`, display: "inline-block", marginTop: 4 }}>
                              {urg.icon} {urg.label}
                            </span>
                          </div>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${urg.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                            {i === 0 ? "🧬" : i === 1 ? "🔬" : "💊"}
                          </div>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>{pred.description}</p>
                        <ConfidenceBar value={pred.confidence} color={urg.color} />
                        <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 10, padding: "8px 10px", fontSize: "0.76rem", color: "#4a6070", border: "1px solid #e8edf2" }}>
                          💡 {pred.recommendation}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Red flags */}
              {result.redFlags?.length > 0 && (
                <div style={{ background: "#fef2f2", borderRadius: 16, padding: "1.4rem", marginBottom: 20, border: "1px solid rgba(220,38,38,0.18)" }}>
                  <h3 style={{ fontWeight: 800, color: "#dc2626", fontSize: "0.9rem", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={16} /> Red Flag Symptoms
                  </h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {result.redFlags.map((flag, i) => (
                      <span key={i} style={{ background: "white", borderRadius: 99, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600, color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                        ⚠️ {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-run button */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={runAnalysis}
                  style={{ padding: "10px 22px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6 }}>
                  <RefreshCw size={14} /> Re-run Analysis
                </button>
                <a href="/my-appointments" style={{ padding: "10px 22px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  Book Appointment <ChevronRight size={14} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}