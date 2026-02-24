import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const floatingCards = [
  {
    icon: "🩺",
    title: "Live Consultation",
    sub: "Connect with doctors instantly",
    color: "bg-white",
    delay: 0,
  },
  {
    icon: "📊",
    title: "Symptom Analysis",
    sub: "AI-powered health insights",
    color: "bg-teal-50",
    delay: 0.3,
  },
  {
    icon: "💊",
    title: "Prescription Ready",
    sub: "Digital records secured",
    color: "bg-blue-50",
    delay: 0.6,
  },
];

const stats = [
  { value: "10K+", label: "Patients" },
  { value: "500+", label: "Doctors" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

const pulseRings = [120, 160, 200];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const features = ["Track Symptoms", "Consult Doctors", "AI Chatbot", "Health Records"];

  useEffect(() => {
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % features.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/20 pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center gap-12 py-10">

          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 border border-teal-200 text-teal-700 font-semibold text-sm mb-6"
            >
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              Your Health, Our Priority
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-slate-900 leading-tight mb-4">
              Healthcare{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400">
                Reimagined.
              </span>
            </h1>

            {/* Rotating feature pill */}
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <span className="text-slate-400 text-sm font-medium">Powered by AI for</span>
              <motion.span
                key={activeFeature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-3 py-1 rounded-full bg-teal-600 text-white text-sm font-semibold"
              >
                {features[activeFeature]}
              </motion.span>
            </div>

            <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Experience the future of medical care. Consult top doctors, track
              symptoms, and manage your health records — all in one secure place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/symptom">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:shadow-xl transition-all w-full sm:w-auto text-base"
                >
                  🩺 Start Tracking
                </motion.button>
              </Link>
              <Link to="/chatbot">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full bg-white text-teal-700 border-2 border-teal-100 font-bold shadow-sm hover:bg-teal-50 hover:border-teal-300 transition-all w-full sm:w-auto text-base"
                >
                  🤖 Chat with AI
                </motion.button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto lg:mx-0">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-xl font-black text-teal-600">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Animated Visual */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative flex items-center justify-center min-h-[500px]"
          >
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-10 left-10 w-56 h-56 bg-cyan-300/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"
              />
            </div>

            {/* Central Doctor Avatar Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              {/* Pulse rings */}
              {pulseRings.map((size, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                  style={{ width: size, height: size }}
                  className="absolute inset-0 m-auto rounded-full border-2 border-teal-400/40"
                />
              ))}

              {/* Main circle with doctor icon */}
              <div className="w-52 h-52 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-teal-300 relative z-10">
                <div className="text-center">
                  <div className="text-7xl mb-1">👨‍⚕️</div>
                  <div className="text-white font-bold text-sm">Dr. CarePulse</div>
                  <div className="text-teal-200 text-xs">Online Now</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs font-semibold">Available</span>
                  </div>
                </div>
              </div>

              {/* Orbiting icons */}
              {[
                { icon: "🧬", label: "DNA", angle: 0, radius: 130, color: "bg-purple-100" },
                { icon: "💓", label: "Heart", angle: 72, radius: 130, color: "bg-red-100" },
                { icon: "🧠", label: "Brain", angle: 144, radius: 130, color: "bg-yellow-100" },
                { icon: "💉", label: "Vaccine", angle: 216, radius: 130, color: "bg-blue-100" },
                { icon: "🔬", label: "Lab", angle: 288, radius: 130, color: "bg-green-100" },
              ].map((item, i) => {
                const rad = (item.angle * Math.PI) / 180;
                const x = Math.cos(rad) * item.radius;
                const y = Math.sin(rad) * item.radius;
                return (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    style={{ position: "absolute", left: "50%", top: "50%" }}
                    className="pointer-events-none"
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
                      className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center shadow-md text-lg`}
                    >
                      {item.icon}
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Floating Cards */}
            {floatingCards.map((card, i) => {
              const positions = [
                "absolute top-6 right-0 lg:-right-8",
                "absolute bottom-20 right-0 lg:-right-4",
                "absolute top-1/3 left-0 lg:-left-4",
              ];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.8 + card.delay },
                    scale: { delay: 0.8 + card.delay },
                    y: { duration: 3.5 + i, repeat: Infinity, ease: "easeInOut", delay: card.delay },
                  }}
                  className={`${positions[i]} z-20 ${card.color} rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-100 w-52`}
                >
                  <div className="text-2xl">{card.icon}</div>
                  <div>
                    <div className="text-slate-800 font-bold text-sm">{card.title}</div>
                    <div className="text-slate-400 text-xs">{card.sub}</div>
                  </div>
                </motion.div>
              );
            })}

            {/* Live heartbeat bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 border border-slate-100 z-20 w-64"
            >
              <div className="flex items-center gap-0.5">
                {[2, 4, 8, 5, 10, 3, 7, 4, 9, 2, 6, 3].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.07 }}
                    style={{ height: h * 3 }}
                    className="w-1 bg-teal-500 rounded-full origin-center"
                  />
                ))}
              </div>
              <div>
                <div className="text-slate-800 font-bold text-sm">72 BPM</div>
                <div className="text-slate-400 text-xs">Heart Rate Normal</div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-16"
        >
          {[
            { icon: "🩺", title: "Doctor Consultation", desc: "Book & meet verified doctors" },
            { icon: "📈", title: "Symptom Tracker", desc: "Log & monitor daily health" },
            { icon: "🤖", title: "AI Chatbot", desc: "24/7 AI health assistant" },
            { icon: "📋", title: "Health Records", desc: "Secure digital records" },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-teal-100 transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-slate-800 text-sm mb-1">{f.title}</div>
              <div className="text-slate-400 text-xs">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
