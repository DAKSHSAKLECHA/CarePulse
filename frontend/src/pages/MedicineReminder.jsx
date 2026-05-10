// src/pages/MedicineReminder.jsx
// ─── Medicine Reminder System ─────────────────────────────────
// Route: /medicine-reminder  (add to your router)
// Uses: Web Notifications API (browser-native, no backend needed)
//       LocalStorage for persistence
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bell, BellOff, Plus, Trash2, Check, Clock,
  Pill, Edit3, X, AlertCircle, Moon, Sun,
} from "lucide-react";

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const NAVY = "#0d1b2a";
const TEAL = "#0a7e6e";

const card = { background: "white", borderRadius: 20, border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

const FREQUENCIES = [
  { label: "Once daily",       value: "once",      times: 1 },
  { label: "Twice daily",      value: "twice",     times: 2 },
  { label: "Three times daily",value: "thrice",    times: 3 },
  { label: "Four times daily", value: "four",      times: 4 },
  { label: "Every 8 hours",    value: "8h",        times: 3 },
  { label: "Every 12 hours",   value: "12h",       times: 2 },
];

const MEAL_OPTS = [
  { label: "Before meal", value: "before" },
  { label: "After meal",  value: "after"  },
  { label: "With meal",   value: "with"   },
  { label: "Any time",    value: "any"    },
];

const PILL_COLORS = ["#4f46e5","#0a7e6e","#e11d48","#b45309","#7c3aed","#1d4ed8","#065f46"];

const EMPTY_FORM = { name: "", dosage: "", frequency: "once", meal: "after", times: ["08:00"], notes: "", color: "#4f46e5", startDate: new Date().toISOString().split("T")[0], endDate: "", active: true };

function generateId() { return Math.random().toString(36).slice(2, 9); }

function getNextDoseIn(times) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...times].sort();
  for (const t of sorted) {
    const [h, m] = t.split(":").map(Number);
    const tMin = h * 60 + m;
    if (tMin > nowMin) {
      const diff = tMin - nowMin;
      return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
    }
  }
  // Next day
  const [h, m] = sorted[0].split(":").map(Number);
  const diff = (24 * 60 - nowMin) + h * 60 + m;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function TimeInput({ value, onChange, label }) {
  return (
    <div>
      {label && <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 5px" }}>{label}</p>}
      <input type="time" value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: "0.85rem", color: NAVY, outline: "none", fontFamily: FF, width: "100%", boxSizing: "border-box" }} />
    </div>
  );
}

