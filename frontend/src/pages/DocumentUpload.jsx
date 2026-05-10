// ============================================================
// DocumentUpload.jsx
// ============================================================
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "/api/storage"; // ✅ FIXED — was https://CarePulse.onrender.com/api/storage

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  const handleUpload = async () => {
    if (!file || !documentName) return alert("Please provide a name and select a file.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentName", documentName);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded successfully!");
      fetchPrescriptions();
      setDocumentName("");
      setFile(null);
    } catch { alert("Upload failed"); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "0.875rem",
    color: "#0d1b2a",
    outline: "none",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 60%, #eef4fb 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        paddingTop: "6rem",
        paddingBottom: "4rem",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.03em", margin: 0 }}>
            Medical Records
          </h1>
          <p style={{ color: "#64748b", marginTop: 6 }}>Upload and manage your health documents securely.</p>
        </div>

        {/* Upload Card */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "2rem",
            border: "1px solid #e8edf2",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            marginBottom: 28,
          }}
        >
          <h2 style={{ fontWeight: 700, color: "#0d1b2a", margin: "0 0 1.2rem", fontSize: "1rem" }}>Upload New Document</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                Document Name
              </label>
              <input
                type="text"
                placeholder="e.g. Blood Test Report"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                Choose File
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  ...inputStyle,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #0a7e6e, #0d9488)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              boxShadow: "0 6px 20px rgba(10,126,110,0.25)",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        {/* Documents List */}
        <h2 style={{ fontWeight: 700, color: "#0d1b2a", margin: "0 0 14px", fontSize: "1rem" }}>Your Files</h2>

        {fetching ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading...</div>
        ) : prescriptions.length === 0 ? (
          <div style={{ background: "white", borderRadius: 20, padding: "3.5rem", textAlign: "center", border: "2px dashed #e2e8f0", color: "#94a3b8" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📂</div>
            No documents uploaded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prescriptions.map((doc) => (
              <div
                key={doc._id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "1.1rem 1.4rem",
                  border: "1px solid #e8edf2",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(10,126,110,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0d1b2a", margin: 0, fontSize: "0.9rem" }}>{doc.documentName}</p>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "2px 0 0" }}>
                      {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.prescriptionUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "7px 16px",
                    borderRadius: 9,
                    background: "#f0fdf9",
                    color: "#0a7e6e",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    border: "1px solid rgba(10,126,110,0.15)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}