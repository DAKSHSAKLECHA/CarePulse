// pages/DoctorsList.jsx
import React from "react";
import { motion } from "framer-motion";

const DoctorsList = () => {
  const doctors = [
    { id: 1, name: "Dr. Rajesh Sharma", specialization: "Cardiologist", experience: "12 years", location: "Delhi, India", image: "https://t3.ftcdn.net/jpg/02/60/04/09/360_F_260040900_oO6YW1sHTnKxby4GcjCvtypUCWjnXVg5.jpg", bio: "Renowned cardiologist with expertise in heart surgeries." },
    { id: 2, name: "Dr. Priya Singh", specialization: "Dermatologist", experience: "9 years", location: "Mumbai, India", image: "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg", bio: "Specializes in skin treatments and cosmetic dermatology." },
    { id: 3, name: "Dr. Anil Kumar", specialization: "Orthopedic", experience: "15 years", location: "Bangalore, India", image: "https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2xHNxmJDicSEdb7zV0y6kWxQ.jpg", bio: "Expert in joint replacement and sports injuries." },
    { id: 4, name: "Dr. Sunita Reddy", specialization: "Pediatrician", experience: "10 years", location: "Hyderabad, India", image: "https://t3.ftcdn.net/jpg/01/51/85/33/360_F_151853310_S2Kj8lD08m5e7z2q07w7F7.jpg", bio: "Compassionate care for children and adolescents." },
    // Add more doctors as needed...
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Specialists</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Connect with top-rated medical professionals for expert advice.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-white text-xs font-semibold bg-teal-600 px-2 py-1 rounded">
                    {doctor.specialization}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                <p className="text-slate-500 text-sm mb-3 flex items-center gap-1">
                  📍 {doctor.location} • {doctor.experience} Exp.
                </p>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                <button className="w-full bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-teal-600 hover:text-white transition-all">
                  Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsList;