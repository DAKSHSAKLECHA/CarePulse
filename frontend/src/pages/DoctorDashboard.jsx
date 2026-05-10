import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
// i have added this just now
import PatientRiskPanel from "../components/PatientRiskPanel";
import { ClinicalBrief, SOAPNoteGenerator, DiagnosisAssist } from "../components/ClinicalDecisionSupport";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Calendar, Users, Clock, TrendingUp, FileText, Activity,
  ChevronRight, Plus, X, Check, ToggleLeft, ToggleRight,
  AlertCircle, Eye,
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────
const FF     = "'DM Sans', 'Segoe UI', sans-serif";
const INDIGO = "#4f46e5";
const TEAL   = "#0a7e6e";
const NAVY   = "#0d1b2a";

const STATUS_META = {
  pending:   { bg: "#fffbeb", color: "#b45309", border: "rgba(180,83,9,0.18)",    label: "Pending"   },
  confirmed: { bg: "#f0fdf9", color: TEAL,       border: "rgba(10,126,110,0.18)", label: "Confirmed" },
  cancelled: { bg: "#fff1f2", color: "#e11d48",  border: "rgba(225,29,72,0.18)", label: "Cancelled" },
  completed: { bg: "#eff6ff", color: "#1d4ed8",  border: "rgba(29,78,216,0.18)", label: "Completed" },
};

const PIE_COLORS = [INDIGO, TEAL, "#e11d48", "#b45309", "#7c3aed", "#94a3b8"];

const MEDICINES = [
  "Paracetamol","Amoxicillin","Metformin","Amlodipine","Atorvastatin",
  "Aspirin","Omeprazole","Cetirizine","Azithromycin","Ibuprofen",
  "Levothyroxine","Metoprolol","Losartan","Pantoprazole","Escitalopram",
];

const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DEFAULT_SCHEDULE = {
  Mon: { enabled: true,  start: "09:00", end: "17:00", slots: 8 },
  Tue: { enabled: true,  start: "09:00", end: "17:00", slots: 8 },
  Wed: { enabled: true,  start: "10:00", end: "16:00", slots: 6 },
  Thu: { enabled: true,  start: "09:00", end: "17:00", slots: 8 },
  Fri: { enabled: true,  start: "09:00", end: "15:00", slots: 6 },
  Sat: { enabled: false, start: "10:00", end: "14:00", slots: 4 },
  Sun: { enabled: false, start: "10:00", end: "14:00", slots: 4 },
};

