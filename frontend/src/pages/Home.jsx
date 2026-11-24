import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, FileText, MessageSquare, ClipboardList } from "lucide-react";

const tools = [
  { title: "Symptoms", description: "Write down how you feel, with dates and notes for your next visit.", path: "/symptom", icon: Activity },
  { title: "Appointments", description: "Find a doctor and keep track of appointment requests.", path: "/doctors-list", icon: CalendarDays },
  { title: "Documents", description: "Keep prescriptions and reports together for easy reference.", path: "/docUpload", icon: FileText },
  { title: "CareAI", description: "Ask about health terms and prepare questions for your doctor.", path: "/chatbot", icon: MessageSquare },
];
export default function Home() {
  const signedIn = Boolean(localStorage.getItem("token"));
  const doctor = localStorage.getItem("role") === "doctor";
  const dashboard = doctor ? "/doctor/dashboard" : "/dashboard";
  return <div className="cp-home">
    <section className="cp-container cp-hero">
      <div><p className="cp-eyebrow">CarePulse · Patient & doctor workspace</p><h1>A clearer picture<br/>of your care.</h1><p className="cp-hero-description">Keep your health notes, appointments and documents together. Less searching when it’s time to speak with your doctor.</p><div className="cp-button-row"><Link className="cp-button cp-button-primary" to={signedIn ? dashboard : "/login"}>{signedIn ? "Open your dashboard" : "Create an account"}<ArrowRight size={17}/></Link><Link className="cp-button cp-button-secondary" to="/services">See the tools</Link></div><p className="cp-hero-footnote">For everyday record keeping and appointment management.</p></div>
      <aside className="cp-workflow"><div className="cp-workflow-heading"><ClipboardList size={21}/><span>Before your next appointment</span></div><ol>{[["Keep a note", "Record symptoms and changes while they’re fresh in your mind."], ["Bring your records together", "Add the prescriptions and reports you want to refer to."], ["Plan your visit", "Request an appointment and prepare your questions."]].map(([title, description], index) => <li key={title}><span className="cp-step">0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div></li>)}</ol><div className="cp-workflow-footer">Your records start with what you add.</div></aside>
    </section>
    <section className="cp-tools-section"><div className="cp-container"><div className="cp-section-heading"><div><p className="cp-eyebrow">The essentials</p><h2>One place for the details.</h2></div><Link className="cp-text-link" to="/services">All tools<ArrowRight size={16}/></Link></div><div className="cp-tools-grid">{tools.map(({ title, description, path, icon: Icon }) => <Link className="cp-tool" key={title} to={doctor ? "/services" : path}><Icon size={22} strokeWidth={1.6}/><h3>{title}</h3><p>{description}</p><span>Open {title === "CareAI" ? "assistant" : title.toLowerCase()}<ArrowRight size={15}/></span></Link>)}</div></div></section>
    <section className="cp-container cp-home-closing"><div><h2>For patients. For the people caring for them.</h2><p>Patients manage their records and appointments. Doctors review appointment details and prepare for consultations.</p></div><Link className="cp-text-link" to={signedIn ? dashboard : "/login"}>{signedIn ? "Go to overview" : "Sign in to get started"}<ArrowRight size={16}/></Link></section>
  </div>;
}
