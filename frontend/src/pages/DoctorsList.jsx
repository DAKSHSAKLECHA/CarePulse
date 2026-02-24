import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/appointments/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Could not load doctors."))
      .finally(() => setLoading(false));
  }, []);

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

  const PLACEHOLDER_IMAGES = [
    "https://t3.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnXVg5.jpg",
    "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
    "https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2xHNxmJDicSEdb7zV0y6kWxQ.jpg",
    "https://t3.ftcdn.net/jpg/01/51/85/33/360_F_151853310_S2Kj8lD08m5e7z2q07w7F7.jpg",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Specialists</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Connect with top-rated medical professionals for expert advice.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No doctors registered yet. Doctors can sign up from the Login page.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className="text-white text-xs font-semibold bg-teal-600 px-2 py-1 rounded">
                      {doctor.specialization}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">Dr. {doctor.name}</h3>
                  <p className="text-slate-500 text-sm mb-3">
                    {doctor.experience} yrs experience
                  </p>
                  <button
                    onClick={() => setBookingDoctor(doctor)}
                    className="w-full bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setBookingDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-1">Book Appointment</h3>
              <p className="text-slate-500 text-sm mb-5">
                Dr. {bookingDoctor.name} — {bookingDoctor.specialization}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
                  <textarea
                    rows={2}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Describe your symptoms or reason..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setBookingDoctor(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorsList;
