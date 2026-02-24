import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Service from "./pages/Service";
import Activities from "./pages/Activities";
import Login from './pages/Login';
import SymptomTracker from "./pages/SymptomTracker";
import Chatbot from "./pages/Chatbot";
import DocumentUpload from "./pages/DocumentUpload";
import DoctorsList from "./pages/DoctorsList";
import DoctorDashboard from "./pages/DoctorDashboard";
import MyAppointments from "./pages/MyAppointments";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '10px', padding: '16px' },
          success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />

      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Service />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/login" element={<Login />} />

          {/* Patient-only routes */}
          <Route path="/symptom" element={
            <ProtectedRoute requiredRole="patient">
              <SymptomTracker />
            </ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute requiredRole="patient">
              <Chatbot />
            </ProtectedRoute>
          } />
          <Route path="/docUpload" element={
            <ProtectedRoute requiredRole="patient">
              <DocumentUpload />
            </ProtectedRoute>
          } />
          <Route path="/doctors-list" element={
            <ProtectedRoute requiredRole="patient">
              <DoctorsList />
            </ProtectedRoute>
          } />
          <Route path="/my-appointments" element={
            <ProtectedRoute requiredRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          } />

          {/* Doctor-only routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
