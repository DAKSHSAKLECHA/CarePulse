// pages/Service.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ServiceSection() {
  const [userType, setUserType] = useState('patient');

  const ServiceCard = ({ title, desc, link, btnText, color }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
    >
      <div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6`}>
           {/* You can replace with Icons later */}
           <div className="w-6 h-6 bg-current opacity-20 rounded-full"></div> 
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed">{desc}</p>
      </div>
      
      {link ? (
        <Link to={link}>
          <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-teal-600 hover:text-white transition-all">
            {btnText}
          </button>
        </Link>
      ) : (
        <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-teal-600 hover:text-white transition-all">
          {btnText}
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Comprehensive healthcare tools designed for both patients and medical professionals.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex">
            {['patient', 'doctor'].map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`px-8 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
                  userType === type
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-teal-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userType === 'patient' ? (
            <>
              <ServiceCard 
                title="Find Doctors" 
                desc="Browse our list of verified specialists and book consultations."
                link="/doctors-list" 
                btnText="Find a Doctor"
                color="bg-blue-100 text-blue-600"
              />
              <ServiceCard 
                title="Symptom Tracker" 
                desc="Log your daily health metrics and get AI-powered wellness insights."
                link="/symptom" 
                btnText="Track Now"
                color="bg-rose-100 text-rose-600"
              />
              <ServiceCard 
                title="AI Health Assistant" 
                desc="Chat with our intelligent bot for instant health queries and tips."
                link="/chatbot" 
                btnText="Start Chat"
                color="bg-teal-100 text-teal-600"
              />
              <ServiceCard 
                title="Wellness Activities" 
                desc="Yoga sessions, meditation guides, and health articles."
                link="/activities" 
                btnText="Explore"
                color="bg-amber-100 text-amber-600"
              />
              <ServiceCard 
                title="Secure Documents" 
                desc="Upload and manage your prescriptions and reports safely."
                link="/docUpload" 
                btnText="Manage Files"
                color="bg-purple-100 text-purple-600"
              />
            </>
          ) : (
            <>
              <ServiceCard 
                title="My Appointments" 
                desc="View and manage your upcoming patient consultations."
                link="#" 
                btnText="View Schedule"
                color="bg-blue-100 text-blue-600"
              />
              <ServiceCard 
                title="Patient Records" 
                desc="Access patient history and uploaded documents securely."
                link="#" 
                btnText="Access Records"
                color="bg-teal-100 text-teal-600"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}