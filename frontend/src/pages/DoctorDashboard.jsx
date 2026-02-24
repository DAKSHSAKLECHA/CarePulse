import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, todayCount: 0, pending: 0, uniquePatients: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, patRes, statsRes] = await Promise.all([
        axios.get("/api/appointments/doctor/all", { headers }),
        axios.get("/api/appointments/doctor/patients", { headers }),
        axios.get("/api/appointments/doctor/stats", { headers }),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load data. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (apptId, status) => {
    setUpdatingId(apptId);
    try {
      await axios.put(`/api/appointments/doctor/update/${apptId}`, { status, notes }, { headers });
      toast.success(`Appointment marked as ${status}`);
      setSelectedAppt(null);
      fetchData();
    } catch {
      toast.error("Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-3xl p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Doctor Panel</p>
            <h1 className="text-3xl font-bold">Welcome, Dr. {user.name || "Doctor"}</h1>
            {user.specialization && <p className="text-indigo-200 mt-1">{user.specialization} • {user.experience} yrs exp</p>}
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition border border-white/20">
            Logout
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Appointments", value: stats.total },
            { label: "Today's Appointments", value: stats.todayCount },
            { label: "Pending", value: stats.pending },
            { label: "Unique Patients", value: stats.uniquePatients },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-indigo-600">{loading ? "..." : s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: "appointments", label: "Appointments", icon: "📅" },
            { key: "patients", label: "My Patients", icon: "🧑‍⚕️" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : (
          <>
            {/* Appointments Tab */}
            {tab === "appointments" && (
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
                    No appointments yet. Patients will book appointments from the Doctors List page.
                  </div>
                ) : appointments.map((appt, i) => (
                  <motion.div key={appt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {appt.patient?.name?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{appt.patient?.name || "Unknown Patient"}</p>
                            <p className="text-slate-400 text-xs">{appt.patient?.email} • Age: {appt.patient?.age} • {appt.patient?.gender}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                          <span>📅 {appt.date}</span>
                          <span>🕐 {appt.time}</span>
                          {appt.reason && <span>📝 {appt.reason}</span>}
                        </div>
                        {appt.notes && <p className="mt-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">Doctor Notes: {appt.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[appt.status]}`}>
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                        {appt.status !== "completed" && appt.status !== "cancelled" && (
                          <button onClick={() => { setSelectedAppt(appt); setNotes(appt.notes || ""); }}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition">
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Patients Tab */}
            {tab === "patients" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.length === 0 ? (
                  <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
                    No patients yet.
                  </div>
                ) : patients.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                        {p.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-slate-400 text-xs">{p.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Age:</span> {p.age}</p>
                      <p><span className="font-medium">Gender:</span> {p.gender}</p>
                      <p><span className="font-medium">Last Visit:</span> {p.lastVisit || "—"}</p>
                      {p.lastReason && <p><span className="font-medium">Reason:</span> {p.lastReason}</p>}
                    </div>
                    <span className={`mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.appointmentStatus] || "bg-slate-100 text-slate-600"}`}>
                      {p.appointmentStatus}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Update Appointment Modal */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAppt(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Update Appointment</h3>
              <p className="text-slate-400 text-sm mb-4">Patient: {selectedAppt.patient?.name}</p>

              <label className="block text-sm font-medium text-slate-700 mb-1">Add Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Diagnosis, prescriptions, follow-up..."
              />

              <p className="text-sm font-medium text-slate-700 mb-2">Change Status</p>
              <div className="flex flex-wrap gap-2">
                {["confirmed", "completed", "cancelled"].map((s) => (
                  <button key={s} disabled={updatingId === selectedAppt._id}
                    onClick={() => handleStatusUpdate(selectedAppt._id, s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${STATUS_COLORS[s]} hover:opacity-80 disabled:opacity-50`}>
                    {updatingId === selectedAppt._id ? "..." : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <button onClick={() => setSelectedAppt(null)} className="mt-4 w-full py-2 text-slate-500 text-sm hover:text-slate-700">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
