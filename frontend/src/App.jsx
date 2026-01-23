import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages Imports
import Home from "./pages/Home";
import Service from "./pages/Service";
import Activities from "./pages/Activities";
import Login from './pages/Login';
import SymptomTracker from "./pages/SymptomTracker";
import Chatbot from "./pages/Chatbot";
import DocumentUpload from "./pages/DocumentUpload";
import DoctorsList from "./pages/DoctorsList";

function App() {
  return (
    // 1. Flex container banaya taaki footer hamesha bottom mein rahe
    <div className="flex flex-col min-h-screen">
      
      <Navbar />
      
      {/* 2. Custom Toaster Styling - teal teal Theme */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981', // teal teal color
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // Red color for errors
              secondary: 'white',
            },
          },
        }} 
      />

      {/* Main content area jo expand hoga */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Service/>} />
          <Route path="/activities" element={<Activities/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/symptom" element={<SymptomTracker/>} />
          <Route path="/chatbot" element={<Chatbot/>} />
          <Route path="/docUpload" element={<DocumentUpload/>} />
          <Route path="/doctors-list" element={<DoctorsList/>} />
        </Routes>
      </main>

      <Footer/>
    </div>
  );
}

export default App;