function MedicineCard({ med, onTake, onDelete, onEdit, takenToday }) {
  const nextDose = med.active ? getNextDoseIn(med.times) : null;
  const allTakenToday = med.times.every((_, i) => takenToday.includes(`${med.id}-${i}`));

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ ...card, padding: "1.2rem 1.4rem", position: "relative", overflow: "hidden" }}>

      {/* Color strip */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: med.color, borderRadius: "4px 0 0 4px" }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${med.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pill size={16} color={med.color} />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.92rem" }}>{med.name}</p>
              <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0 }}>{med.dosage} · {MEAL_OPTS.find(m => m.value === med.meal)?.label}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => onEdit(med)} style={{ width: 28, height: 28, borderRadius: 8, background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><Edit3 size={12} /></button>
            <button onClick={() => onDelete(med.id)} style={{ width: 28, height: 28, borderRadius: 8, background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}><Trash2 size={12} /></button>
          </div>
        </div>

        {/* Time slots */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {med.times.map((t, i) => {
            const taken = takenToday.includes(`${med.id}-${i}`);
            return (
              <button key={i} onClick={() => onTake(med.id, i)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, border: `1.5px solid ${taken ? med.color : "#e2e8f0"}`, background: taken ? `${med.color}10` : "#f8fafc", color: taken ? med.color : "#64748b", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: FF, transition: "all 0.2s" }}>
                {taken ? <Check size={11} /> : <Clock size={11} />}
                {t}
              </button>
            );
          })}
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {med.notes && <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>📌 {med.notes}</span>}
            {med.endDate && <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Until {med.endDate}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {allTakenToday ? (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: TEAL, display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={11} /> All done today!
              </span>
            ) : nextDose && (
              <span style={{ fontSize: "0.72rem", color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> Next: {nextDose}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddEditModal({ initialData, onSave, onClose }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  const setTimes = (count) => {
    const defaults = ["08:00","13:00","18:00","22:00"];
    const times = Array.from({ length: count }, (_, i) => form.times[i] || defaults[i] || "08:00");
    setForm(f => ({ ...f, times }));
  };

  const handleFreq = (val) => {
    const freq = FREQUENCIES.find(f => f.value === val);
    setForm(f => ({ ...f, frequency: val }));
    if (freq) setTimes(freq.times);
  };

  const inputSt = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: "0.85rem", color: NAVY, outline: "none", fontFamily: FF, boxSizing: "border-box" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ ...card, padding: "2rem", maxWidth: 500, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: 0 }}>{initialData ? "Edit Medicine" : "Add Medicine"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name + dosage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Medicine Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol" style={inputSt} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Dosage</label>
              <input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="e.g. 500mg" style={inputSt} />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Frequency</label>
            <select value={form.frequency} onChange={e => handleFreq(e.target.value)} style={inputSt}>
              {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Time inputs */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Reminder Times</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {form.times.map((t, i) => (
                <TimeInput key={i} value={t} label={`Dose ${i + 1}`} onChange={val => setForm(f => ({ ...f, times: f.times.map((x, idx) => idx === i ? val : x) }))} />
              ))}
            </div>
          </div>

          {/* Meal + color */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>With Meal</label>
              <select value={form.meal} onChange={e => setForm(f => ({ ...f, meal: e.target.value }))} style={inputSt}>
                {MEAL_OPTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Color Label</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                {PILL_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: form.color === c ? "3px solid white" : "2px solid transparent", outline: form.color === c ? `2px solid ${c}` : "none", cursor: "pointer", transition: "all 0.15s" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inputSt} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>End Date (optional)</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputSt} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Take with water" style={inputSt} />
          </div>

          <button
            onClick={() => { if (!form.name) { toast.error("Enter medicine name"); return; } onSave({ ...form, id: initialData?.id || generateId() }); }}
            style={{ padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 800, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: FF, boxShadow: `0 6px 18px ${TEAL}30` }}>
            {initialData ? "Save Changes" : "Add Medicine +"} 
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MedicineReminder() {
  const [medicines,     setMedicines]     = useState(() => JSON.parse(localStorage.getItem("cp_medicines") || "[]"));
  const [takenToday,    setTakenToday]    = useState(() => {
    const saved = JSON.parse(localStorage.getItem("cp_taken_today") || "{}");
    const today = new Date().toDateString();
    return saved.date === today ? saved.items : [];
  });
  const [notifEnabled,  setNotifEnabled]  = useState(Notification?.permission === "granted");
  const [showModal,     setShowModal]     = useState(false);
  const [editingMed,    setEditingMed]    = useState(null);
  const [currentTime,   setCurrentTime]   = useState(new Date());
  const checkRef = useRef(null);

  // Persist medicines
  useEffect(() => { localStorage.setItem("cp_medicines", JSON.stringify(medicines)); }, [medicines]);

  // Persist taken today (reset daily)
  useEffect(() => {
    localStorage.setItem("cp_taken_today", JSON.stringify({ date: new Date().toDateString(), items: takenToday }));
  }, [takenToday]);

  // Live clock + check for due reminders every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkDueReminders();
    }, 30000);
    return () => clearInterval(interval);
  }, [medicines, takenToday]);

  const checkDueReminders = useCallback(() => {
    if (!notifEnabled || Notification.permission !== "granted") return;
    const now = new Date();
    const hm  = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    medicines.filter(m => m.active).forEach(med => {
      med.times.forEach((t, i) => {
        if (t === hm && !takenToday.includes(`${med.id}-${i}`)) {
          new Notification(`💊 Time for ${med.name}`, {
            body: `${med.dosage} — ${MEAL_OPTS.find(m => m.value === med.meal)?.label}`,
            icon: "/favicon.ico",
          });
        }
      });
    });
  }, [medicines, takenToday, notifEnabled]);

  const requestNotif = async () => {
    if (!("Notification" in window)) { toast.error("Your browser doesn't support notifications."); return; }
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    if (perm === "granted") toast.success("Notifications enabled! You'll be reminded on time.");
    else toast.error("Permission denied. Enable in browser settings.");
  };

  const markTaken = (medId, timeIndex) => {
    const key = `${medId}-${timeIndex}`;
    setTakenToday(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    const med = medicines.find(m => m.id === medId);
    toast.success(takenToday.includes(key) ? "Marked as not taken" : `✅ ${med?.name} marked as taken!`);
  };

  const saveMed = (med) => {
    setMedicines(prev => {
      const exists = prev.find(m => m.id === med.id);
      return exists ? prev.map(m => m.id === med.id ? med : m) : [...prev, med];
    });
    setShowModal(false);
    setEditingMed(null);
    toast.success(editingMed ? "Medicine updated!" : "Medicine added!");
  };

  const deleteMed = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    toast.success("Medicine removed.");
  };

  // Today's adherence score
  const totalDoses  = medicines.filter(m => m.active).reduce((s, m) => s + m.times.length, 0);
  const takenCount  = takenToday.length;
  const adherence   = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0fdf9 0%, #ffffff 60%, #f0f4ff 100%)", fontFamily: FF, paddingTop: "5.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: `linear-gradient(135deg, ${NAVY}, #0a3d35)`, borderRadius: 24, padding: "2rem 2.4rem", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(10,126,110,0.2)", filter: "blur(50px)" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>
                {hour < 12 ? <Sun size={12} style={{ display: "inline" }} /> : <Moon size={12} style={{ display: "inline" }} />} {greeting}
              </p>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.3rem, 3vw, 1.9rem)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Medicine Reminders</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", margin: 0 }}>
                {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {medicines.length} medicine{medicines.length !== 1 ? "s" : ""} tracked
              </p>
            </div>

            {/* Adherence ring */}
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#4ade80" strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - adherence / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                  <text x="36" y="36" textAnchor="middle" dy="0.35em" fontSize="14" fontWeight="800" fill="white" fontFamily={FF}>{adherence}%</text>
                </svg>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", margin: "4px 0 0", fontWeight: 600 }}>Today's Adherence</p>
            </div>
          </div>
        </motion.div>

        {/* Notification banner */}
        {!notifEnabled && (
          <div style={{ background: "#fffbeb", borderRadius: 14, padding: "12px 18px", border: "1px solid rgba(180,83,9,0.2)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BellOff size={16} color="#b45309" />
              <p style={{ fontSize: "0.82rem", color: "#b45309", margin: 0, fontWeight: 500 }}>Enable notifications to get reminded when it's time to take your medicine.</p>
            </div>
            <button onClick={requestNotif}
              style={{ padding: "7px 16px", borderRadius: 9, background: "#b45309", color: "white", fontWeight: 700, fontSize: "0.78rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
              <Bell size={12} /> Enable Now
            </button>
          </div>
        )}

        {/* Today's summary strip */}
        {medicines.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Doses Today", value: totalDoses,                color: "#4f46e5", icon: "💊" },
              { label: "Taken",             value: takenCount,               color: TEAL,      icon: "✅" },
              { label: "Remaining",          value: Math.max(0, totalDoses - takenCount), color: "#b45309", icon: "⏳" },
              { label: "Adherence",          value: `${adherence}%`,         color: "#16a34a", icon: "📊" },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: "1.2rem" }}>{s.icon}</div>
                <div>
                  <p style={{ fontWeight: 800, color: s.color, fontSize: "1.2rem", margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medicine list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1.05rem" }}>Your Medicines</h2>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "2px 0 0" }}>Tap a time to mark as taken</p>
            </div>
            <button onClick={() => { setEditingMed(null); setShowModal(true); }}
              style={{ padding: "9px 18px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 14px ${TEAL}30` }}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          {medicines.length === 0 ? (
            <div style={{ ...card, padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>💊</div>
              <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>No Medicines Added Yet</h3>
              <p style={{ color: "#94a3b8", margin: "0 0 22px", fontSize: "0.875rem" }}>Add your medicines to get timely reminders and track your daily adherence.</p>
              <button onClick={() => setShowModal(true)}
                style={{ padding: "12px 28px", borderRadius: 13, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: FF, boxShadow: `0 6px 18px ${TEAL}30` }}>
                + Add Your First Medicine
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {medicines.map(med => (
                  <MedicineCard
                    key={med.id}
                    med={med}
                    onTake={markTaken}
                    onDelete={deleteMed}
                    onEdit={(m) => { setEditingMed(m); setShowModal(true); }}
                    takenToday={takenToday}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Tips card */}
        <div style={{ background: `linear-gradient(135deg, #f0fdf9, #eff6ff)`, borderRadius: 18, padding: "1.4rem", border: "1px solid rgba(10,126,110,0.12)" }}>
          <h4 style={{ fontWeight: 800, color: NAVY, margin: "0 0 10px", fontSize: "0.88rem" }}>💡 Tips for Better Adherence</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {[
              "Set reminders 5 minutes before your usual mealtime",
              "Keep medicines at a visible spot like your dining table",
              "Use the marking feature daily to build a habit streak",
              "Check with your doctor before skipping any dose",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Check size={10} color={TEAL} />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#4a6070", margin: 0, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <AddEditModal
            initialData={editingMed}
            onSave={saveMed}
            onClose={() => { setShowModal(false); setEditingMed(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}