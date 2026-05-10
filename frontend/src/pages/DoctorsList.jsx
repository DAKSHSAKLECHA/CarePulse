import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import AITriage from "../components/AITriage";

const getDoctorImage = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0a7e6e,0d1b2a,4f46e5&fontSize=40&fontWeight=600`;

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "0.875rem",
  color: "#0d1b2a",
  outline: "none",
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const TEAL = "#0a7e6e";
const NAVY = "#0d1b2a";

export default function DoctorsList() {
  const [doctors,       setDoctors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState(null); // which doctor card is open
  const [triageDoctor,  setTriageDoctor]  = useState(null); // doctor going through triage
  const [triageDone,    setTriageDone]    = useState(false); // triage completed flag
  const [form,          setForm]          = useState({ date: "", time: "", reason: "" });
  const [submitting,    setSubmitting]    = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/appointments/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Could not load doctors."))
      .finally(() => setLoading(false));
  }, []);

  // Called when user clicks "Book" on a doctor card
  // Shows AITriage first, then opens booking modal after triage
  const startBooking = (doctor) => {
    setTriageDoctor(doctor);  // open triage for this doctor
    setTriageDone(false);
    setForm({ date: "", time: "", reason: "" });
  };

  // Called by AITriage onTriageComplete — opens the booking modal
  const handleTriageComplete = (result) => {
    if (result.shouldBook) {
      setBookingDoctor(triageDoctor); // move doctor to booking modal
      setTriageDoctor(null);          // close triage panel
    }
  };

  // Called by AITriage onSkip — skip triage and go straight to booking
  const handleTriageSkip = () => {
    setBookingDoctor(triageDoctor);
    setTriageDoctor(null);
  };

  const handleBook = async () => {
    if (!form.date || !form.time) return toast.error("Please select date and time.");
    setSubmitting(true);
    try {
      await axios.post(
        "/api/appointments/book",
        { doctorId: bookingDoctor._id, ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment booked with Dr. ${bookingDoctor.name}!`);
      setBookingDoctor(null);
      setForm({ date: "", time: "", reason: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 60%, #eef4fb 100%)",
      fontFamily: FF,
      paddingTop: "6rem",
      paddingBottom: "4rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <div style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: 99,
            background: "rgba(10,126,110,0.07)",
            color: TEAL,
            fontWeight: 600,
            fontSize: "0.78rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "1rem",
            border: "1px solid rgba(10,126,110,0.12)",
          }}>
            Medical Professionals
          </div>
          <h1 style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 800,
            color: NAVY,
            letterSpacing: "-0.03em",
            margin: "0 0 0.75rem",
          }}>
            Meet Our Specialists
          </h1>
          <p style={{ color: "#64748b", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
            Connect with board-certified medical professionals for expert care and consultations.
          </p>
        </motion.div>

        {/* Doctor Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${TEAL}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading doctors...
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>
            No doctors registered yet.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {doctors.map((doctor, i) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.1)" }}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid #e8edf2",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  transition: "all 0.28s ease",
                }}
              >
                {/* Avatar */}
                <div style={{
                  height: 180,
                  background: "linear-gradient(135deg, #0d1b2a, #0a3d35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: -30, right: -30,
                    width: 120, height: 120, borderRadius: "50%",
                    background: "rgba(10,126,110,0.2)", filter: "blur(20px)",
                  }} />
                  <div style={{
                    width: 90, height: 90, borderRadius: 24, overflow: "hidden",
                    border: "3px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)", position: "relative",
                  }}>
                    <img src={getDoctorImage(doctor.name)} alt={doctor.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{
                    position: "absolute", bottom: 12, left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(10,126,110,0.85)", borderRadius: 99,
                    padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700,
                    color: "white", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap",
                  }}>
                    {doctor.specialization}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "1.2rem 1.4rem 1.4rem" }}>
                  <h3 style={{ fontWeight: 800, color: NAVY, margin: "0 0 3px", fontSize: "1rem", letterSpacing: "-0.01em" }}>
                    Dr. {doctor.name}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 14px" }}>
                    {doctor.experience} years experience
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: "#f59e0b", fontSize: "0.75rem" }}>★</span>
                    ))}
                    <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: 4, fontWeight: 600 }}>5.0</span>
                  </div>

                  {/* ── Book button — triggers AITriage first ── */}
                  <button
                    onClick={() => startBooking(doctor)}
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${TEAL}, #0d9488)`,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: FF,
                      boxShadow: `0 6px 18px rgba(10,126,110,0.25)`,
                      transition: "opacity 0.2s",
                    }}
                  >
                    Book Appointment →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── AITriage Modal ── */}
      {/* Shows BEFORE booking modal — runs the 5-question triage */}
      <AnimatePresence>
        {triageDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTriageDoctor(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 24,
                padding: "2rem",
                maxWidth: 500,
                width: "100%",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Triage header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div>
                  <p style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "0.95rem" }}>
                    Before booking with Dr. {triageDoctor.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "2px 0 0" }}>
                    Quick AI health check — takes 30 seconds
                  </p>
                </div>
                <button
                  onClick={() => setTriageDoctor(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* AITriage component */}
              <AITriage
                onTriageComplete={handleTriageComplete}
                onSkip={handleTriageSkip}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Booking Modal ── */}
      {/* Shows AFTER triage is complete */}
      <AnimatePresence>
        {bookingDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookingDoctor(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 24,
                padding: "2.2rem",
                maxWidth: 440,
                width: "100%",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              }}
            >
              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", border: "2px solid #e8edf2", flexShrink: 0 }}>
                  <img src={getDoctorImage(bookingDoctor.name)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: NAVY, margin: 0, fontSize: "1.15rem" }}>Book Appointment</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>with Dr. {bookingDoctor.name}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                    Preferred Date
                  </label>
                  <input type="date" min={new Date().toISOString().split("T")[0]}
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                    Preferred Time
                  </label>
                  <input type="time" value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                    Visit Reason (optional)
                  </label>
                  <textarea rows={2} value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    placeholder="Briefly describe your concern..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setBookingDoctor(null)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: FF }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={submitting}
                  style={{ flex: 2, padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, color: "white", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontFamily: FF, boxShadow: `0 6px 20px rgba(10,126,110,0.3)`, opacity: submitting ? 0.7 : 1, transition: "opacity 0.2s" }}
                >
                  {submitting ? "Booking..." : "Confirm Appointment ✓"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}