import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Activity, ArrowRight, Calendar, FileText, MessageCircle, RefreshCw } from "lucide-react";
import { PreAppointmentBrief } from "../components/ClinicalDecisionSupport";
import HealthTimeline from "../components/HealthTimeline";

const resources = [
  { key: "appointments", label: "Appointments", url: "/api/appointments/my", path: "/my-appointments", icon: Calendar, empty: "No appointments yet" },
  { key: "symptoms", label: "Symptom entries", url: "/api/symptoms/patient/me", path: "/symptom", icon: Activity, empty: "No symptoms logged yet" },
  { key: "documents", label: "Documents", url: "/api/storage", path: "/docUpload", icon: FileText, empty: "No documents uploaded yet" },
];
const initialRecords = () => Object.fromEntries(resources.map(({ key }) => [key, { data: null, loading: true, error: "", auth: false }]));
function storedUser() { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } }
function errorMessage(error) {
  if (error.message === "Invalid records response") return "The site returned a page instead of records. Please retry after the deployment finishes.";
  const status = error.response?.status;
  if (status === 401) return "Your session could not be verified. Please sign in again.";
  if (status === 403) return "This account does not have access to these patient records.";
  if (status === 429) return "Too many requests. Wait a few minutes before retrying.";
  if (error.code === "ECONNABORTED") return "The server is taking longer than expected. Please retry.";
  if (!error.response) return "Could not reach the server. Check your connection and retry.";
  if (status >= 500) return "The server could not load these records. Please retry shortly.";
  return `Records could not load (HTTP ${status}). Please retry.`;
}
function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not recorded" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function PatientDashboard() {
  const [user] = useState(storedUser);
  const [records, setRecords] = useState(initialRecords);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    setRecords(initialRecords());
    const save = (key, value) => { if (!controller.signal.aborted) setRecords(previous => ({ ...previous, [key]: value })); };
    const load = async ({ key, url }) => {
      if (!token) { save(key, { data: null, loading: false, error: "Please sign in to load your records.", auth: true }); return; }
      for (let retry = 0; retry < 2; retry++) {
        try {
          const response = await axios.get(url, { timeout: 30000, headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
          if (!Array.isArray(response.data)) throw new Error("Invalid records response");
          save(key, { data: response.data, loading: false, error: "", auth: false });
          return;
        } catch (error) {
          if (controller.signal.aborted) return;

  const status = error.response?.status;
          const transient = error.code === "ECONNABORTED" || !error.response && error.message !== "Invalid records response" || [502, 503, 504].includes(status);
          if (retry === 0 && transient) continue;
          save(key, { data: null, loading: false, error: errorMessage(error), auth: status === 401 });
          return;
        }
      }
    };
    resources.forEach(resource => { void load(resource); });
    return () => controller.abort();
  }, [attempt]);

  const busy = Object.values(records).some(record => record.loading);
  const failures = resources.filter(({ key }) => records[key].error);
  const authError = failures.some(({ key }) => records[key].auth);
  const isNew = Object.values(records).every(record => Array.isArray(record.data) && record.data.length === 0);
  const symptoms = records.symptoms.data;
  const appointments = records.appointments.data;
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const upcoming = (appointments || []).filter(item => ["pending", "confirmed"].includes(item.status) && new Date(item.date) >= startOfToday).sort((a, b) => new Date(a.date) - new Date(b.date));
  const recent = (symptoms || []).slice().sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 4);

  return <div className="patient-home">
    <style>{`
      .patient-home{min-height:100vh;background:#f6faf9;padding:100px 24px 48px;color:#0d1b2a;font-family:'DM Sans','Segoe UI',sans-serif}
      .patient-home-inner{max-width:1100px;margin:auto}.patient-home h1{font-size:28px;font-weight:750;letter-spacing:-.8px;margin:4px 0 8px}.patient-home h2{font-size:17px;font-weight:700;margin:0 0 18px}.patient-home p{line-height:1.6}
      .patient-home-muted{color:#64748b;font-size:14px}.patient-home-top{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}.patient-home-eyebrow{color:#0a7e6e;font-size:12px;font-weight:750;letter-spacing:1px;text-transform:uppercase}
      .patient-home-link{display:inline-flex;align-items:center;gap:8px;color:#0a7e6e;font-size:14px;font-weight:650;text-decoration:none}.patient-home-primary{background:#0a7e6e;color:white;padding:12px 17px;border-radius:10px;white-space:nowrap}.patient-home-panel{background:white;border:1px solid #e4eeeb;border-radius:16px;padding:22px}
      .patient-home-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:22px}.patient-home-stat-top{display:flex;align-items:center;justify-content:space-between;color:#64748b;font-size:14px}.patient-home-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#edf8f4;color:#0a7e6e}.patient-home-count{font-size:30px;font-weight:750;line-height:1.4;margin:12px 0 2px}
      .patient-home-columns{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:20px;margin:22px 0}.patient-home-empty{padding:18px 0}.patient-home-empty p{margin:5px 0 14px}.patient-home-note{background:#edf8f4;border:1px solid #d7ebe3;border-radius:14px;padding:18px 20px;margin-bottom:22px}.patient-home-alert{background:#fff7ed;border:1px solid #ffedd5;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#9a3412}.patient-home-retry{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:13px;font-weight:650;cursor:pointer;color:#0a7e6e}.patient-home-retry:disabled{opacity:.5;cursor:wait}
      .patient-home-action{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #edf2f0;text-decoration:none;color:#0d1b2a;font-size:14px;font-weight:600}.patient-home-action:last-child{border:0}.patient-home-action span{flex:1}.patient-home-entry{padding:12px 0;border-bottom:1px solid #edf2f0}.patient-home-entry:last-child{border:0}.patient-home-entry p{margin:4px 0 0}.patient-home a:hover{filter:brightness(.88)}
      @media(max-width:640px){.patient-home{padding:92px 16px 32px}.patient-home-top{align-items:flex-start;flex-direction:column;gap:14px}.patient-home h1{font-size:24px}.patient-home-stats,.patient-home-columns{grid-template-columns:1fr}.patient-home-panel{padding:18px}.patient-home-count{font-size:26px}}
    `}</style>
    <div className="patient-home-inner">
      <header className="patient-home-top"><div><p className="patient-home-eyebrow">Your health workspace</p><h1>Hello, {user.name || "there"}</h1><p className="patient-home-muted">Manage your appointments, symptoms and documents in one place.</p></div><Link className="patient-home-link patient-home-primary" to="/doctors-list"><Calendar size={17}/>Book appointment</Link></header>
      {failures.length > 0 && <div className="patient-home-alert" role="alert"><p>{authError ? "Your session needs attention. Sign in again to access your records." : `Could not load: ${failures.map(resource => resource.label.toLowerCase()).join(", ")}.`}</p>{!authError && <p>{records[failures[0].key].error}</p>}{authError ? <Link to="/login" className="patient-home-link">Sign in again <ArrowRight size={15}/></Link> : <button className="patient-home-retry" disabled={busy} onClick={() => setAttempt(value => value + 1)}><RefreshCw size={14}/>{busy ? "Retrying…" : "Retry loading"}</button>}</div>}
      {isNew && <div className="patient-home-note"><h2 style={{ marginBottom: 4 }}>Welcome! Let’s get started.</h2><p className="patient-home-muted">You haven’t saved any records yet. Log your first symptom, book an appointment or upload a document below.</p></div>}
      <section className="patient-home-stats" aria-label="Your saved records">{resources.map(({ key, label, path, icon: Icon, empty }) => {
        const record = records[key];
        return <article className="patient-home-panel" key={key} aria-busy={record.loading}><div className="patient-home-stat-top"><span>{label}</span><span className="patient-home-icon"><Icon size={18}/></span></div><p className="patient-home-count">{record.loading ? <span className="patient-home-muted" role="status">Loading…</span> : record.data === null ? <span className="patient-home-muted">Couldn’t load</span> : record.data.length}</p><p className="patient-home-muted">{record.loading ? "Fetching your records" : record.error ? "Check the message above" : record.data.length === 0 ? empty : "Saved in your account"}</p><Link className="patient-home-link" style={{ marginTop: 14 }} to={path}>View {label.toLowerCase()}<ArrowRight size={14}/></Link></article>;
      })}</section>
      {upcoming[0] && symptoms !== null && <PreAppointmentBrief appointment={upcoming[0]} recentSymptoms={symptoms}/>}
      <div className="patient-home-columns">
        <section className="patient-home-panel"><h2>Recent symptoms</h2>{records.symptoms.loading ? <p className="patient-home-muted" role="status">Loading your entries…</p> : symptoms === null ? <p className="patient-home-muted">Your symptom entries could not load. Use the retry button above.</p> : recent.length === 0 ? <div className="patient-home-empty"><span className="patient-home-icon"><Activity size={20}/></span><p style={{ fontWeight: 600, marginTop: 12 }}>How are you feeling today?</p><p className="patient-home-muted">Keep a record of symptoms and notes to discuss with your doctor.</p><Link className="patient-home-link" to="/symptom">Log your first entry<ArrowRight size={15}/></Link></div> : recent.map((item, index) => <div className="patient-home-entry" key={item._id || index}><span className="patient-home-muted">{displayDate(item.date || item.createdAt)}{item.mood ? ` · ${item.mood}` : ""}</span><p>{item.symptoms || "No description recorded"}</p></div>)}</section>
        <section className="patient-home-panel"><h2>What would you like to do?</h2>{[{ label: "Find a doctor", path: "/doctors-list", icon: Calendar }, { label: "Log symptoms", path: "/symptom", icon: Activity }, { label: "Upload a document", path: "/docUpload", icon: FileText }, { label: "Ask CareAI", path: "/chatbot", icon: MessageCircle }].map(({ label, path, icon: Icon }) => <Link className="patient-home-action" key={path} to={path}><span className="patient-home-icon" style={{ flex: "none" }}><Icon size={18}/></span><span>{label}</span><ArrowRight size={16} color="#94a3b8"/></Link>)}</section>
      </div>
      {symptoms?.length > 0 && appointments !== null && <HealthTimeline mode="patient"/>}
    </div>
  </div>;
}
