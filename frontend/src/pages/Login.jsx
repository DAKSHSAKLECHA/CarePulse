import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AuthPage() {
  const [role, setRole] = useState("patient"); // "patient" | "doctor"
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    age: "", gender: "",
    specialization: "", experience: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setIsLogin(true);
    setError("");
    setFormData({ name: "", email: "", password: "", age: "", gender: "", specialization: "", experience: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let url;
    if (role === "patient") {
      url = isLogin ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/register`;
    } else {
      url = isLogin ? `${baseUrl}/api/doctor/login` : `${baseUrl}/api/doctor/register`;
    }

    let requestBody;
    if (isLogin) {
      requestBody = { email: formData.email, password: formData.password };
    } else if (role === "patient") {
      requestBody = { name: formData.name, email: formData.email, password: formData.password, age: formData.age, gender: formData.gender };
    } else {
      requestBody = { name: formData.name, email: formData.email, password: formData.password, specialization: formData.specialization, experience: formData.experience };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        if (data.user.role === "patient") {
          localStorage.setItem("patientId", JSON.stringify(data.user.id));
        }

        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");

        if (data.user.role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/symptom");
        }
      } else {
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">

        {/* Role Toggle Panels */}
        <div className="flex rounded-2xl overflow-hidden shadow-lg mb-6 border border-slate-200">
          <button
            onClick={() => handleRoleSwitch("patient")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 font-semibold text-sm transition-all duration-300 ${
              role === "patient"
                ? "bg-teal-600 text-white shadow-inner"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">🧑‍⚕️</span>
            Patient
          </button>
          <button
            onClick={() => handleRoleSwitch("doctor")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 font-semibold text-sm transition-all duration-300 ${
              role === "doctor"
                ? "bg-indigo-600 text-white shadow-inner"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">👨‍⚕️</span>
            Doctor
          </button>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
          >
            {/* Header */}
            <div className="text-center mb-7">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 text-2xl ${
                role === "patient" ? "bg-teal-50" : "bg-indigo-50"
              }`}>
                {role === "patient" ? "🧑‍⚕️" : "👨‍⚕️"}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isLogin ? "Welcome back" : role === "patient" ? "Join as Patient" : "Join as Doctor"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {role === "patient" ? "Access your health dashboard" : "Manage your patients & appointments"}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-5 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register-only fields */}
              {!isLogin && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    onChange={handleChange}
                    required
                  />

                  {role === "patient" ? (
                    <div className="flex gap-3">
                      <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={formData.age}
                        className="w-1/2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        onChange={handleChange}
                        required
                      />
                      <select
                        name="gender"
                        value={formData.gender}
                        className="w-1/2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-600"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="specialization"
                        placeholder="Specialization"
                        value={formData.specialization}
                        className="w-1/2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        onChange={handleChange}
                        required
                      />
                      <input
                        type="number"
                        name="experience"
                        placeholder="Exp. (years)"
                        value={formData.experience}
                        className="w-1/2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${
                  role === "patient" ? "focus:ring-teal-500" : "focus:ring-indigo-500"
                } outline-none transition-all`}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${
                  role === "patient" ? "focus:ring-teal-500" : "focus:ring-indigo-500"
                } outline-none transition-all`}
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                className={`w-full text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all mt-2 ${
                  role === "patient"
                    ? "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-slate-500 mt-5 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                className={`font-semibold hover:underline ${
                  role === "patient" ? "text-teal-600" : "text-indigo-600"
                }`}
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
