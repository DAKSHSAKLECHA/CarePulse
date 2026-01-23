// pages/Activities.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Activities() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Wellness Hub</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Curated resources to keep your mind and body in perfect harmony.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Articles Column */}
          <motion.div 
            whileHover={{ y: -5 }} 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
          >
            <h2 className="text-2xl font-bold text-teal-700 mb-6 flex items-center gap-2">
              📚 Read
            </h2>
            <ul className="space-y-4">
              {[
                { title: "Emotional Wellness Toolkit", link: "https://www.nih.gov/health-information/emotional-wellness-toolkit" },
                { title: "Understanding Mental Health", link: "https://www.nimh.nih.gov/health/statistics/mental-illness" },
                { title: "Nature & Wellbeing", link: "https://www.nature.com/articles/d41586-021-02690-5" },
                { title: "The Art of Healthy Living", link: "https://artofhealthyliving.com/" }
              ].map((article, i) => (
                <li key={i}>
                  <a href={article.link} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-125 transition-transform"></span>
                    <span className="text-slate-700 font-medium group-hover:text-teal-700">{article.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Yoga Column */}
          <motion.div 
            whileHover={{ y: -5 }} 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
          >
            <h2 className="text-2xl font-bold text-teal-700 mb-6 flex items-center gap-2">
              🧘 Yoga
            </h2>
            <div className="space-y-6">
               {["hJbRpHZr_d0", "uNmKzlh55Fo"].map(id => (
                 <iframe 
                    key={id}
                    className="w-full aspect-video rounded-xl shadow-sm" 
                    src={`https://www.youtube.com/embed/${id}`} 
                    title="Yoga Video" 
                    allowFullScreen 
                 />
               ))}
            </div>
          </motion.div>

          {/* Wellness Column */}
          <motion.div 
            whileHover={{ y: -5 }} 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
          >
             <h2 className="text-2xl font-bold text-teal-700 mb-6 flex items-center gap-2">
              🌿 Self Care
            </h2>
            <div className="space-y-6">
               {["MaFv-SMgHb0", "MzVl6Lu10kw"].map(id => (
                 <iframe 
                    key={id}
                    className="w-full aspect-video rounded-xl shadow-sm" 
                    src={`https://www.youtube.com/embed/${id}`} 
                    title="Wellness Video" 
                    allowFullScreen 
                 />
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}