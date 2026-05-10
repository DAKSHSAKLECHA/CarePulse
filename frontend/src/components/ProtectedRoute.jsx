import { Navigate } from "react-router-dom";

// requiredRole: "patient" | "doctor" | null (just needs to be logged in)
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Wrong role — send them to their own dashboard
    if (role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/symptom" replace />;
  }

  return children;
}
