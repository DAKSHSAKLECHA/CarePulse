// ============================================================
// Service.jsx  (copy to pages/Service.jsx)
// ============================================================
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function ServiceCard({ title, desc, link, btnText, icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.09)" }}
      style={{
        background: "white",
        borderRadius: 20,
        padding: "1.8rem",
        border: "1px solid #e8edf2",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.28s ease",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: `${accent}10`,
          border: `1px solid ${accent}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          marginBottom: "1.2rem",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontWeight: 700, color: "#0d1b2a", margin: "0 0 8px", fontSize: "1rem", letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.65, margin: "0 0 1.4rem", flex: 1 }}>{desc}</p>
      {link ? (
        <Link to={link} style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 12,
              background: `${accent}08`,
              color: accent,
              fontWeight: 700,
              fontSize: "0.875rem",
              border: `1px solid ${accent}18`,
              cursor: "pointer",
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              transition: "all 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = accent;
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${accent}08`;
              e.currentTarget.style.color = accent;
              e.currentTarget.style.borderColor = `${accent}18`;
            }}
          >
            {btnText} →
          </button>
        </Link>
      ) : (
        <button
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: 12,
            background: `${accent}08`,
            color: accent,
            fontWeight: 700,
            fontSize: "0.875rem",
            border: `1px solid ${accent}18`,
            cursor: "pointer",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          {btnText}
        </button>
      )}
    </motion.div>
  );
}

export default function ServiceSection() {
  const [role, setRole] = useState(localStorage.getItem("role") || "public");
  const location = useLocation();

  useEffect(() => {
    setRole(localStorage.getItem("role") || "public");
  }, [location]);

  const patientServices = [
    { icon: "🩺", title: "Find Doctors", desc: "Browse verified specialists and book consultations instantly.", link: "/doctors-list", btnText: "Find a Doctor", accent: "#1a5f9e" },
    { icon: "📈", title: "Symptom Tracker", desc: "Log daily health metrics and receive AI-powered wellness insights.", link: "/symptom", btnText: "Track Now", accent: "#e11d48" },
    { icon: "🤖", title: "CareAI Health Assistant", desc: "Chat with our intelligent health bot for instant guidance, 24/7.", link: "/chatbot", btnText: "Start Chat", accent: "#0a7e6e" },
    { icon: "🌿", title: "Wellness Hub", desc: "Yoga sessions, meditation guides, and curated health articles.", link: "/activities", btnText: "Explore", accent: "#b45309" },
    { icon: "🔒", title: "Medical Records", desc: "Upload, store, and manage your prescriptions and reports securely.", link: "/docUpload", btnText: "Manage Files", accent: "#7c3aed" },
  ];

  const doctorServices = [
    { icon: "📊", title: "Doctor Dashboard", desc: "Overview of your practice metrics, ratings, and patient activity.", link: "/doctor/dashboard", btnText: "Go to Dashboard", accent: "#4f46e5" },
    { icon: "📅", title: "Manage Appointments", desc: "View and manage upcoming consultations and your schedule.", link: "/doctor/dashboard", btnText: "View Schedule", accent: "#1a5f9e" },
    { icon: "📂", title: "Patient Records", desc: "Securely access patient history and uploaded medical documents.", link: "#", btnText: "Access Records", accent: "#0a7e6e" },
  ];

  const services = role === "doctor" ? doctorServices : patientServices;

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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 99,
              background: "rgba(10,126,110,0.07)",
              color: "#0a7e6e",
              fontWeight: 600,
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              border: "1px solid rgba(10,126,110,0.12)",
            }}
          >
            {role === "doctor" ? "Professional Tools" : "Healthcare Services"}
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.03em", margin: "0 0 0.75rem" }}>
            Our Services
          </h1>
          <p style={{ color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
            {role === "doctor"
              ? "Professional tools to manage your practice and deliver exceptional patient care."
              : "Comprehensive healthcare tools designed for your complete wellness journey."}
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <ServiceCard {...s} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}