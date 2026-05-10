// ============================================================
// MyAppointments.jsx
// ============================================================
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Calendar, Clock, FileText } from "lucide-react";

const STATUS_STYLES = {
  pending: { bg: "#fffbeb", color: "#b45309", border: "rgba(180,83,9,0.15)" },
  confirmed: { bg: "#f0fdf9", color: "#0a7e6e", border: "rgba(10,126,110,0.15)" },
  cancelled: { bg: "#fff1f2", color: "#e11d48", border: "rgba(225,29,72,0.15)" },
  completed: { bg: "#eff6ff", color: "#1d4ed8", border: "rgba(29,78,216,0.15)" },
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/appointments/my", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error("Failed to load appointments."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 60%, #eef4fb 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        paddingTop: "6.5rem",
        paddingBottom: "4rem",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 800,
              color: "#0d1b2a",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            My Appointments
          </h1>
          <p style={{ color: "#64748b", marginTop: 6 }}>Track and manage your scheduled consultations.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #0a7e6e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "4rem",
              textAlign: "center",
              border: "2px dashed #e2e8f0",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
            <h2 style={{ fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px" }}>No appointments yet</h2>
            <p style={{ color: "#64748b", marginBottom: 20 }}>Book your first consultation from the doctors list.</p>
            <a href="/doctors-list" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                  boxShadow: "0 6px 20px rgba(10,126,110,0.25)",
                }}
              >
                Browse Doctors →
              </button>
            </a>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {appointments.map((appt, i) => {
              const ss = STATUS_STYLES[appt.status] || { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
              return (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(0,0,0,0.08)" }}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: "1.5rem 1.8rem",
                    border: "1px solid #e8edf2",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                    <div>
                      <h2 style={{ fontWeight: 800, color: "#0d1b2a", margin: "0 0 3px", fontSize: "1.05rem" }}>
                        Dr. {appt.doctor?.name}
                      </h2>
                      <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>
                        {appt.doctor?.specialization} · {appt.doctor?.experience} years exp.
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, color: "#4a6070", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Calendar size={14} /> {appt.date}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={14} /> {appt.time}
                        </span>
                        {appt.reason && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <FileText size={14} /> {appt.reason}
                          </span>
                        )}
                      </div>

                      {appt.notes && (
                        <div
                          style={{
                            marginTop: 12,
                            background: "#f0fdf9",
                            border: "1px solid rgba(10,126,110,0.1)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontSize: "0.82rem",
                            color: "#0a7e6e",
                          }}
                        >
                          <strong>Doctor's Notes:</strong> {appt.notes}
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        padding: "5px 14px",
                        borderRadius: 99,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: ss.bg,
                        color: ss.color,
                        border: `1px solid ${ss.border}`,
                        letterSpacing: "0.04em",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {appt.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}