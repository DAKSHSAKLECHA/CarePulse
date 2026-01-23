// pages/DocumentUpload.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = "https://CarePulse.onrender.com/api/storage"; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchPrescriptions();
  }, [navigate]);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
      setPrescriptions(res.data);
    } catch (error) { console.error(error); }
  };

  const handleUpload = async () => {
    if (!file || !documentName) return alert("Please select file and name.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentName", documentName);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("Success!");
      fetchPrescriptions();
      setDocumentName("");
      setFile(null);
    } catch (error) { alert("Upload failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Medical Records</h1>
        
        {/* Upload Card */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 mb-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Document Name</label>
              <input
                type="text"
                placeholder="e.g., Blood Test Report"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Choose File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Your Files</h2>
          {prescriptions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400">
              No documents uploaded yet.
            </div>
          ) : (
            prescriptions.map((doc) => (
              <div key={doc._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">📄</div>
                   <div>
                     <h3 className="font-semibold text-slate-800">{doc.documentName}</h3>
                     <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <a
                  href={doc.prescriptionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors"
                >
                  View
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}