// ─── SHARED UI HELPERS ────────────────────────────────────────
const card = {
  background: "white", borderRadius: 20,
  border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

function Badge({ status }) {
  const m = STATUS_META[status] || { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: status };
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.border}`, letterSpacing: "0.04em", textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <h2 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>{title}</h2>
      {sub && <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "3px 0 0" }}>{sub}</p>}
    </div>
  );
}

const inputSt = {
  width: "100%", padding: "10px 13px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", background: "#f8fafc",
  fontSize: "0.85rem", color: NAVY, outline: "none",
  fontFamily: FF, boxSizing: "border-box", transition: "border-color 0.2s",
};

function ChartTip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: "0.82rem", fontFamily: FF }}>
      <p style={{ color: "#64748b", margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || INDIGO, fontWeight: 700, margin: 0 }}>{p.value}{suffix}</p>
      ))}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const s = typeof d === "string" ? d : new Date(d).toISOString();
  return s.slice(0, 10);
}

// ─── DERIVE CHART DATA FROM REAL APPOINTMENTS ─────────────────
function useChartData(appointments) {
  return useMemo(() => {
    if (!appointments.length) return { monthly: [], statusDist: [], reasonDist: [], weeklyActivity: [] };

    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = appointments.filter(a => {
        const ad = new Date(a.date || a.createdAt);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      }).length;
      monthly.push({ month: label, count });
    }

    const statusMap = {};
    appointments.forEach(a => { statusMap[a.status] = (statusMap[a.status] || 0) + 1; });
    const statusDist = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    const reasonMap = {};
    appointments.forEach(a => {
      if (a.reason) {
        const key = a.reason.length > 22 ? a.reason.slice(0, 22) + "…" : a.reason;
        reasonMap[key] = (reasonMap[key] || 0) + 1;
      }
    });
    const reasonDist = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

    const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dayMap = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
    appointments.forEach(a => {
      const d = new Date(a.date || a.createdAt);
      if (!isNaN(d)) { const k = DAY_NAMES[d.getDay()]; dayMap[k]++; }
    });
    const weeklyActivity = WEEK_DAYS.map(d => ({ day: d, count: dayMap[d] }));

    return { monthly, statusDist, reasonDist, weeklyActivity };
  }, [appointments]);
}

// ─── TAB: OVERVIEW ────────────────────────────────────────────
function OverviewTab({ appointments, stats, setTab }) {
  const { monthly, statusDist, weeklyActivity } = useChartData(appointments);

  const completionRate = appointments.length
    ? Math.round((appointments.filter(a => a.status === "completed").length / appointments.length) * 100) : 0;

  const upcoming = appointments.filter(a => a.status === "pending" || a.status === "confirmed").slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Trend + completion */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, alignItems: "start" }}>
        <div style={{ ...card, padding: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.4rem" }}>
            <div>
              <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1rem" }}>Appointment Trend</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "3px 0 0" }}>Last 6 months</p>
            </div>
            <span style={{ background: `${INDIGO}10`, borderRadius: 9, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, color: INDIGO }}>{appointments.length} total</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={INDIGO} stopOpacity={0.16} />
                    <stop offset="95%" stopColor={INDIGO} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} width={26} />
                <Tooltip content={<ChartTip suffix=" appts" />} />
                <Area type="monotone" dataKey="count" stroke={INDIGO} strokeWidth={2.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 5, fill: INDIGO, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Completion ring */}
          <div style={{ ...card, padding: "1.4rem", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>Completion Rate</p>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 12px" }}>
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#f1f5f9" strokeWidth="9" />
                <circle cx="48" cy="48" r="38" fill="none" stroke={TEAL} strokeWidth="9"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - completionRate / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 48 48)"
                  style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                <text x="48" y="48" textAnchor="middle" dy="0.35em" fontSize="17" fontWeight="800" fill={NAVY} fontFamily={FF}>{completionRate}%</text>
              </svg>
            </div>
            <p style={{ color: NAVY, fontWeight: 700, fontSize: "0.82rem", margin: 0 }}>Appointments Completed</p>
          </div>

          {/* Status bars */}
          <div style={{ ...card, padding: "1.2rem 1.4rem" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>By Status</p>
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const cnt = appointments.filter(a => a.status === key).length;
              const pct = appointments.length ? Math.round((cnt / appointments.length) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4a6070" }}>{meta.label}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: meta.color }}>{cnt}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: meta.color, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly bar + upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ ...card, padding: "1.8rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.4rem", fontSize: "1rem" }}>Weekly Pattern</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} />
                <YAxis allowDecimals={false} hide />
                <Tooltip content={<ChartTip suffix=" appts" />} cursor={{ fill: `${TEAL}08` }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {weeklyActivity.map((e, i) => <Cell key={i} fill={e.count === Math.max(...weeklyActivity.map(w => w.count)) ? TEAL : `${INDIGO}70`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.68rem", textAlign: "center", marginTop: 4 }}>
            <span style={{ color: TEAL, fontWeight: 700 }}>■</span> Busiest day highlighted
          </p>
        </div>

        <div style={{ ...card, padding: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1rem" }}>Upcoming</h3>
            <button onClick={() => setTab("appointments")} style={{ background: "none", border: "none", color: INDIGO, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", gap: 3 }}>
              All <ChevronRight size={12} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0", fontSize: "0.85rem" }}>No upcoming appointments.</p>
          ) : upcoming.map((a, i) => (
            <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < upcoming.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${INDIGO}0d`, color: INDIGO, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem", flexShrink: 0 }}>
                {a.patient?.name?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.patient?.name}</p>
                <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: 0 }}>{a.time} · {fmtDate(a.date)}</p>
              </div>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick action tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
        {[
          { tab: "appointments", icon: "📅", title: "Appointments",  desc: "Manage all bookings",     color: INDIGO    },
          { tab: "patients",     icon: "👥", title: "My Patients",   desc: "View patient history",    color: TEAL      },
          { tab: "prescription", icon: "✍️", title: "Write Rx",      desc: "Digital prescriptions",   color: "#7c3aed" },
          { tab: "analytics",    icon: "📊", title: "Analytics",     desc: "Charts & insights",       color: "#b45309" },
        ].map((a, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.09)" }}
            onClick={() => setTab(a.tab)}
            style={{ ...card, padding: "1.2rem", cursor: "pointer", transition: "all 0.25s" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 7 }}>{a.icon}</div>
            <p style={{ fontWeight: 700, color: NAVY, margin: "0 0 3px", fontSize: "0.85rem" }}>{a.title}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0 }}>{a.desc}</p>
            <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 3, color: a.color, fontSize: "0.7rem", fontWeight: 700 }}>Open <ChevronRight size={10} /></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB: APPOINTMENTS ────────────────────────────────────────
