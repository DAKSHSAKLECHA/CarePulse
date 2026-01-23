import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // Ensure you installed react-hot-toast

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", age: "", gender: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // ✅ FIX: Use Localhost for development
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
    const url = isLogin 
      ? `${baseUrl}/api/auth/login` 
      : `${baseUrl}/api/auth/register`;

    const requestBody = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      console.log("Success:", data);

      // ✅ FIX: Ensure token exists before saving
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("patientId", JSON.stringify(data.user.id));
        
        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
        navigate("/symptom");
      } else {
        // Fallback for older backend versions
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500">
            {isLogin ? "Enter your details to access your account" : "Start your wellness journey today"}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                onChange={handleChange}
                required
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  className="w-1/2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  onChange={handleChange}
                  required
                />
                <select
                  name="gender"
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
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            onChange={handleChange}
            required
          />

          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition-all mt-4">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-teal-600 font-semibold hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}