// components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Activities", path: "/activities" },
    { name: "Symptoms", path: "/symptom" },
    { name: "Documents", path: "/docUpload" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:rotate-12 transition-transform">
              C
            </div>
            <span className={`text-2xl font-bold tracking-tight ${scrolled ? "text-slate-800" : "text-teal-900"}`}>
              Care<span className="text-teal-500">Pulse</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 font-medium text-sm hover:bg-rose-100 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-teal-600 text-white font-medium text-sm shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 p-2">
              <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 hover:text-teal-600 font-medium"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-left text-rose-600 font-medium">
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-teal-600 font-medium">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}