import { Link } from "react-router-dom";
import { Activity, CalendarDays, FileText, MessageCircle } from "lucide-react";

const features = [
  { title: "Track symptoms", description: "Keep a dated record of symptoms, moods and notes you enter.", path: "/symptom", icon: Activity },
  { title: "Find doctors", description: "Browse registered doctor profiles and request an appointment.", path: "/doctors-list", icon: CalendarDays },
  { title: "Manage documents", description: "Upload and view your own prescriptions and health documents.", path: "/docUpload", icon: FileText },
  { title: "Ask CareAI", description: "Get AI-assisted information to discuss with a qualified clinician.", path: "/chatbot", icon: MessageCircle },
];

export default function Home() {
  return <div style={{ minHeight: "100vh", padding: "8rem 1.5rem 5rem", background: "linear-gradient(150deg,#f0f9f7,#fff,#eef4fb)", color: "#0d1b2a" }}>
    <section style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 56 }}>
      <p style={{ color: "#0a7e6e", fontWeight: 700 }}>Your health records, in one place</p>
      <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, maxWidth: 800, margin: "1rem 0" }}>Keep track of your care with CarePulse.</h1>
      <p style={{ color: "#4a6070", fontSize: "1.1rem", lineHeight: 1.8, maxWidth: 650 }}>Log symptoms, organize documents and manage appointments. Your dashboard shows saved records, not sample health readings.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
        <Link to="/symptom" style={{ padding: "14px 24px", borderRadius: 12, background: "#0a7e6e", color: "white", fontWeight: 700, textDecoration: "none" }}>Start health tracking →</Link>
        <Link to="/services" style={{ padding: "14px 24px", borderRadius: 12, background: "white", color: "#0a7e6e", border: "1px solid #cce6df", fontWeight: 700, textDecoration: "none" }}>Explore tools</Link>
      </div>
    </section>
    <section style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20 }}>
      {features.map(({title,description,path,icon:Icon})=><Link key={title} to={path} style={{ background: "white", border: "1px solid #e4ecea", borderRadius: 20, padding: 26, textDecoration: "none", color: "inherit" }}><Icon size={25} color="#0a7e6e"/><h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "18px 0 10px" }}>{title}</h2><p style={{ color: "#64748b", lineHeight: 1.7 }}>{description}</p></Link>)}
    </section>
    <p style={{ maxWidth: 1100, margin: "32px auto 0", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7 }}>CarePulse does not measure vital signs or provide a confirmed diagnosis. AI-generated information can be inaccurate and requires clinician review.</p>
  </div>;
}
