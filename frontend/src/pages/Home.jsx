// pages/Home.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left pt-10 md:pt-0"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm">
            ✨ Your Health, Our Priority
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
            Healthcare <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-400">
              Reimagined.
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Experience the future of medical care. Consult top doctors, track symptoms, and manage your health records—all in one secure place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/symptom">
              <button className="px-8 py-4 rounded-full bg-teal-600 text-white font-semibold shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-1 transition-all w-full sm:w-auto">
                Start Tracking
              </button>
            </Link>
            <Link to="/chatbot">
              <button className="px-8 py-4 rounded-full bg-white text-teal-700 border border-teal-100 font-semibold shadow-sm hover:bg-teal-50 hover:border-teal-200 transition-all w-full sm:w-auto">
                Chat with AI
              </button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center md:justify-start gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
             {/* Simple visual trust indicators */}
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium">Verified Doctors</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">AI Support</span>
             </div>
          </div>
        </motion.div>

        {/* Hero Image / Illustration */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative mt-12 md:mt-0"
        >
          {/* Abstract blobs for background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          
          <img 
            src="https://img.freepik.com/free-vector/online-doctor-concept_23-2148541928.jpg" 
            alt="Telemedicine" 
            className="relative z-10 w-full rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
          />
        </motion.div>
      </div>
    </div>
  );
}