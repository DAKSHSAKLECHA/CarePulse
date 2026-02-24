import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Appointments</h1>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400">
            No appointments yet. Book one from the <a href="/doctors-list" className="text-teal-600 font-medium underline">Doctors List</a>.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt, i) => (
              <motion.div key={appt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">Dr. {appt.doctor?.name}</p>
                    <p className="text-slate-400 text-sm">{appt.doctor?.specialization} • {appt.doctor?.experience} yrs exp</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                      <span>📅 {appt.date}</span>
                      <span>🕐 {appt.time}</span>
                      {appt.reason && <span>📝 {appt.reason}</span>}
                    </div>
                    {appt.notes && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm text-blue-700">
                        <span className="font-semibold">Doctor's Notes: </span>{appt.notes}
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[appt.status]}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
