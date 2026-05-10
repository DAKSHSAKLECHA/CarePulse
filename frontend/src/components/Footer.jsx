// components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0d1b2a",
        color: "#94a3b8",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top section */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "4rem 1.5rem 2.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
        }}
      >
        {/* Brand */}
        <div style={{ gridColumn: "span 1" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 900,
                fontSize: "1.1rem",
              }}
            >
              C
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "white" }}>
              Care<span style={{ color: "#0d9488" }}>Pulse</span>
            </span>
          </Link>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 260, color: "#64748b" }}>
            Empowering your health journey with intelligent tools, expert connections, and AI-driven care.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {["twitter", "linkedin", "facebook", "instagram"].map((s) => (
              <a
                key={s}
                href={`https://www.${s}.com`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(13,148,136,0.2)";
                  e.currentTarget.style.color = "#0d9488";
                  e.currentTarget.style.borderColor = "rgba(13,148,136,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                {s[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Links columns */}
        {[
          {
            title: "Platform",
            links: [
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: "Find Doctors", path: "/doctors-list" },
              { name: "Wellness Hub", path: "/activities" },
            ],
          },
          {
            title: "Patient Tools",
            links: [
              { name: "Symptom Tracker", path: "/symptom" },
              { name: "My Appointments", path: "/my-appointments" },
              { name: "Medical Records", path: "/docUpload" },
              { name: "AI Chatbot", path: "/chatbot" },
            ],
          },
          {
            title: "Company",
            links: [
              { name: "About", path: "#" },
              { name: "Privacy Policy", path: "#" },
              { name: "Terms of Service", path: "#" },
              { name: "Contact", path: "#" },
            ],
          },
        ].map((col, i) => (
          <div key={i}>
            <h4
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {col.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.links.map((link, j) => (
                <Link
                  key={j}
                  to={link.path}
                  style={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.2s",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#0d9488")}
                  onMouseLeave={(e) => (e.target.style.color = "#64748b")}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      />

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "#475569" }}>
          © 2025 CarePulse. All rights reserved.
        </p>
        <p style={{ fontSize: "0.8rem", color: "#475569" }}>
          Built with care for your health.{" "}
          <span
            style={{
              color: "#0d9488",
              fontWeight: 700,
            }}
          >
            ❤️
          </span>
        </p>
      </div>
    </footer>
  );
}