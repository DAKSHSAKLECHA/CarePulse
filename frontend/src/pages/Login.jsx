import { useRef, useState } from "react";
import { LoaderCircle, UserRound, Stethoscope } from "lucide-react";
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
  fontFamily: "'Segoe UI', Arial, sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
});

function Input({ type, name, placeholder, value, onChange, required, accent, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      aria-label={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
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
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const isDoctor = role === "doctor";
  const accent = isDoctor ? "#4f46e5" : "#0a7e6e";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleSwitch = (newRole) => {
    if (submittingRef.current) return;
    setRole(newRole);
    setIsLogin(true);
    setError("");
    setFormData({ name: "", email: "", password: "", age: "", gender: "", specialization: "", experience: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
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
        signal: AbortSignal.timeout(60000),
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
        navigate(data.user.role === "doctor" ? "/doctor/dashboard" : "/dashboard");
      } else {
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      const message = err.name === "TimeoutError" || err.name === "AbortError"
        ? (isLogin ? "The server is taking too long. Please try signing in again." : "The request timed out. Your account may have been created; try signing in before registering again.")
        : err.message === "Failed to fetch" ? "Could not reach the server. Check your connection and try again." : err.message;
      setError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1rem 2rem", background: "#f7f9fa", fontFamily: "'Segoe UI', Arial, sans-serif", position: "relative" }}>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Role Switcher */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "white", borderRadius: 16, padding: 5, boxShadow: "none", border: "1px solid #e8edf2", marginBottom: 20 }}>
          {[
            { key: "patient", label: "Patient", icon: UserRound, accent: "#0a7e6e" },
            { key: "doctor",  label: "Doctor",  icon: Stethoscope, accent: "#4f46e5" },
          ].map((r) => (
            <button key={r.key} disabled={submitting} onClick={() => handleRoleSwitch(r.key)}
              style={{ padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: "0.9rem", transition: "all 0.25s ease", background: role === r.key ? r.accent : "transparent", color: role === r.key ? "white" : "#64748b", boxShadow: role === r.key ? `0 4px 14px ${r.accent}30` : "none", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              <span style={{ fontSize: "1.1rem" }}><r.icon size={18}/></span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={role + isLogin} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
            style={{ background: "white", borderRadius: 12, padding: "2.2rem", boxShadow: "none", border: "1px solid #e8edf2" }}>

            {/* Header */}
            <div style={{ marginBottom: "1.8rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: isDoctor ? "rgba(79,70,229,0.08)" : "rgba(10,126,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: 14, border: `1px solid ${accent}18` }}>
                {isDoctor ? <Stethoscope size={24} color={accent}/> : <UserRound size={24} color={accent}/>}
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.02em", margin: 0 }}>
                {isLogin ? "Welcome back" : isDoctor ? "Create a doctor account" : "Create Account"}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 4 }}>
                {isDoctor ? "Review appointments and patient records." : "Manage appointments, symptoms and documents."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fff1f2", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 10, padding: "10px 14px", color: "#e11d48", fontSize: "0.85rem", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form aria-busy={submitting} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!isLogin && (
                <>
                  <Input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required disabled={submitting} accent={accent} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {role === "patient" ? (
                      <Input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required disabled={submitting} accent={accent} />
                    ) : (
                      <Input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required disabled={submitting} accent={accent} />
                    )}

                    {/* ✅ FIXED gender select — values are lowercase to match mongoose enum */}
                    <select
                      name="gender"
                      aria-label="Gender"
                      disabled={submitting}
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
                    <Input type="number" name="experience" placeholder="Experience (years)" value={formData.experience} onChange={handleChange} required disabled={submitting} accent={accent} />
                  )}
                </>
              )}

              <Input type="email"    name="email"    placeholder="Email address" value={formData.email}    onChange={handleChange} required disabled={submitting} accent={accent} />
              <Input type="password" name="password" placeholder="Password"      value={formData.password} onChange={handleChange} required disabled={submitting} accent={accent} />

              <button type="submit" disabled={submitting}
                style={{ opacity: submitting ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, padding: "13px 20px", borderRadius: 12, border: "none", background: `${accent}ee`, color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "none", fontFamily: "'Segoe UI', Arial, sans-serif", transition: "opacity 0.2s", letterSpacing: "0.01em" }}
                >
                {submitting ? <><motion.span aria-hidden="true" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-flex" }}><LoaderCircle size={18}/></motion.span>{isLogin ? "Signing in…" : "Creating account…"}</> : <>{isLogin ? "Sign In" : "Create Account"} →</>}
              </button>
              {submitting && <p role="status" style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>Please wait while we process your request.</p>}
            </form>

            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#64748b" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button disabled={submitting} onClick={() => { if (submittingRef.current) return; setIsLogin(!isLogin); setError(""); }}
                style={{ background: "none", border: "none", color: accent, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Segoe UI', Arial, sans-serif", padding: 0 }}>
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}