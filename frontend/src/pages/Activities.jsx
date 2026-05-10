// pages/Activities.jsx
import React from "react";
import { motion } from "framer-motion";

const articles = [
  { title: "Emotional Wellness Toolkit", source: "NIH", link: "https://www.nih.gov/health-information/emotional-wellness-toolkit" },
  { title: "Understanding Mental Health", source: "NIMH", link: "https://www.nimh.nih.gov/health/statistics/mental-illness" },
  { title: "Nature & Wellbeing", source: "Nature Journal", link: "https://www.nature.com/articles/d41586-021-02690-5" },
  { title: "The Art of Healthy Living", source: "Art of Healthy Living", link: "https://artofhealthyliving.com/" },
];

const yogaVideos = ["hJbRpHZr_d0", "uNmKzlh55Fo"];
const wellnessVideos = ["MaFv-SMgHb0", "MzVl6Lu10kw"];

function SectionCard({ title, emoji, children, accent = "#0a7e6e" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        background: "white",
        borderRadius: 20,
        padding: "1.8rem",
        border: "1px solid #e8edf2",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.4rem" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${accent}10`,
            border: `1px solid ${accent}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          {emoji}
        </div>
        <h2 style={{ fontWeight: 800, color: "#0d1b2a", margin: 0, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function Activities() {
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

        {/* Header */}
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
            Mind & Body
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.03em", margin: "0 0 0.75rem" }}>
            Wellness Hub
          </h1>
          <p style={{ color: "#64748b", maxWidth: 460, margin: "0 auto", lineHeight: 1.65 }}>
            Curated resources to keep your mind and body in perfect harmony.
          </p>
        </motion.div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

          {/* Articles */}
          <SectionCard title="Read" emoji="📚" accent="#1a5f9e">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {articles.map((a, i) => (
                <a
                  key={i}
                  href={a.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px solid #f0f4f8",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(26,95,158,0.06)";
                      e.currentTarget.style.borderColor = "rgba(26,95,158,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#f0f4f8";
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1a5f9e",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: "#0d1b2a", margin: 0, fontSize: "0.875rem" }}>{a.title}</p>
                      <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>{a.source}</p>
                    </div>
                    <span style={{ color: "#c8d3de", fontSize: "0.8rem" }}>→</span>
                  </div>
                </a>
              ))}
            </div>
          </SectionCard>

          {/* Yoga */}
          <SectionCard title="Yoga Sessions" emoji="🧘" accent="#7c3aed">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {yogaVideos.map((id) => (
                <div key={id} style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                  <iframe
                    style={{ width: "100%", aspectRatio: "16/9", display: "block", border: "none" }}
                    src={`https://www.youtube.com/embed/${id}`}
                    title="Yoga Video"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Self Care */}
          <SectionCard title="Self Care" emoji="🌿" accent="#b45309">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {wellnessVideos.map((id) => (
                <div key={id} style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                  <iframe
                    style={{ width: "100%", aspectRatio: "16/9", display: "block", border: "none" }}
                    src={`https://www.youtube.com/embed/${id}`}
                    title="Wellness Video"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Tip banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 32,
            background: "linear-gradient(135deg, #0d1b2a, #0a3d35)",
            borderRadius: 20,
            padding: "2.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(10,126,110,0.15)", filter: "blur(30px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Daily Tip</p>
            <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              Consistency is the key to health.
            </h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", margin: 0 }}>
              Just 20 minutes of movement a day improves mood, sleep, and cardiovascular health.
            </p>
          </div>
          <a href="/symptom" style={{ textDecoration: "none", position: "relative" }}>
            <button
              style={{
                padding: "11px 24px",
                borderRadius: 12,
                background: "white",
                color: "#0a7e6e",
                fontWeight: 700,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              Start Tracking →
            </button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}