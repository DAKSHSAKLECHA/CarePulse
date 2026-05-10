// src/components/HealthTimeline.jsx
// ─── AI Personal Health Timeline ─────────────────────────────
//
// THE MAIN HIGHLIGHT FEATURE — shown on both dashboards.
//
// PATIENT DASHBOARD usage:
//   import HealthTimeline from "../components/HealthTimeline";
//   <HealthTimeline mode="patient" />
//
// DOCTOR DASHBOARD usage (shows all patients' stories):
//   import HealthTimeline from "../components/HealthTimeline";
//   <HealthTimeline mode="doctor" patients={patients} appointments={appointments} />
//
// Uses: Claude claude-sonnet-4-6 to narrate health journeys
// Data: symptoms, appointments, mood, medicines from your existing APIs
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { generateHealthTimeline } from "../../services/aiService";
import {
  Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Heart, TrendingUp, TrendingDown, Minus,
  Calendar, Activity, AlertCircle, Star,
  BookOpen, Zap, Shield, Clock,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────
const FF    = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY  = "#0d1b2a";
const TEAL  = "#0a7e6e";
const GOLD  = "#b45309";
const card  = { background: "white", borderRadius: 24, border: "1px solid #e8edf2", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };

// ── Health chapter types with visual identity ─────────────────
const CHAPTER_TYPES = {
  recovery:    { icon: "🌱", color: "#16a34a", bg: "#f0fdf4", border: "rgba(22,163,74,0.2)",   grad: "linear-gradient(135deg,#16a34a,#4ade80)",  label: "Recovery"     },
  challenge:   { icon: "⚡", color: "#b45309", bg: "#fffbeb", border: "rgba(180,83,9,0.2)",    grad: "linear-gradient(135deg,#b45309,#f59e0b)",  label: "Challenge"    },
  milestone:   { icon: "🏆", color: "#7c3aed", bg: "#f5f3ff", border: "rgba(124,58,237,0.2)", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)",  label: "Milestone"    },
  stable:      { icon: "🛡️", color: "#1d4ed8", bg: "#eff6ff", border: "rgba(29,78,216,0.2)",  grad: "linear-gradient(135deg,#1d4ed8,#60a5fa)",  label: "Stable"       },
  concern:     { icon: "🔴", color: "#dc2626", bg: "#fef2f2", border: "rgba(220,38,38,0.2)",   grad: "linear-gradient(135deg,#dc2626,#f87171)",  label: "Concern"      },
  improvement: { icon: "📈", color: TEAL,      bg: "#f0fdf9", border: "rgba(10,126,110,0.2)",  grad: "linear-gradient(135deg,#0a7e6e,#0d9488)",  label: "Improvement"  },
};

const TREND_ICONS = {
  up:   <TrendingUp size={14} color="#16a34a" />,
  down: <TrendingDown size={14} color="#dc2626" />,
  flat: <Minus size={14} color="#94a3b8" />,
};

// ── Claude API call ───────────────────────────────────────────
async function generateTimeline(patientData, mode) {
  return await generateHealthTimeline(patientData, mode);
}

// ── Health Score Ring ─────────────────────────────────────────
function HealthScoreRing({ score, grade, trend }) {
  const r   = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? TEAL : score >= 40 ? GOLD : "#dc2626";

  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        {/* Track */}
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {/* Glow */}
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeOpacity="0.15" />
        {/* Progress */}
        <motion.circle
          cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" transform="rotate(-90 65 65)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
        />
        {/* Score text */}
        <text x="65" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill={NAVY} fontFamily={FF}>{score}</text>
        <text x="65" y="74" textAnchor="middle" fontSize="13" fontWeight="700" fill={color} fontFamily={FF}>{grade}</text>
        <text x="65" y="88" textAnchor="middle" fontSize="9" fontWeight="600" fill="#94a3b8" fontFamily={FF}>HEALTH SCORE</text>
      </svg>
      {/* Trend badge */}
      <div style={{ position: "absolute", bottom: 0, right: 0, background: "white", borderRadius: 99, padding: "3px 8px", border: "1px solid #e8edf2", display: "flex", alignItems: "center", gap: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        {TREND_ICONS[trend] || TREND_ICONS.flat}
      </div>
    </div>
  );
}

// ── Chapter Card ──────────────────────────────────────────────
function ChapterCard({ chapter, index, isLast }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = CHAPTER_TYPES[chapter.type] || CHAPTER_TYPES.stable;

  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* Timeline spine */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
        {/* Node */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.12 + 0.4 }}
          style={{ width: 40, height: 40, borderRadius: 12, background: cfg.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", boxShadow: `0 4px 14px ${cfg.color}30`, flexShrink: 0, zIndex: 1, position: "relative" }}>
          {cfg.icon}
          {/* Chapter number */}
          <div style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: NAVY, color: "white", fontSize: "0.55rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
            {index + 1}
          </div>
        </motion.div>
        {/* Connector line */}
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ delay: index * 0.12 + 0.6, duration: 0.5 }}
            style={{ width: 2, flex: 1, background: `linear-gradient(to bottom, ${cfg.color}40, ${cfg.color}10)`, minHeight: 32, marginTop: 4 }}
          />
        )}
      </div>

      {/* Chapter content */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.12 + 0.3 }}
        style={{ flex: 1, marginBottom: isLast ? 0 : 16, marginLeft: 12 }}>

        {/* Chapter header */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{ background: expanded ? cfg.bg : "white", borderRadius: 16, padding: "14px 18px", border: `1px solid ${expanded ? cfg.border : "#e8edf2"}`, cursor: "pointer", transition: "all 0.25s", boxShadow: expanded ? `0 4px 16px ${cfg.color}12` : "0 1px 4px rgba(0,0,0,0.03)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ background: cfg.color, color: "white", borderRadius: 99, padding: "2px 9px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} /> {chapter.period}
                </span>
              </div>
              <h4 style={{ fontWeight: 800, color: NAVY, margin: "0 0 4px", fontSize: "0.95rem", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {chapter.title}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "#4a6070", margin: 0, lineHeight: 1.5 }}>
                {chapter.headline}
              </p>
            </div>
            <div style={{ marginLeft: 10, color: "#94a3b8", flexShrink: 0, marginTop: 2 }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}>
              <div style={{ background: cfg.bg, borderRadius: "0 0 16px 16px", padding: "14px 18px", border: `1px solid ${cfg.border}`, borderTop: "none", marginTop: -1 }}>

                {/* Story */}
                <p style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>
                  "{chapter.story}"
                </p>

                {/* Key events */}
                {chapter.keyEvents?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 7px" }}>Key Events</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {chapter.keyEvents.map((ev, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0, marginTop: 6 }} />
                          <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0 }}>{ev}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insight */}
                {chapter.insight && (
                  <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "9px 12px", border: `1px solid ${cfg.border}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Zap size={13} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: "0.78rem", color: cfg.color, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{chapter.insight}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Doctor mode: patient story card ──────────────────────────
function PatientStoryCard({ patient, appointments, index }) {
  const [story,   setStory]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const patientAppts = appointments.filter(
    a => String(a.patient?._id || a.patient) === String(patient._id)
  );

  const generate = async () => {
    if (story) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const result = await generateTimeline({
        name: patient.name,
        symptoms: [],
        appointments: patientAppts,
        medicines: [],
      }, "doctor");
      setStory(result);
      setOpen(true);
    } catch {
      toast.error(`Could not generate story for ${patient.name}`);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = story
    ? story.healthScore >= 80 ? "#16a34a"
    : story.healthScore >= 60 ? TEAL
    : story.healthScore >= 40 ? GOLD : "#dc2626"
    : "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ ...card, overflow: "hidden" }}>

      {/* Patient header */}
      <div style={{ padding: "1.1rem 1.3rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}20, ${TEAL}10)`, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
            {patient.name?.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.88rem" }}>{patient.name}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: 0 }}>
              {patientAppts.length} visits · {patient?.age}y {patient.gender}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Score badge */}
          {story && (
            <div style={{ textAlign: "center", background: `${scoreColor}10`, borderRadius: 10, padding: "5px 10px", border: `1px solid ${scoreColor}20` }}>
              <p style={{ fontWeight: 800, color: scoreColor, margin: 0, fontSize: "1rem", lineHeight: 1 }}>{story.healthScore}</p>
              <p style={{ fontSize: "0.58rem", color: scoreColor, margin: 0, fontWeight: 700 }}>{story.healthGrade}</p>
            </div>
          )}

          <button onClick={generate} disabled={loading}
            style={{ padding: "7px 14px", borderRadius: 10, background: story ? "#f1f5f9" : `linear-gradient(135deg, ${TEAL}, #0d9488)`, border: "none", color: story ? "#64748b" : "white", fontWeight: 700, fontSize: "0.72rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.7 : 1, boxShadow: !story ? `0 4px 12px ${TEAL}30` : "none" }}>
            {loading ? (
              <><div style={{ width: 10, height: 10, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Generating…</>
            ) : story ? (
              <>{open ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {open ? "Hide" : "Show"} Story</>
            ) : (
              <><Sparkles size={12} /> Generate Story</>
            )}
          </button>
        </div>
      </div>

      {/* Story expand */}
      <AnimatePresence>
        {open && story && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ padding: "1.2rem 1.3rem", background: "linear-gradient(160deg, #f8fafc, #f0fdf9)" }}>
              {/* Arc */}
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, #0a3d35)`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px" }}>Health Journey Arc</p>
                <p style={{ color: "white", fontWeight: 700, fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>{story.overallArc}</p>
              </div>
              {/* Mini chapters */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {story.chapters?.slice(0, 3).map((ch, i) => {
                  const cfg = CHAPTER_TYPES[ch.type] || CHAPTER_TYPES.stable;
                  return (
                    <div key={i} style={{ background: cfg.bg, borderRadius: 10, padding: "9px 12px", border: `1px solid ${cfg.border}`, display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ fontSize: "0.95rem", flexShrink: 0 }}>{cfg.icon}</span>
                      <div>
                        <p style={{ fontWeight: 700, color: cfg.color, fontSize: "0.78rem", margin: "0 0 2px" }}>{ch.title}</p>
                        <p style={{ fontSize: "0.73rem", color: "#4a6070", margin: 0, lineHeight: 1.4 }}>{ch.headline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* AI message */}
              {story.aiMessage && (
                <div style={{ marginTop: 10, background: "white", borderRadius: 10, padding: "9px 12px", border: "1px solid #e8edf2", fontSize: "0.76rem", color: "#334155", fontStyle: "italic", lineHeight: 1.6 }}>
                  💬 {story.aiMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function HealthTimeline({ mode = "patient", patients = [], appointments = [] }) {
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [story,     setStory]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);
  const [symptoms,  setSymptoms]  = useState([]);
  const [myAppts,   setMyAppts]   = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Load patient data (patient mode only)
  useEffect(() => {
    if (mode !== "patient") return;
    const load = async () => {
      try {
        const [sympRes, apptRes] = await Promise.all([
          axios.get(`/api/symptoms/patient/${user.id}`, { headers }).catch(() => ({ data: [] })),
          axios.get("/api/appointments/my", { headers }).catch(() => ({ data: [] })),
        ]);
        setSymptoms(sympRes.data || []);
        setMyAppts(apptRes.data  || []);
        const saved = JSON.parse(localStorage.getItem("cp_medicines") || "[]");
        setMedicines(saved);
      } catch { /* silent */ }
    };
    load();
  }, [mode, user.id]);

  const generateStory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateTimeline({
        name:         user.name || "Patient",
        symptoms,
        appointments: myAppts,
        medicines,
      }, mode);
      setStory(result);
      setGenerated(true);
    } catch (e) {
      toast.error("Could not generate your health timeline. Check your backend is running.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.name, symptoms, myAppts, medicines, mode]);

  // ── DOCTOR MODE ──────────────────────────────────────────────
  if (mode === "doctor") {
    return (
      <div style={{ ...card, padding: "1.8rem", marginTop: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.4rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, #7c3aed, #a78bfa)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen size={15} color="white" />
              </div>
              <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1rem" }}>Patient Health Stories</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>
              AI-generated personal health narratives for each of your patients
            </p>
          </div>
          <span style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "white", borderRadius: 99, padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700 }}>
            ✨ AI Feature
          </span>
        </div>

        {patients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
            <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p style={{ fontSize: "0.875rem", margin: 0 }}>No patients yet. Stories will appear here once you have patient appointments.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {patients.slice(0, 6).map((p, i) => (
              <PatientStoryCard
                key={p._id}
                patient={p}
                appointments={appointments}
                index={i}
              />
            ))}
            {patients.length > 6 && (
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", textAlign: "center", margin: "4px 0 0" }}>
                Showing 6 of {patients.length} patients
              </p>
            )}
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── PATIENT MODE ─────────────────────────────────────────────
  return (
    <div style={{ marginTop: 24 }}>

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, #e8edf2, transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#7c3aed20,#a78bfa10)", borderRadius: 99, padding: "5px 14px", border: "1px solid rgba(124,58,237,0.15)" }}>
          <Sparkles size={13} color="#7c3aed" />
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#7c3aed", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your Health Story</span>
        </div>
        <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, #e8edf2, transparent)" }} />
      </div>

      {/* Pre-generate state */}
      {!generated && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...card, padding: "2.4rem", textAlign: "center", background: "linear-gradient(160deg, #faf5ff, #f5f3ff, #f0fdf9)", border: "1px solid rgba(124,58,237,0.12)" }}>

          {/* Decorative orbs */}
          <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 20px" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed20,#a78bfa10)", animation: "breathe 3s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed30,#a78bfa20)", animation: "breathe 3s ease-in-out 0.5s infinite" }} />
            <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={22} color="white" />
            </div>
          </div>

          <h2 style={{ fontWeight: 800, color: NAVY, margin: "0 0 8px", fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
            Your Personal Health Timeline
          </h2>
          <p style={{ color: "#64748b", margin: "0 0 8px", fontSize: "0.875rem", maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            CareAI performs a clinically-informed review of your symptoms, appointments, and health data to write a personalized narrative of your health journey — chapters, milestones, and all.
          </p>

          {/* Data preview */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, margin: "16px 0 24px", flexWrap: "wrap" }}>
            {[
              { icon: <Activity size={13} />, label: `${symptoms.length} symptom entries`, color: TEAL   },
              { icon: <Calendar size={13} />, label: `${myAppts.length} appointments`,    color: "#4f46e5" },
              { icon: <Heart size={13} />,    label: `${medicines.length} medicines`,      color: "#e11d48" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "white", borderRadius: 99, padding: "5px 12px", border: "1px solid #e8edf2", fontSize: "0.72rem", fontWeight: 600, color: d.color }}>
                {d.icon} {d.label}
              </div>
            ))}
          </div>

          <button onClick={generateStory}
            style={{ padding: "13px 32px", borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "white", fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: "pointer", fontFamily: FF, boxShadow: "0 8px 24px rgba(124,58,237,0.35)", letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} /> Generate My Health Story
          </button>

          <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: "12px 0 0" }}>
            ✦ AI-Assisted Analysis · Takes ~5 seconds · Your data stays private
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...card, padding: "3rem", textAlign: "center", background: "linear-gradient(160deg,#faf5ff,#f0fdf9)" }}>
          <div style={{ position: "relative", width: 70, height: 70, margin: "0 auto 20px" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #7c3aed20" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #7c3aed", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="white" />
            </div>
          </div>
          <p style={{ fontWeight: 800, color: NAVY, margin: "0 0 6px", fontSize: "1.05rem" }}>CareAI is generating your clinical health narrative…</p>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>Reading through your symptoms, appointments, and health patterns</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {["Analyzing symptoms","Reading appointments","Identifying patterns","Writing chapters"].map((s, i) => (
              <motion.span key={i}
                initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: i * 0.8, duration: 0.8, repeat: Infinity, repeatDelay: 3.2 - i * 0.8 }}
                style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 600, background: "#f5f3ff", borderRadius: 99, padding: "3px 10px", border: "1px solid rgba(124,58,237,0.15)" }}>
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Story result */}
      {story && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Hero banner */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e1254 50%, #0a3d35 100%)`, borderRadius: 24, padding: "2rem 2.2rem", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            {/* Background orbs */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(124,58,237,0.15)", filter: "blur(50px)" }} />
            <div style={{ position: "absolute", bottom: -40, left: 60, width: 160, height: 160, borderRadius: "50%", background: "rgba(10,126,110,0.12)", filter: "blur(40px)" }} />

            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <Sparkles size={13} color="#a78bfa" />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>✦ AI-Assisted Analysis</span>
                </div>
                <h2 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                  {user.name}'s Health Journey
                </h2>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", margin: "0 0 16px", lineHeight: 1.6, maxWidth: 500 }}>
                  {story.overallArc}
                </p>

                {/* Trend reason */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 13px", border: "1px solid rgba(255,255,255,0.1)", width: "fit-content" }}>
                  {TREND_ICONS[story.trend]}
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>{story.trendReason}</span>
                </div>
              </div>

              {/* Health score ring */}
              <HealthScoreRing score={story.healthScore} grade={story.healthGrade} trend={story.trend} />
            </div>
          </div>

          {/* Strengths + watch points */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            {/* Strengths */}
            <div style={{ ...card, padding: "1.3rem 1.5rem" }}>
              <h4 style={{ fontWeight: 800, color: NAVY, margin: "0 0 10px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 7 }}>
                <Shield size={14} color="#16a34a" /> Your Strengths
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {story.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <Star size={11} color="#16a34a" style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch points */}
            <div style={{ ...card, padding: "1.3rem 1.5rem" }}>
              <h4 style={{ fontWeight: 800, color: NAVY, margin: "0 0 10px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 7 }}>
                <AlertCircle size={14} color={GOLD} /> Watch Points
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {story.watchPoints?.map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, flexShrink: 0, marginTop: 6 }} />
                    <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>{w}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div style={{ ...card, padding: "1.8rem", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1rem" }}>Your Health Chapters</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: "2px 0 0" }}>
                  {story.chapters?.length} chapters in your journey · Click to expand
                </p>
              </div>
              <button onClick={generateStory}
                style={{ padding: "6px 14px", borderRadius: 9, background: "#f5f3ff", border: "1px solid rgba(124,58,237,0.2)", color: "#7c3aed", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5 }}>
                <RefreshCw size={11} /> Regenerate
              </button>
            </div>

            <div>
              {story.chapters?.map((chapter, i) => (
                <ChapterCard
                  key={i}
                  chapter={chapter}
                  index={i}
                  isLast={i === story.chapters.length - 1}
                />
              ))}
            </div>
          </div>

          {/* AI Message + Next Chapter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* AI personal message */}
            <div style={{ background: "linear-gradient(135deg,#faf5ff,#f5f3ff)", borderRadius: 18, padding: "1.3rem 1.5rem", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
                <p style={{ fontWeight: 800, color: "#7c3aed", margin: 0, fontSize: "0.78rem" }}>Message from CareAI</p>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#334155", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                "{story.aiMessage}"
              </p>
            </div>

            {/* Next chapter */}
            <div style={{ background: `linear-gradient(135deg, ${TEAL}08, ${TEAL}04)`, borderRadius: 18, padding: "1.3rem 1.5rem", border: `1px solid ${TEAL}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},#0d9488)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={13} color="white" />
                </div>
                <p style={{ fontWeight: 800, color: TEAL, margin: 0, fontSize: "0.78rem" }}>Your Next Chapter</p>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#334155", margin: "0 0 12px", lineHeight: 1.7 }}>
                {story.nextChapter}
              </p>
              <a href="/doctors-list" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9, background: `linear-gradient(135deg,${TEAL},#0d9488)`, color: "white", fontWeight: 700, fontSize: "0.72rem", textDecoration: "none", boxShadow: `0 4px 12px ${TEAL}30` }}>
                Book Appointment →
              </a>
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes breathe { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.08);opacity:1} }
      `}</style>
    </div>
  );
}