// pages/SymptomTracker.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function SymptomTracker() {
  const [formData, setFormData] = useState({
    mood: "",
    symptoms: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [entries, setEntries] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const navigate = useNavigate();

  const moodData = {
    Happy: { suggestion: "Keep up the positive energy! 🌟", video: "https://www.youtube.com/watch?v=l9v9z8p2k-s" },
    Sad: { suggestion: "It's okay to feel down. Try a short walk. 💙", video: "https://youtu.be/BloutcYWbJg?si=xEcLBzEYiFmfahhB" },
    Anxious: { suggestion: "Deep breaths. Focus on the present. 🧘", video: "https://youtu.be/WWloIAQpMcQ?si=6zHFzjoSPRMpPZGP" },
    Angry: { suggestion: "Channel that energy into exercise. 🏃", video: "https://youtu.be/tV2Ecd7m6Tc?si=5EaNjM1d1Iu9zjD2" },
    Neutral: { suggestion: "A balanced day is a good day. ⚖️", video: "https://www.youtube.com/watch?v=VSHXYKhnA8E" },
  };

  useEffect(() => {
    let storedPatientId = localStorage.getItem("patientId");
    if (!storedPatientId) {
      alert("Please log in again.");
      navigate("/login");
      return;
    }
    storedPatientId = storedPatientId.replace(/^"|"$/g, "");
    setPatientId(storedPatientId);
    fetchSymptoms(storedPatientId);
  }, [navigate]);

  const fetchSymptoms = async (pid) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/symptoms/patient/${pid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const getAISuggestion = async (mood, symptoms) => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) return moodData[mood]?.suggestion || "Take care of yourself!";

        const prompt = `Patient mood: ${mood}. Symptoms: ${symptoms}. Give a short 1-2 sentence health tip or suggestion. Be empathetic and practical.`;
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          { contents: [{ parts: [{ text: prompt }] }] }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || moodData[mood]?.suggestion;
      } catch {
        return moodData[mood]?.suggestion || "Take care of yourself!";
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.mood || !formData.symptoms) return alert("Mood and symptoms required");

      try {
        const token = localStorage.getItem("token");
        const aiSuggestion = await getAISuggestion(formData.mood, formData.symptoms);
        const res = await axios.post(`/api/symptoms/add`, 
          { ...formData, patient: patientId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const newEntry = {
          ...res.data,
          moodSuggestion: aiSuggestion,
          moodVideo: moodData[formData.mood]?.video
        };
        setEntries([newEntry, ...entries]);
        setFormData({ ...formData, symptoms: "", notes: "" });
        alert("Entry logged!");
      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Health Journal</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Log Today's Health</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mood</label>
                  <select
                    name="mood"
                    value={formData.mood}
                    onChange={(e) => setFormData({...formData, mood: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">How do you feel?</option>
                    {Object.keys(moodData).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Symptoms</label>
                  <input
                    type="text"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    placeholder="e.g., Headache, Nausea"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any extra details..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                  />
                </div>
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md">
                  Save Entry
                </button>
              </form>
            </div>
          </div>

          {/* History List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Entries</h2>
            {entries.length === 0 ? (
              <p className="text-slate-500 text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                No entries found. Start logging your health!
              </p>
            ) : (
              entries.map((entry, idx) => {
                const moodInfo = moodData[entry.mood] || {};
                return (
                  <motion.div 
                    key={entry._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-400">{entry.date}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        entry.mood === 'Happy' ? 'bg-amber-100 text-amber-700' : 
                        entry.mood === 'Sad' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {entry.mood}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{entry.symptoms}</h3>
                    {entry.notes && <p className="text-slate-600 mb-4">{entry.notes}</p>}
                    
                    {/* Suggestion Box */}
                    <div className="bg-teal-50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                      <p className="text-sm text-teal-800 font-medium">💡 {moodInfo.suggestion || entry.moodSuggestion}</p>
                      {(moodInfo.video || entry.moodVideo) && (
                        <a 
                          href={moodInfo.video || entry.moodVideo} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs bg-white text-teal-600 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-600 hover:text-white transition-colors"
                        >
                          Watch Video
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}