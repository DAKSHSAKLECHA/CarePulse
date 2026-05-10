import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setIsAuthenticated(!!token);
    setRole(storedRole);
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("patientId");
    setIsAuthenticated(false);
    setRole(null);
    navigate("/login");
  };

  const patientLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Find Doctor", path: "/doctors-list" },
    { name: "Appointments", path: "/my-appointments" },
    { name: "Symptoms", path: "/symptom" },
    { name: "Documents", path: "/docUpload" },
  ];

  const doctorLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/doctor/dashboard" },
    { name: "Services", path: "/services" },
  ];

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Activities", path: "/activities" },
  ];

  const navLinks = !isAuthenticated
    ? publicLinks
    : role === "doctor"
    ? doctorLinks
    : patientLinks;

  const isDoctor = role === "doctor";
  const accent = isDoctor ? "#4f46e5" : "#0a7e6e";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          transition: "all 0.3s ease",
          background: scrolled
            ? "rgba(255,255,255,0.92)"
            : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
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
                boxShadow: "0 4px 12px rgba(10,126,110,0.3)",
              }}
            >
              C
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.25rem",
                letterSpacing: "-0.02em",
                color: "#0d1b2a",
              }}
            >
              Care<span style={{ color: "#0a7e6e" }}>Pulse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: "0.25rem" }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                style={({ isActive }) => ({
                  padding: "6px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: isActive ? accent : "#4a6070",
                  background: isActive ? `${accent}10` : "transparent",
                  transition: "all 0.2s ease",
                })}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
            {isAuthenticated && role && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: isDoctor ? "rgba(79,70,229,0.08)" : "rgba(10,126,110,0.08)",
                  color: isDoctor ? "#4f46e5" : "#0a7e6e",
                  border: `1px solid ${isDoctor ? "rgba(79,70,229,0.15)" : "rgba(10,126,110,0.15)"}`,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {role === "doctor" ? "👨‍⚕️ Doctor" : "🧑‍⚕️ Patient"}
              </span>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "#fff1f2",
                  color: "#e11d48",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  border: "1px solid rgba(225,29,72,0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#ffe4e6")}
                onMouseLeave={(e) => (e.target.style.background = "#fff1f2")}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "9px 22px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(10,126,110,0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              color: "#0d1b2a",
              fontSize: "1.4rem",
              lineHeight: 1,
            }}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: "fixed",
              top: 70,
              left: 0,
              right: 0,
              zIndex: 999,
              background: "white",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
          >
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  style={({ isActive }) => ({
                    padding: "11px 16px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: isActive ? accent : "#4a6070",
                    background: isActive ? `${accent}10` : "transparent",
                    transition: "all 0.2s",
                  })}
                >
                  {link.name}
                </NavLink>
              ))}

              <div style={{ borderTop: "1px solid #f0f4f8", marginTop: 8, paddingTop: 12 }}>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      borderRadius: 10,
                      background: "#fff1f2",
                      color: "#e11d48",
                      fontWeight: 700,
                      fontSize: "1rem",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} style={{ textDecoration: "none", display: "block" }}>
                    <button
                      style={{
                        width: "100%",
                        padding: "11px 16px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}