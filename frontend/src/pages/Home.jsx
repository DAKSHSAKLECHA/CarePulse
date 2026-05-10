import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
  { value: "10K+", label: "Patients Served" },
  { value: "500+", label: "Expert Doctors" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

const features = [
  {
    icon: "◈",
    title: "Live Consultation",
    desc: "Connect with board-certified physicians instantly from anywhere.",
    color: "#0a7e6e",
  },
  {
    icon: "◉",
    title: "Symptom Analysis",
    desc: "CareAI-assisted diagnostics that learn and adapt to your health profile.",
    color: "#1a5f9e",
  },
  {
    icon: "◎",
    title: "Secure Records",
    desc: "Your medical history, prescriptions, and reports — always protected.",
    color: "#2d6a4f",
  },
  {
    icon: "◐",
    title: "Smart Reminders",
    desc: "Never miss a dose or appointment with intelligent notifications.",
    color: "#4a3f7a",
  },
];

const rotatingWords = ["Smarter.", "Faster.", "Safer.", "Personal."];

export default function Home() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((p) => (p + 1) % rotatingWords.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 50%, #eef4fb 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Ambient background circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(10,126,110,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,95,158,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1"
            >
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(10,126,110,0.08)",
                  color: "#0a7e6e",
                  border: "1px solid rgba(10,126,110,0.15)",
                  letterSpacing: "0.05em",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#0a7e6e",
                    display: "inline-block",
                    animation: "pulse 2s infinite",
                  }}
                />
                Trusted Healthcare Platform
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "#0d1b2a",
                  letterSpacing: "-0.03em",
                  marginBottom: "1rem",
                }}
              >
                Healthcare Made{" "}
                <br />
                <span
                  style={{
                    display: "inline-block",
                    minWidth: 200,
                    color: "#0a7e6e",
                    position: "relative",
                  }}
                >
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ display: "block" }}
                  >
                    {rotatingWords[wordIdx]}
                  </motion.span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      height: 3,
                      width: "100%",
                      borderRadius: 99,
                      background: "linear-gradient(90deg, #0a7e6e, #1a5f9e)",
                    }}
                  />
                </span>
              </h1>

              <p
                style={{
                  fontSize: "1.125rem",
                  color: "#4a6070",
                  lineHeight: 1.75,
                  maxWidth: 480,
                  marginBottom: "2.5rem",
                }}
              >
                Experience a new standard of care. Connect with top physicians,
                track your health daily, and manage all your records in one
                secure, intelligent platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link to="/symptom">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "14px 32px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #0a7e6e 0%, #0d9488 100%)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 8px 24px rgba(10,126,110,0.28)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Start Health Tracking →
                  </motion.button>
                </Link>
                <Link to="/chatbot">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "14px 32px",
                      borderRadius: 12,
                      background: "white",
                      color: "#0a7e6e",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      border: "1.5px solid rgba(10,126,110,0.25)",
                      cursor: "pointer",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    CareAI Health Assistant
                  </motion.button>
                </Link>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 0,
                  borderTop: "1px solid rgba(0,0,0,0.07)",
                  paddingTop: "1.5rem",
                }}
              >
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    style={{
                      paddingRight: i < 3 ? 16 : 0,
                      borderRight: i < 3 ? "1px solid rgba(0,0,0,0.07)" : "none",
                      paddingLeft: i > 0 ? 16 : 0,
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0a7e6e", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7a95a6", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative flex justify-center"
            >
              {/* Main card */}
              <div
                style={{
                  width: 380,
                  maxWidth: "100%",
                  position: "relative",
                }}
              >
                {/* Background card */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    right: -20,
                    bottom: -20,
                    borderRadius: 28,
                    background: "linear-gradient(135deg, #0a7e6e15, #1a5f9e10)",
                    border: "1px solid rgba(10,126,110,0.1)",
                  }}
                />

                {/* Doctor card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 24,
                    padding: "2rem",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.1)",
                    position: "relative",
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        flexShrink: 0,
                      }}
                    >
                      👨‍⚕️
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0d1b2a", fontSize: "1rem" }}>Dr. CarePulse</div>
                      <div style={{ fontSize: "0.8rem", color: "#7a95a6" }}>Senior Physician</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                        <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 600 }}>Available Now</span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      { label: "Heart Rate", val: "72 bpm", color: "#ef4444", icon: "❤️" },
                      { label: "Blood Pressure", val: "120/80", color: "#3b82f6", icon: "🩸" },
                      { label: "Temperature", val: "98.6°F", color: "#f59e0b", icon: "🌡️" },
                      { label: "SpO₂", val: "99%", color: "#10b981", icon: "💨" },
                    ].map((v, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 12,
                          padding: "10px 12px",
                          border: "1px solid #e8edf2",
                        }}
                      >
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: 2 }}>{v.icon} {v.label}</div>
                        <div style={{ fontWeight: 700, color: "#0d1b2a", fontSize: "0.95rem" }}>{v.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Heartbeat bar */}
                  <div
                    style={{
                      background: "#f0fdf9",
                      borderRadius: 12,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: "1px solid rgba(10,126,110,0.1)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {[3, 6, 10, 5, 14, 4, 9, 3, 12, 5, 8, 3].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 1.6, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
                          style={{
                            width: 3,
                            height: h * 2.2,
                            background: "#0a7e6e",
                            borderRadius: 99,
                            transformOrigin: "center",
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0a7e6e", fontSize: "0.85rem" }}>Normal Rhythm</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>ECG Live</div>
                    </div>
                  </div>
                </div>

                {/* Floating badge 1 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -30,
                    background: "white",
                    borderRadius: 14,
                    padding: "10px 14px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #f0f4f8",
                    zIndex: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🔬</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#0d1b2a" }}>AI Diagnosis</div>
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>98.3% accuracy</div>
                  </div>
                </motion.div>

                {/* Floating badge 2 */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: -35,
                    background: "white",
                    borderRadius: 14,
                    padding: "10px 14px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #f0f4f8",
                    zIndex: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#0d1b2a" }}>Next Appointment</div>
                    <div style={{ fontSize: "0.68rem", color: "#0a7e6e", fontWeight: 600 }}>Today, 3:00 PM</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section style={{ padding: "5rem 1.5rem", background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Everything You Need
            </div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                color: "#0d1b2a",
                letterSpacing: "-0.03em",
              }}
            >
              One platform. Complete care.
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
                style={{
                  background: "#f8fafc",
                  borderRadius: 20,
                  padding: "1.8rem",
                  border: "1px solid #e8edf2",
                  cursor: "default",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    color: f.color,
                    fontWeight: 900,
                    marginBottom: "1.2rem",
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "#0d1b2a",
                    marginBottom: 8,
                    fontSize: "1rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              background: "linear-gradient(135deg, #0d1b2a 0%, #0a3d35 100%)",
              borderRadius: 28,
              padding: "3.5rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "rgba(10,126,110,0.2)",
                filter: "blur(40px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(26,95,158,0.2)",
                filter: "blur(40px)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 800,
                  color: "white",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Your health deserves the best.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", fontSize: "1rem" }}>
                Join thousands of patients taking control of their wellbeing.
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "14px 36px",
                    borderRadius: 12,
                    background: "white",
                    color: "#0a7e6e",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  }}
                >
                  Get Started Free →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}