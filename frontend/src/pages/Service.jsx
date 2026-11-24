import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, FileText, MessageSquare, ScanLine, Pill, BookOpen, LayoutDashboard } from "lucide-react";

const patientTools = [
  { title: "Find a doctor", description: "Browse registered profiles and request an appointment.", path: "/doctors-list", icon: CalendarDays, group: "Your care" },
  { title: "Symptom journal", description: "Save symptoms, mood and notes to refer to at your next visit.", path: "/symptom", icon: Activity, group: "Your care" },
  { title: "Health documents", description: "Upload and view your prescriptions and reports.", path: "/docUpload", icon: FileText, group: "Your care" },
  { title: "Medicine reminders", description: "Keep a medicine schedule in this browser.", path: "/medicine-reminder", icon: Pill, group: "Your care" },
  { title: "CareAI assistant", description: "Ask general health questions and clarify unfamiliar terms.", path: "/chatbot", icon: MessageSquare, group: "Information & preparation" },
  { title: "Prescription reader", description: "Extract text from a prescription image. Check the result against the original.", path: "/smart-scanner", icon: ScanLine, group: "Information & preparation" },
  { title: "Symptom review", description: "Review your saved entries with AI assistance before speaking with a clinician.", path: "/symptom-predictor", icon: Activity, group: "Information & preparation" },
  { title: "Health resources", description: "Browse exercise, relaxation and general wellbeing resources.", path: "/activities", icon: BookOpen, group: "Information & preparation" },
];
export default function ServiceSection() {
  const doctor = localStorage.getItem("role") === "doctor";
  const tools = doctor ? [
    { title: "Practice overview", description: "Review appointment counts and recent patient activity.", path: "/doctor/dashboard", icon: LayoutDashboard, group: "Practice tools" },
    { title: "Appointments & patients", description: "Manage appointment requests and review records shared through your patient relationships.", path: "/doctor/dashboard", icon: CalendarDays, group: "Practice tools" },
    { title: "Health resources", description: "Browse general wellbeing resources.", path: "/activities", icon: BookOpen, group: "Practice tools" },
  ] : patientTools;
  const groups = [...new Set(tools.map(tool => tool.group))];
  return <div className="cp-page"><div className="cp-container"><header className="cp-page-heading"><p className="cp-eyebrow">{doctor ? "For doctors" : "For patients"}</p><h1>{doctor ? "Practice tools" : "Your care, organised"}</h1><p>{doctor ? "The tools you need to review appointments and prepare for consultations." : "Choose a tool to manage your records or prepare for your next appointment."}</p></header>{groups.map(group => <section className="cp-service-group" key={group}><h2>{group}</h2><div className="cp-service-grid">{tools.filter(tool => tool.group === group).map(({ title, description, path, icon: Icon }) => <Link className="cp-service-card" to={path} key={title}><span className="cp-service-icon"><Icon size={21} strokeWidth={1.7}/></span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight className="cp-service-arrow" size={17}/></Link>)}</div></section>)}</div></div>;
}