function AppointmentsTab({ appointments, onUpdate, loading }) {
  const [filter,       setFilter]       = useState("all");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes,        setNotes]        = useState("");
  const [updating,     setUpdating]     = useState(false);

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  const handleUpdate = async (id, status) => {
    setUpdating(true);
    try { await onUpdate(id, status, notes); setSelectedAppt(null); }
    finally { setUpdating(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <SectionHead title="All Appointments" sub={`${appointments.length} total`} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["all","pending","confirmed","completed","cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 13px", borderRadius: 8, border: "none", fontFamily: FF, fontWeight: 700, fontSize: "0.73rem", cursor: "pointer", transition: "all 0.18s", textTransform: "capitalize", background: filter === f ? INDIGO : "#f1f5f9", color: filter === f ? "white" : "#64748b" }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          <div style={{ width: 30, height: 30, border: `3px solid ${INDIGO}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: "3.5rem", textAlign: "center", color: "#94a3b8" }}>No appointments found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ ...card, padding: "1.1rem 1.4rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${INDIGO}0d`, color: INDIGO, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.95rem", flexShrink: 0 }}>
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.88rem" }}>{a.patient?.name}</p>
                    <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: "2px 0 0" }}>{a.patient?.email} · {a.patient?.age}y · {a.patient?.gender}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, color: "#64748b", fontSize: "0.77rem", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{fmtDate(a.date)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{a.time}</span>
                  {a.reason && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} />{a.reason}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge status={a.status} />
                  {a.status !== "completed" && a.status !== "cancelled" && (
                    <button onClick={() => { setSelectedAppt(a); setNotes(a.notes || ""); }}
                      style={{ padding: "5px 12px", borderRadius: 8, background: `${INDIGO}0d`, border: `1px solid ${INDIGO}22`, color: INDIGO, fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", fontFamily: FF }}>
                      Update
                    </button>
                  )}
                </div>
              </div>
              {a.notes && (
                <div style={{ marginTop: 10, background: "#f0fdf9", borderRadius: 9, padding: "7px 12px", fontSize: "0.77rem", color: TEAL, borderLeft: `3px solid ${TEAL}` }}>
                  📝 {a.notes}
                </div>
              )}
              {/* ── CareAI SOAP Note Generator (completed appointments only) ── */}
              {a.status === "completed" && (
                <SOAPNoteGenerator patient={a.patient} appointment={a} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedAppt(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ ...card, padding: "2rem", maxWidth: 460, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: NAVY, margin: 0 }}>Update Appointment</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "3px 0 0" }}>Patient: <strong style={{ color: NAVY }}>{selectedAppt.patient?.name}</strong></p>
                </div>
                <button onClick={() => setSelectedAppt(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={18} /></button>
              </div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Doctor Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Diagnosis, prescriptions, follow-up…" style={{ ...inputSt, resize: "vertical", marginBottom: 16 }} />
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Change Status</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { s: "confirmed", label: "Confirm",  color: TEAL,      bg: "#f0fdf9" },
                  { s: "completed", label: "Complete", color: "#1d4ed8", bg: "#eff6ff" },
                  { s: "cancelled", label: "Cancel",   color: "#e11d48", bg: "#fff1f2" },
                ].map(({ s, label, color, bg }) => (
                  <button key={s} disabled={updating} onClick={() => handleUpdate(selectedAppt._id, s)}
                    style={{ padding: "9px 18px", borderRadius: 10, background: bg, color, border: `1px solid ${color}22`, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: FF, opacity: updating ? 0.6 : 1 }}>
                    {updating ? "…" : label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TAB: PATIENTS ────────────────────────────────────────────
function PatientsTab({ patients, appointments, loading }) {
  const [selected, setSelected] = useState(null);
  const { reasonDist } = useChartData(appointments);

  const getHistory = (pid) =>
    appointments.filter(a => String(a.patient?._id || a.patient) === String(pid));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
      <div>
        <SectionHead title="My Patients" sub={`${patients.length} unique patients from your appointments`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>Loading…</div>
        ) : patients.length === 0 ? (
          <div style={{ ...card, padding: "3.5rem", textAlign: "center", color: "#94a3b8" }}>No patients yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
            {patients.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.09)" }}
                onClick={() => setSelected(p)}
                style={{ ...card, padding: "1.3rem", cursor: "pointer", transition: "all 0.25s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${TEAL}10`, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
                    {p.name?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.88rem" }}>{p.name}</p>
                    <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: 0 }}>{p.email}</p>
                  </div>
                </div>
                <div style={{ fontSize: "0.76rem", color: "#4a6070", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span>👤 {p.age}y · {p.gender}</span>
                  <span>🗓 Last: {fmtDate(p.lastVisit)}</span>
                  {p.lastReason && <span>📋 {p.lastReason}</span>}
                </div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge status={p.appointmentStatus} />
                  <span style={{ fontSize: "0.7rem", color: INDIGO, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}><Eye size={11} /> History</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Top complaints side panel */}
      <div style={{ ...card, padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.2rem", fontSize: "0.95rem" }}>Top Visit Reasons</h3>
        {reasonDist.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No data yet.</p>
        ) : (
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasonDist} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={95} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontFamily: FF }} />
                <Tooltip content={<ChartTip suffix=" cases" />} cursor={{ fill: `${TEAL}08` }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={TEAL} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ ...card, padding: "2rem", maxWidth: 540, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${TEAL}10`, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem" }}>
                    {selected.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: NAVY, margin: 0 }}>{selected.name}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.76rem", margin: 0 }}>{selected.age}y · {selected.gender} · {selected.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>Appointment History ({getHistory(selected._id).length} visits)</p>
              {/* ── CareAI Clinical Brief ── */}
              <ClinicalBrief
                patient={selected}
                appointments={appointments}
                symptoms={[]}
              />
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {getHistory(selected._id).length === 0
                  ? <p style={{ color: "#94a3b8" }}>No history found.</p>
                  : getHistory(selected._id).map((h, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", border: "1px solid #e8edf2" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                        <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: "0.85rem" }}>{h.reason || "General consultation"}</p>
                        <Badge status={h.status} />
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: "0 0 6px" }}>{h.time} · {fmtDate(h.date)}</p>
                      {h.notes && <div style={{ background: "#f0fdf9", borderRadius: 8, padding: "6px 10px", fontSize: "0.77rem", color: TEAL }}>💊 {h.notes}</div>}
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TAB: PRESCRIPTION ────────────────────────────────────────
function PrescriptionTab({ patients }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({ patientId: "", diagnosis: "", followUp: "", notes: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }] });
  const [generated, setGenerated] = useState(null);
  const [busy, setBusy] = useState(false);

  const addMed    = ()        => setForm(f => ({ ...f, medicines: [...f.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }] }));
  const removeMed = i         => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updMed    = (i, k, v) => setForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));

  const generate = async () => {
    if (!form.patientId || !form.diagnosis) return toast.error("Select a patient and enter a diagnosis");
    setBusy(true);
    await new Promise(r => setTimeout(r, 500));
    const patient = patients.find(p => p._id === form.patientId);
    setGenerated({ ...form, patient, doctor: user, date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), rxId: "RX" + Date.now().toString().slice(-6) });
    setBusy(false);
    toast.success("Prescription ready!");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: generated ? "1fr 1fr" : "600px", gap: 24, justifyContent: "start" }}>
      {/* ── CareAI Diagnosis Assist ── */}
      <div style={{ gridColumn: "1 / -1" }}>
        <DiagnosisAssist
          patient={patients.find(p => p._id === form.patientId) || null}
          symptoms={[]}
          onDiagnosisSelect={(diagnosis) => setForm(f => ({ ...f, diagnosis }))}
        />
      </div>
      {/* Form */}
      <div style={{ ...card, padding: "1.8rem" }}>
        <SectionHead title="Write Prescription" sub="Create a digital prescription for your patient" />
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Patient</label>
            <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} style={{ ...inputSt, color: form.patientId ? NAVY : "#94a3b8" }}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Primary Diagnosis</label>
            <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Hypertension Stage 1" style={inputSt} />
          </div>

          {/* Medicines */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>Medications</label>
              <button onClick={addMed} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7, background: `${INDIGO}0d`, border: `1px solid ${INDIGO}22`, color: INDIGO, fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", fontFamily: FF }}>
                <Plus size={10} /> Add
              </button>
            </div>
            {form.medicines.map((med, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "11px", border: "1px solid #e8edf2", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>Medicine {i + 1}</span>
                  {form.medicines.length > 1 && <button onClick={() => removeMed(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e11d48", padding: 0 }}><X size={12} /></button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  <select value={med.name} onChange={e => updMed(i, "name", e.target.value)} style={{ ...inputSt, gridColumn: "1/-1", color: med.name ? NAVY : "#94a3b8" }}>
                    <option value="">Select medicine…</option>
                    {MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input placeholder="Dosage (500mg)"     value={med.dosage}        onChange={e => updMed(i, "dosage",        e.target.value)} style={inputSt} />
                  <input placeholder="Frequency (BD)"     value={med.frequency}     onChange={e => updMed(i, "frequency",     e.target.value)} style={inputSt} />
                  <input placeholder="Duration (7 days)"  value={med.duration}      onChange={e => updMed(i, "duration",      e.target.value)} style={inputSt} />
                  <input placeholder="Instructions"       value={med.instructions}  onChange={e => updMed(i, "instructions",  e.target.value)} style={{ ...inputSt, gridColumn: "1/-1" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Follow-up Date</label>
              <input type="date" value={form.followUp} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(f => ({ ...f, followUp: e.target.value }))} style={inputSt} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Additional Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Dietary advice…" style={inputSt} />
            </div>
          </div>

          <button onClick={generate} disabled={busy} style={{ padding: "12px", borderRadius: 12, background: busy ? "#f1f5f9" : `linear-gradient(135deg, ${INDIGO}, #6366f1)`, color: busy ? "#94a3b8" : "white", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: busy ? "not-allowed" : "pointer", fontFamily: FF, boxShadow: busy ? "none" : `0 6px 20px ${INDIGO}30`, transition: "all 0.2s" }}>
            {busy ? "Generating…" : "Generate Prescription →"}
          </button>
        </div>
      </div>

      {/* Preview */}
      {generated && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ ...card, padding: "2rem" }}>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, #0a3d35)`, borderRadius: 14, padding: "1.1rem 1.3rem", marginBottom: "1.3rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(10,126,110,0.2)", filter: "blur(14px)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>CarePulse Medical</p>
                <h3 style={{ color: "white", fontWeight: 800, margin: "2px 0 0", fontSize: "0.92rem" }}>Dr. {user.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", margin: 0 }}>{user.specialization}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.58rem", margin: 0 }}>{generated.rxId}</p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem", margin: "2px 0 0" }}>{generated.date}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: "1.1rem" }}>
            {[
              { l: "Patient",    v: generated.patient?.name },
              { l: "Age/Gender", v: `${generated.patient?.age}y / ${generated.patient?.gender}` },
              { l: "Diagnosis",  v: generated.diagnosis },
              { l: "Date",       v: generated.date },
            ].map((f, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 9, padding: "8px 10px", border: "1px solid #e8edf2" }}>
                <p style={{ fontSize: "0.58rem", color: "#94a3b8", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.l}</p>
                <p style={{ fontSize: "0.8rem", color: NAVY, fontWeight: 700, margin: "2px 0 0" }}>{f.v}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 7px" }}>Prescribed Medications</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: "0.9rem" }}>
            {generated.medicines.filter(m => m.name).map((m, i) => (
              <div key={i} style={{ background: "#f0fdf9", borderRadius: 9, padding: "8px 11px", border: `1px solid ${TEAL}18`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 5 }}>
                <div>
                  <span style={{ fontWeight: 700, color: NAVY, fontSize: "0.8rem" }}>{m.name}</span>
                  {m.instructions && <p style={{ color: "#64748b", fontSize: "0.68rem", margin: "1px 0 0" }}>{m.instructions}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: TEAL }}>{m.dosage} · {m.frequency}</span>
                  {m.duration && <p style={{ color: "#94a3b8", fontSize: "0.66rem", margin: 0 }}>{m.duration}</p>}
                </div>
              </div>
            ))}
          </div>

          {generated.notes    && <div style={{ background: "#fffbeb", borderRadius: 9, padding: "8px 11px", border: "1px solid rgba(180,83,9,0.12)", marginBottom: 7, fontSize: "0.78rem", color: "#b45309" }}>📝 {generated.notes}</div>}
          {generated.followUp && <div style={{ background: "#eff6ff", borderRadius: 9, padding: "8px 11px", border: "1px solid rgba(29,78,216,0.12)", marginBottom: "1rem", fontSize: "0.78rem", color: "#1d4ed8" }}>📅 Follow-up: {generated.followUp}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ flex: 1, padding: "10px", borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.8rem", border: "none", cursor: "pointer", fontFamily: FF }}>🖨 Print</button>
            <button onClick={() => { navigator.clipboard.writeText(generated.rxId); toast.success("ID copied!"); }} style={{ padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e8edf2", color: "#4a6070", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: FF }}>📋</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── TAB: SCHEDULE ────────────────────────────────────────────
function ScheduleTab({ appointments }) {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const bookedPerDay = useMemo(() => {
    const map = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
    const DN  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    appointments.filter(a => a.status === "confirmed" || a.status === "pending").forEach(a => {
      const d = new Date(a.date || a.createdAt);
      if (!isNaN(d)) { const k = DN[d.getDay()]; if (map[k] !== undefined) map[k]++; }
    });
    return map;
  }, [appointments]);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false); setSaved(true);
    toast.success("Schedule saved!");
    setTimeout(() => setSaved(false), 3000);
  };

  const totalSlots  = Object.values(schedule).filter(d => d.enabled).reduce((s, d) => s + d.slots, 0);
  const activeDays  = Object.values(schedule).filter(d => d.enabled).length;
  const totalBooked = Object.values(bookedPerDay).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active Days",  value: activeDays,                              color: INDIGO    },
          { label: "Weekly Slots", value: totalSlots,                              color: TEAL      },
          { label: "Booked",       value: totalBooked,                             color: "#b45309" },
          { label: "Available",    value: Math.max(0, totalSlots - totalBooked),   color: "#0a7e6e" },
        ].map((k, i) => (
          <div key={i} style={{ ...card, padding: "1rem 1.2rem" }}>
            <p style={{ fontWeight: 800, color: k.color, fontSize: "1.4rem", margin: 0, lineHeight: 1 }}>{k.value}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: "3px 0 0", fontWeight: 500 }}>{k.label}</p>
          </div>
        ))}
      </div>

      <SectionHead title="Weekly Availability" sub="Set working hours and max consultation slots per day" />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {WEEK_DAYS.map(day => {
          const d      = schedule[day];
          const booked = bookedPerDay[day] || 0;
          const pct    = d.slots > 0 ? Math.min(100, Math.round((booked / d.slots) * 100)) : 0;
          const isFull = pct >= 80;
          return (
            <div key={day} style={{ ...card, padding: "1rem 1.4rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, opacity: d.enabled ? 1 : 0.5, transition: "opacity 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 86 }}>
                <button onClick={() => setSchedule(s => ({ ...s, [day]: { ...s[day], enabled: !s[day].enabled } }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: d.enabled ? TEAL : "#cbd5e1", padding: 0, display: "flex" }}>
                  {d.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: "0.87rem" }}>{day}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>From</span>
                <input type="time" value={d.start} disabled={!d.enabled} onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], start: e.target.value } }))} style={{ ...inputSt, width: 105 }} />
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>To</span>
                <input type="time" value={d.end}   disabled={!d.enabled} onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], end:   e.target.value } }))} style={{ ...inputSt, width: 105 }} />
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>Max</span>
                <input type="number" min="1" max="20" value={d.slots} disabled={!d.enabled}
                  onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], slots: parseInt(e.target.value) || 1 } }))}
                  style={{ ...inputSt, width: 56, textAlign: "center" }} />
              </div>
              <div style={{ minWidth: 120 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{booked}/{d.slots} booked</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: isFull ? "#e11d48" : TEAL }}>{pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: isFull ? "#e11d48" : TEAL, transition: "width 0.6s ease" }} />
                </div>
              </div>
              {d.enabled && <span style={{ fontSize: "0.66rem", color: TEAL, fontWeight: 700, background: `${TEAL}0d`, padding: "3px 9px", borderRadius: 99, border: `1px solid ${TEAL}18`, whiteSpace: "nowrap" }}>Active</span>}
            </div>
          );
        })}
      </div>

      <button onClick={save} disabled={saving} style={{ padding: "12px 30px", borderRadius: 12, background: saved ? TEAL : `linear-gradient(135deg, ${INDIGO}, #6366f1)`, color: "white", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: FF, boxShadow: `0 6px 20px ${INDIGO}28`, display: "flex", alignItems: "center", gap: 7, transition: "background 0.3s" }}>
        {saving ? "Saving…" : saved ? <><Check size={14} /> Saved!</> : "Save Schedule"}
      </button>
    </div>
  );
}

