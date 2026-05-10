import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Heart, Thermometer, Calendar, FileText, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PreAppointmentBrief } from "../components/ClinicalDecisionSupport";
import HealthTimeline from "../components/HealthTimeline";

const healthData = [
  { name: "Mon", pulse: 72 },
  { name: "Tue", pulse: 75 },
  { name: "Wed", pulse: 70 },
  { name: "Thu", pulse: 82 },
  { name: "Fri", pulse: 74 },
  { name: "Sat", pulse: 71 },
  { name: "Sun", pulse: 73 },
];

const quickActions = [
  { icon: <Calendar size={18} />, label: "Book Appointment", path: "/doctors-list", color: "#0a7e6e" },
  { icon: <Activity size={18} />, label: "Log Symptoms", path: "/symptom", color: "#1a5f9e" },
  { icon: <FileText size={18} />, label: "My Documents", path: "/docUpload", color: "#7c3aed" },
  { icon: <MessageCircle size={18} />, label: "CareAI Assistant", path: "/chatbot", color: "#db7706" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: "0.85rem", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <p style={{ color: "#64748b", margin: 0 }}>{label}</p>
        <p style={{ color: "#0a7e6e", fontWeight: 700, margin: "2px 0 0" }}>{payload[0].value} bpm</p>
      </div>
    );
  }
  return null;
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Patient" };

  // ── CDSS: fetch upcoming appointment + recent symptoms ──────
  const [upcomingAppt,   setUpcomingAppt]   = useState(null);
  const [recentSymptoms, setRecentSymptoms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch upcoming appointment
    axios.get("/api/appointments/my", { headers })
      .then(res => {
        const upcoming = (res.data || []).find(
          a => a.status === "pending" || a.status === "confirmed"
        );
        setUpcomingAppt(upcoming || null);
      })
      .catch(() => {});

    // Fetch recent symptoms
    if (user?.id) {
      axios.get(`/api/symptoms/patient/${user.id}`, { headers })
        .then(res => setRecentSymptoms(res.data || []))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 60%, #eef4fb 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", paddingTop: "5.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #0a3d35 100%)", borderRadius: 24, padding: "2.5rem", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(10,126,110,0.15)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Patient Dashboard</p>
            <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: 0 }}>
              Hello, {user.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", marginTop: 4 }}>Here's your health summary this week.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/doctors-list" style={{ textDecoration: "none" }}>
              <button style={{ padding: "10px 22px", borderRadius: 12, background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", backdropFilter: "blur(8px)", transition: "background 0.2s" }}>
                + Book Appointment
              </button>
            </Link>
            <button onClick={handleLogout} style={{ padding: "10px 22px", borderRadius: 12, background: "rgba(225,29,72,0.15)", color: "#fca5a5", border: "1px solid rgba(225,29,72,0.25)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Heart Rate",        val: "72 bpm",  icon: <Heart size={20} />,       color: "#ef4444", bg: "#fff1f2", border: "rgba(239,68,68,0.1)"     },
            { label: "Body Temperature",  val: "36.6 °C", icon: <Thermometer size={20} />, color: "#f59e0b", bg: "#fffbeb", border: "rgba(245,158,11,0.1)"    },
            { label: "Active Minutes",    val: "45 min",  icon: <Activity size={20} />,    color: "#0a7e6e", bg: "#f0fdf9", border: "rgba(10,126,110,0.1)"    },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              style={{ background: "white", borderRadius: 18, padding: "1.5rem", border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.25s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0d1b2a", margin: "2px 0 0" }}>{s.val}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── CDSS: Pre-Appointment Brief (shows only if upcoming appt exists) ── */}
        {upcomingAppt && (
          <PreAppointmentBrief
            appointment={upcomingAppt}
            recentSymptoms={recentSymptoms}
          />
        )}

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            style={{ background: "white", borderRadius: 20, padding: "1.8rem", border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: "#0d1b2a", margin: 0, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>Pulse Activity</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "3px 0 0" }}>Weekly heart rate overview</p>
              </div>
              <select style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "0.8rem", fontWeight: 600, color: "#4a6070", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", outline: "none", cursor: "pointer" }}>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
                  <defs>
                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a7e6e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0a7e6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="pulse" stroke="#0a7e6e" strokeWidth={2.5} fill="url(#pulseGrad)" dot={false} activeDot={{ r: 5, fill: "#0a7e6e", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              style={{ background: "white", borderRadius: 20, padding: "1.5rem", border: "1px solid #e8edf2", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px", fontSize: "0.95rem" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quickActions.map((a, i) => (
                  <Link key={i} to={a.path} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f0f4f8", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${a.color}08`; e.currentTarget.style.borderColor = `${a.color}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f0f4f8"; }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${a.color}12`, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {a.icon}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0d1b2a" }}>{a.label}</span>
                      <span style={{ marginLeft: "auto", color: "#c8d3de", fontSize: "0.8rem" }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Health Tip */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
              style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #0a3d35 100%)", borderRadius: 20, padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(10,126,110,0.2)", filter: "blur(24px)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>💡</div>
                <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 8px" }}>Daily Health Insight</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", lineHeight: 1.65, margin: 0 }}>
                  Staying hydrated improves heart performance and cognitive stability. Try drinking water every 2 hours.
                </p>
                <Link to="/activities" style={{ textDecoration: "none" }}>
                  <button style={{ marginTop: 14, width: "100%", padding: "9px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
                    Explore Wellness Hub →
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Health Timeline ── */}
        <HealthTimeline mode="patient" />

      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}