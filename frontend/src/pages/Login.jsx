import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ✅ FIXED — use relative /api paths (no baseUrl needed, Vite proxy handles it)
const inputStyle = (accent) => ({
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "0.9rem",
  color: "#0d1b2a",
  outline: "none",
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
});

function Input({ type, name, placeholder, value, onChange, required, accent }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(accent),
        borderColor: focused ? accent : "#e2e8f0",
        boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
      }}
    />
  );
}

export default function AuthPage() {
  const [role, setRole] = useState("patient");
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", age: "", gender: "", specialization: "", experience: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isDoctor = role === "doctor";
  const accent = isDoctor ? "#4f46e5" : "#0a7e6e";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setIsLogin(true);
    setError("");
    setFormData({ name: "", email: "", password: "", age: "", gender: "", specialization: "", experience: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ FIXED — relative URLs, no baseUrl, Vite proxy forwards to localhost:5000
    const url = role === "patient"
      ? (isLogin ? `/api/auth/login` : `/api/auth/register`)
      : (isLogin ? `/api/doctor/login` : `/api/doctor/register`);

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,   // ✅ always sent, enum: ["male","female","other"]
          ...(role === "patient"
            ? { age: formData.age }
            : { specialization: formData.specialization, experience: formData.experience }
          ),
        };

    try {
      const res  = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      if (data.token) {
        localStorage.setItem("token",     data.token);
        localStorage.setItem("user",      JSON.stringify(data.user));
        localStorage.setItem("role",      data.user.role);
        if (data.user.role === "patient") {
          localStorage.setItem("patientId", JSON.stringify(data.user.id));
        }
        toast.success(isLogin ? "Welcome back!" : "Account created!");
        navigate(data.user.role === "doctor" ? "/doctor/dashboard" : "/");
      } else {
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1rem 2rem", background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 50%, #eef4fb 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", position: "relative" }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", top: "5%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,126,110,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "5%", left: "-10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Role Switcher */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "white", borderRadius: 16, padding: 5, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #e8edf2", marginBottom: 20 }}>
          {[
            { key: "patient", label: "Patient", emoji: "🧑‍⚕️", accent: "#0a7e6e" },
            { key: "doctor",  label: "Doctor",  emoji: "👨‍⚕️", accent: "#4f46e5" },
          ].map((r) => (
            <button key={r.key} onClick={() => handleRoleSwitch(r.key)}
              style={{ padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: "0.9rem", transition: "all 0.25s ease", background: role === r.key ? `linear-gradient(135deg, ${r.accent}ee, ${r.accent})` : "transparent", color: role === r.key ? "white" : "#64748b", boxShadow: role === r.key ? `0 4px 14px ${r.accent}30` : "none", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
              <span style={{ fontSize: "1.1rem" }}>{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={role + isLogin} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
            style={{ background: "white", borderRadius: 20, padding: "2.2rem", boxShadow: "0 8px 40px rgba(0,0,0,0.09)", border: "1px solid #e8edf2" }}>

            {/* Header */}
            <div style={{ marginBottom: "1.8rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: isDoctor ? "rgba(79,70,229,0.08)" : "rgba(10,126,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: 14, border: `1px solid ${accent}18` }}>
                {isDoctor ? "👨‍⚕️" : "🧑‍⚕️"}
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.02em", margin: 0 }}>
                {isLogin ? "Welcome back" : isDoctor ? "Join as Doctor" : "Create Account"}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 4 }}>
                {isDoctor ? "Manage your patients and practice." : "Access your health dashboard."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fff1f2", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 10, padding: "10px 14px", color: "#e11d48", fontSize: "0.85rem", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!isLogin && (
                <>
                  <Input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required accent={accent} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {role === "patient" ? (
                      <Input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required accent={accent} />
                    ) : (
                      <Input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required accent={accent} />
                    )}

                    {/* ✅ FIXED gender select — values are lowercase to match mongoose enum */}
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle(accent),
                        borderColor: formData.gender ? accent : "#e2e8f0",
                        boxShadow: formData.gender ? `0 0 0 3px ${accent}18` : "none",
                        color: formData.gender ? "#0d1b2a" : "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {role === "doctor" && (
                    <Input type="number" name="experience" placeholder="Experience (years)" value={formData.experience} onChange={handleChange} required accent={accent} />
                  )}
                </>
              )}

              <Input type="email"    name="email"    placeholder="Email address" value={formData.email}    onChange={handleChange} required accent={accent} />
              <Input type="password" name="password" placeholder="Password"      value={formData.password} onChange={handleChange} required accent={accent} />

              <button type="submit"
                style={{ marginTop: 4, padding: "13px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${accent}ee, ${accent})`, color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: `0 6px 20px ${accent}30`, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: "opacity 0.2s", letterSpacing: "0.01em" }}
                onMouseEnter={e => (e.target.style.opacity = 0.9)}
                onMouseLeave={e => (e.target.style.opacity = 1)}>
                {isLogin ? "Sign In" : "Create Account"} →
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#64748b" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setIsLogin(!isLogin); setError(""); }}
                style={{ background: "none", border: "none", color: accent, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 0 }}>
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}