// ─── TAB: ANALYTICS ───────────────────────────────────────────
function AnalyticsTab({ appointments, stats }) {
  const { monthly, statusDist, reasonDist, weeklyActivity } = useChartData(appointments);

  const completed       = appointments.filter(a => a.status === "completed").length;
  const cancelled       = appointments.filter(a => a.status === "cancelled").length;
  const cancelRate      = appointments.length ? Math.round((cancelled / appointments.length) * 100) : 0;
  const completionRate  = appointments.length ? Math.round((completed / appointments.length) * 100) : 0;

  const kpis = [
    { label: "Total Appointments", value: stats.total,           color: INDIGO,    icon: "📅" },
    { label: "Unique Patients",     value: stats.uniquePatients, color: TEAL,       icon: "👥" },
    { label: "Completed",           value: completed,            color: "#1d4ed8",  icon: "✅" },
    { label: "Cancellation Rate",   value: `${cancelRate}%`,     color: "#e11d48",  icon: "📉" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 14 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ ...card, padding: "1.3rem 1.5rem" }}>
            <div style={{ fontSize: "1.3rem", marginBottom: 7 }}>{k.icon}</div>
            <p style={{ fontWeight: 800, color: k.color, fontSize: "1.7rem", margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>{k.value}</p>
            <p style={{ fontWeight: 600, color: NAVY, fontSize: "0.78rem", margin: "4px 0 0" }}>{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly volume + status pie */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ ...card, padding: "1.8rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.4rem", fontSize: "1rem" }}>Monthly Appointment Volume</h3>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} width={24} />
                <Tooltip content={<ChartTip suffix=" appts" />} cursor={{ fill: `${INDIGO}06` }} />
                <Bar dataKey="count" name="Appointments" radius={[7, 7, 0, 0]} fill={INDIGO} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...card, padding: "1.8rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.2rem", fontSize: "1rem" }}>Status Breakdown</h3>
          {statusDist.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No data yet.</p>
          ) : (
            <>
              <div style={{ height: 155, marginBottom: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDist} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value">
                      {statusDist.map((e, i) => <Cell key={i} fill={STATUS_META[e.name]?.color || PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.76rem", fontFamily: FF }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {statusDist.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_META[item.name]?.color || PIE_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: "0.76rem", color: "#4a6070", fontWeight: 500, textTransform: "capitalize" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: NAVY }}>{item.value}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Weekly trend + top reasons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ ...card, padding: "1.8rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.4rem", fontSize: "1rem" }}>Busiest Days</h3>
          <div style={{ height: 195 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={TEAL} stopOpacity={0.16} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FF }} />
                <YAxis allowDecimals={false} hide />
                <Tooltip content={<ChartTip suffix=" appts" />} />
                <Area type="monotone" dataKey="count" stroke={TEAL} strokeWidth={2.5} fill="url(#wGrad)" dot={false} activeDot={{ r: 5, fill: TEAL, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...card, padding: "1.8rem" }}>
          <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 1.4rem", fontSize: "1rem" }}>Top Visit Reasons</h3>
          {reasonDist.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No reason data yet. Ask patients to fill in reasons when booking.</p>
          ) : (
            <div style={{ height: 195 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasonDist} layout="vertical" barSize={13}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: FF }} />
                  <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontFamily: FF }} />
                  <Tooltip content={<ChartTip suffix=" cases" />} cursor={{ fill: `${INDIGO}06` }} />
                  <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]}>
                    {reasonDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Summary banner */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, #0a3d35)`, borderRadius: 20, padding: "1.8rem 2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(10,126,110,0.15)", filter: "blur(28px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Practice Summary</p>
          <h3 style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
            {stats.uniquePatients} patients trust you with their health.
          </h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>
            {completed} completed · {stats.pending} pending · {cancelRate}% cancellation rate
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 18px", border: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.62rem", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Completion Rate</p>
          <p style={{ color: "white", fontWeight: 800, fontSize: "1.5rem", margin: 0 }}>{completionRate}%</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const token    = localStorage.getItem("token");
  const headers  = { Authorization: `Bearer ${token}` };

  const [tab,          setTab]          = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [stats,        setStats]        = useState({ total: 0, todayCount: 0, pending: 0, uniquePatients: 0 });
  const [loading,      setLoading]      = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptRes, patRes, statsRes] = await Promise.all([
        axios.get("/api/appointments/doctor/all",      { headers }),
        axios.get("/api/appointments/doctor/patients", { headers }),
        axios.get("/api/appointments/doctor/stats",    { headers }),
      ]);
      setAppointments(apptRes.data   || []);
      setPatients(patRes.data        || []);
      setStats(statsRes.data         || {});
    } catch {
      toast.error("Failed to load dashboard. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Call real API, then update state optimistically + refresh stats
  const handleApptUpdate = async (id, status, notes) => {
    await axios.put(`/api/appointments/doctor/update/${id}`, { status, notes }, { headers });
    toast.success(`Marked as ${status}`);
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status, notes } : a));
    const s = await axios.get("/api/appointments/doctor/stats", { headers });
    setStats(s.data || {});
  };

  const pendingCount = appointments.filter(a => a.status === "pending").length;

  const TABS = [
    { key: "overview",     label: "Overview",      icon: <Activity   size={13} /> },
    { key: "appointments", label: "Appointments",  icon: <Calendar   size={13} /> },
    { key: "patients",     label: "Patients",      icon: <Users      size={13} /> },
    { key: "prescription", label: "Prescriptions", icon: <FileText   size={13} /> },
    { key: "schedule",     label: "Schedule",      icon: <Clock      size={13} /> },
    { key: "analytics",    label: "Analytics",     icon: <TrendingUp size={13} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #ffffff 60%, #eef4fb 100%)", fontFamily: FF, paddingTop: "5.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: 24, padding: "2rem 2.5rem", marginBottom: 18, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(99,102,241,0.18)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>👨‍⚕️</div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Doctor Portal</p>
              <h1 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 800, color: "white", margin: "2px 0 0", letterSpacing: "-0.02em" }}>Dr. {user.name || "Doctor"}</h1>
              {user.specialization && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", margin: 0 }}>{user.specialization}{user.experience ? ` · ${user.experience} yrs` : ""}</p>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", position: "relative" }}>
            {pendingCount > 0 && (
              <div style={{ background: "rgba(180,83,9,0.18)", border: "1px solid rgba(180,83,9,0.28)", borderRadius: 10, padding: "7px 13px", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={12} color="#fbbf24" />
                <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.76rem" }}>{pendingCount} pending</span>
              </div>
            )}
            <button onClick={() => { localStorage.clear(); navigate("/login"); }}
              style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: FF }}>
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stat Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total Appointments", value: loading ? "—" : stats.total,           color: INDIGO,    icon: "📅" },
            { label: "Today's Schedule",   value: loading ? "—" : stats.todayCount,       color: TEAL,      icon: "🗓" },
            { label: "Pending Review",     value: loading ? "—" : pendingCount,           color: "#b45309", icon: "⏳" },
            { label: "Unique Patients",    value: loading ? "—" : stats.uniquePatients,   color: "#e11d48", icon: "👥" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ ...card, padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "0.67rem", color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Bar */}
        <div style={{ background: "white", borderRadius: 13, padding: 4, border: "1px solid #e8edf2", display: "flex", gap: 3, marginBottom: 18, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "7px 14px", borderRadius: 9, border: "none", fontFamily: FF, fontWeight: 700, fontSize: "0.77rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5, background: tab === t.key ? `linear-gradient(135deg, ${INDIGO}, #6366f1)` : "transparent", color: tab === t.key ? "white" : "#64748b", boxShadow: tab === t.key ? `0 4px 12px ${INDIGO}28` : "none" }}>
              {t.icon} {t.label}
              {t.key === "appointments" && pendingCount > 0 && (
                <span style={{ background: "#e11d48", color: "white", borderRadius: 99, fontSize: "0.6rem", fontWeight: 800, padding: "1px 5px" }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.17 }}>
            {tab === "overview"     && <> <OverviewTab     appointments={appointments} stats={stats} setTab={setTab} />  <PatientRiskPanel patients={patients} /> </>}
            {tab === "appointments" && <AppointmentsTab appointments={appointments} onUpdate={handleApptUpdate} loading={loading} />}
            {tab === "patients"     && <PatientsTab     patients={patients} appointments={appointments} loading={loading} />}
            {tab === "prescription" && <PrescriptionTab patients={patients} />}
            {tab === "schedule"     && <ScheduleTab     appointments={appointments} />}
            {tab === "analytics"    && <AnalyticsTab    appointments={appointments} stats={stats} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { nav, button { display: none !important; } }
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 290px"],
          [style*="grid-template-columns: 1fr 260px"],
          [style*="grid-template-columns: 1fr 300px"],
          [style*="grid-template-columns: 1fr 1fr"],
          [style*="grid-template-columns: 600px"],
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}