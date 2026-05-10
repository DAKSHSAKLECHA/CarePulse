// src/pages/SmartPrescriptionScanner.jsx
// ─── AI Prescription Scanner ──────────────────────────────────
// Route: /smart-scanner  (add to your router)
// Uses: Gemini Vision to extract data from uploaded prescriptions
// Enhances: DocumentUpload flow — patients can scan before uploading
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scanPrescription } from "../../services/aiService";
import toast from "react-hot-toast";
import {
  Upload, FileText, Zap, AlertTriangle, CheckCircle,
  Pill, Calendar, User, Stethoscope, X, Eye, Download,
  RotateCcw, Camera,
} from "lucide-react";

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY = "#0d1b2a";
const INDIGO = "#4f46e5";

const card = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

const SEVERITY_STYLES = {
  minor:    { bg: "#f0fdf9", color: "#0a7e6e", border: "rgba(10,126,110,0.18)"  },
  moderate: { bg: "#fffbeb", color: "#b45309", border: "rgba(180,83,9,0.18)"   },
  severe:   { bg: "#fef2f2", color: "#dc2626", border: "rgba(220,38,38,0.18)"  },
};

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function ScanningAnimation() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", gap: 20 }}>
      <div style={{ position: "relative", width: 120, height: 80 }}>
        {/* Document outline */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 8, border: "2px solid #e2e8f0", background: "#f8fafc" }}>
          {[40, 55, 70].map((top, i) => (
            <div key={i} style={{ position: "absolute", left: 10, right: 10, top, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
          ))}
        </div>
        {/* Scanner beam */}
        <motion.div
          animate={{ top: ["12%", "88%", "12%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #4f46e5, transparent)", boxShadow: "0 0 8px #4f46e580" }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 800, color: NAVY, fontSize: "1rem", margin: "0 0 4px" }}>✦ CareAI is performing document analysis</p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>Extracting medicines, dosages, doctor info…</p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

function MedicineBadge({ med, index }) {
  const colors = ["#4f46e5","#0a7e6e","#b45309","#7c3aed","#e11d48"];
  const color = colors[index % colors.length];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
      style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", border: "1px solid #e8edf2", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderRadius: "4px 0 0 4px", background: color }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pill size={13} color={color} />
            </div>
            <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.9rem" }}>{med.name}</p>
          </div>
          {med.dosage && (
            <span style={{ background: `${color}12`, color, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, border: `1px solid ${color}20` }}>
              {med.dosage}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {med.frequency && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>🔄 {med.frequency}</span>}
          {med.duration  && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>⏱ {med.duration}</span>}
          {med.instructions && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>📌 {med.instructions}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function SmartPrescriptionScanner() {
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Please upload an image (JPG/PNG/WebP)");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
    if (f.type !== "application/pdf") {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const scan = async () => {
    if (!file) return;
    setScanning(true);
    setResult(null);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type;
      const data = await scanPrescription(base64, mimeType);
      setResult(data);
      toast.success("Scan complete!");
    } catch (e) {
      const msg = e.message?.includes("Claude") ? "Claude AI analysis failed. Please try again." : "Could not read document. Try a clearer image.";
      setError(msg);
      toast.error("Scan failed.");
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(""); };

  const docTypeLabel = {
    prescription: "📋 Prescription",
    lab_report: "🔬 Lab Report",
    discharge_summary: "🏥 Discharge Summary",
    other: "📄 Document",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #ffffff 60%, #f0f9f6 100%)", fontFamily: FF, paddingTop: "5.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 24, padding: "2rem 2.4rem", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(99,102,241,0.2)", filter: "blur(50px)" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Eye size={18} color="#a5b4fc" />
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>✦ AI-Assisted Analysis</span>
              </div>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.3rem, 3vw, 1.9rem)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Smart Prescription Scanner</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", margin: 0 }}>Upload any prescription or medical document — AI extracts all medicines, dosages, and doctor info instantly.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["JPG","PNG"].map(f => (
                <span key={f} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", fontWeight: 700 }}>{f}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 20 }}>

          {/* Upload zone */}
          <div style={{ ...card, padding: "1.8rem" }}>
            <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.2rem", fontSize: "0.95rem" }}>Upload Document</h3>

            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                style={{ border: `2px dashed ${dragging ? INDIGO : "#cbd5e1"}`, borderRadius: 16, padding: "3rem 1.5rem", textAlign: "center", cursor: "pointer", background: dragging ? `${INDIGO}05` : "#fafbfc", transition: "all 0.2s" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${INDIGO}0d`, border: `1px solid ${INDIGO}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Upload size={22} color={INDIGO} />
                </div>
                <p style={{ fontWeight: 700, color: NAVY, margin: "0 0 4px", fontSize: "0.9rem" }}>Drop your prescription here</p>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0 0 16px" }}>or click to browse · JPG, PNG, WebP</p>
                <span style={{ background: `${INDIGO}0d`, border: `1px solid ${INDIGO}20`, color: INDIGO, padding: "7px 18px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700 }}>
                  Choose File
                </span>
                <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
              </div>
            ) : (
              <div>
                {/* File preview */}
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e8edf2", marginBottom: 14, position: "relative" }}>
                  {preview ? (
                    <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "#f8fafc", display: "block" }} />
                  ) : (
                    <div style={{ background: "#f8fafc", padding: "2rem", textAlign: "center" }}>
                      <FileText size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
                      <p style={{ color: "#64748b", fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{file.name}</p>
                      <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "4px 0 0" }}>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  )}
                  <button onClick={reset}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.5)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} />
                  </button>
                </div>

                <div style={{ background: "#f0f4ff", borderRadius: 10, padding: "8px 12px", marginBottom: 14, fontSize: "0.78rem", color: "#4f46e5" }}>
                  📄 {file.name} · {(file.size / 1024).toFixed(0)} KB
                </div>

                {!scanning ? (
                  <button onClick={scan}
                    style={{ width: "100%", padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, #6366f1)`, color: "white", fontWeight: 800, fontSize: "0.92rem", border: "none", cursor: "pointer", fontFamily: FF, boxShadow: `0 6px 20px ${INDIGO}30`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Zap size={16} /> ✦ Analyse Document
                  </button>
                ) : (
                  <ScanningAnimation />
                )}
              </div>
            )}

            {error && (
              <div style={{ marginTop: 14, background: "#fef2f2", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(220,38,38,0.18)", fontSize: "0.82rem", color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}
          </div>

          {/* Results panel */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ ...card, padding: "1.8rem", maxHeight: "80vh", overflowY: "auto" }}>

                {/* Document type header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                  <div>
                    <span style={{ background: `${INDIGO}0d`, color: INDIGO, borderRadius: 8, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700, border: `1px solid ${INDIGO}18` }}>
                      {docTypeLabel[result.documentType] || "📄 Document"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <CheckCircle size={14} color="#16a34a" />
                      <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>{result.confidence}% confidence</span>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    style={{ padding: "6px 14px", borderRadius: 9, background: "#f1f5f9", border: "none", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5 }}>
                    <RotateCcw size={12} /> Scan Another
                  </button>
                </div>

                {/* Patient/Doctor info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.2rem" }}>
                  {[
                    { icon: <User size={13} />,        label: "Patient",  value: result.patientName  },
                    { icon: <Stethoscope size={13} />, label: "Doctor",   value: result.doctorName   },
                    { icon: <Calendar size={13} />,    label: "Date",     value: result.date         },
                    { icon: <FileText size={13} />,    label: "Diagnosis",value: result.diagnosis    },
                  ].filter(f => f.value).map((f, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "9px 11px", border: "1px solid #e8edf2" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", marginBottom: 3 }}>{f.icon}<span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</span></div>
                      <p style={{ fontWeight: 700, color: NAVY, fontSize: "0.82rem", margin: 0 }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Medicines */}
                {result.medicines?.length > 0 && (
                  <div style={{ marginBottom: "1.2rem" }}>
                    <h4 style={{ fontWeight: 800, color: NAVY, fontSize: "0.85rem", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Pill size={14} color={INDIGO} /> Medicines ({result.medicines.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.medicines.map((med, i) => <MedicineBadge key={i} med={med} index={i} />)}
                    </div>
                  </div>
                )}

                {/* Lab tests */}
                {result.labTests?.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <h4 style={{ fontWeight: 800, color: NAVY, fontSize: "0.82rem", margin: "0 0 8px" }}>🔬 Lab Tests Ordered</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {result.labTests.map((t, i) => (
                        <span key={i} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 99, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, border: "1px solid rgba(29,78,216,0.15)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings?.length > 0 && (
                  <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(180,83,9,0.18)", marginBottom: "1rem" }}>
                    <h4 style={{ fontWeight: 800, color: "#b45309", fontSize: "0.78rem", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertTriangle size={12} /> Warnings Found
                    </h4>
                    {result.warnings.map((w, i) => <p key={i} style={{ fontSize: "0.78rem", color: "#b45309", margin: "3px 0 0" }}>• {w}</p>)}
                  </div>
                )}

                {result.followUpDate && (
                  <div style={{ background: "#eff6ff", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(29,78,216,0.15)", fontSize: "0.8rem", color: "#1d4ed8" }}>
                    📅 Follow-up: {result.followUpDate}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}