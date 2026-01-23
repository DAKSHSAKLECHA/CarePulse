// components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to={'/'} className="text-2xl font-bold text-white mb-4 block">
              Care<span className="text-teal-500">Pulse</span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              Empowering your health journey with advanced tools, expert connections, and AI-driven support.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
              <Link to="/services" className="hover:text-teal-400 transition-colors">Services</Link>
              <Link to="/symptom" className="hover:text-teal-400 transition-colors">Symptom Tracker</Link>
              <Link to="/doctors-list" className="hover:text-teal-400 transition-colors">Find Doctors</Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a 
                  key={social}
                  href={`https://www.${social}.com`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all"
                >
                  <i className={`fab fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2025 CarePulse. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with by <span className="text-teal-400 font-bold">ME</span>
          </p>
        </div>
      </div>
    </footer>
  );
}