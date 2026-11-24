import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Activity, Calendar, FileText, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PreAppointmentBrief } from "../components/ClinicalDecisionSupport";
import HealthTimeline from "../components/HealthTimeline";

const actions=[{label:"Book appointment",path:"/doctors-list",icon:Calendar},{label:"Log symptoms",path:"/symptom",icon:Activity},{label:"My documents",path:"/docUpload",icon:FileText},{label:"CareAI assistant",path:"/chatbot",icon:MessageCircle}];
const card={background:"white",border:"1px solid #e8edf2",borderRadius:20,padding:24};
function storedUser(){try{return JSON.parse(localStorage.getItem("user"))||{}}catch{return {}}}

export default function PatientDashboard(){
  const navigate=useNavigate();
  const [user]=useState(storedUser);
  const [appointments,setAppointments]=useState(null);
  const [symptoms,setSymptoms]=useState(null);
  const [documents,setDocuments]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    const options={timeout:15000,headers:{Authorization:"Bearer "+localStorage.getItem("token")},signal:controller.signal};
    const load=async()=>{
      const requests=[axios.get("/api/appointments/my",options),user.id?axios.get("/api/symptoms/patient/"+user.id,options):Promise.reject(new Error("No patient ID")),axios.get("/api/storage",options)];
      const results=await Promise.allSettled(requests);
      if(controller.signal.aborted)return;
      [setAppointments,setSymptoms,setDocuments].forEach((save,index)=>{
        const result=results[index];
        if(result.status==="fulfilled"&&Array.isArray(result.value.data))save(result.value.data);
        else setError("Some records could not load. Unavailable counts are not shown as zero.");
      });
      setLoading(false);
    };
    load();return()=>controller.abort();
  },[user.id]);
  const upcoming=(appointments||[]).filter(item=>["pending","confirmed"].includes(item.status)&&item.date&&item.date>=new Date().toLocaleDateString("en-CA")).sort((a,b)=>a.date.localeCompare(b.date));
  const recent=(symptoms||[]).slice().sort((a,b)=>String(b.date||b.createdAt||"").localeCompare(String(a.date||a.createdAt||""))).slice(0,7);
  const count=value=>loading?"Loading…":value===null?"Unavailable":value.length;
  function logout(){localStorage.removeItem("token");localStorage.removeItem("user");toast.success("Logged out");navigate("/login")}
  return <div style={{minHeight:"100vh",background:"#f6faf9",padding:"7rem 1.5rem 4rem",color:"#0d1b2a"}}><div style={{maxWidth:1100,margin:"0 auto"}}>
    <header style={{...card,background:"#0d1b2a",color:"white",display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:20}}><div><p style={{color:"#99c9bd"}}>Patient dashboard</p><h1 style={{fontSize:"2rem",fontWeight:800}}>Hello, {user.name||"Patient"}</h1><p style={{marginTop:8,color:"#b6c8cd"}}>Your saved appointments, symptom entries and documents.</p></div><button onClick={logout} style={{alignSelf:"center",border:"1px solid #78938c",padding:"9px 16px",borderRadius:10}}>Log out</button></header>
    {error&&<p role="alert" style={{marginTop:20,padding:16,background:"#fff7ed",borderRadius:12,color:"#9a3412"}}>{error}</p>}
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginTop:24}}>{[["Saved symptom entries",symptoms],["Appointments",appointments],["Uploaded documents",documents]].map(([label,value])=><div key={label} style={card}><p style={{color:"#64748b"}}>{label}</p><p style={{fontSize:"1.8rem",fontWeight:800,marginTop:8}}>{count(value)}</p></div>)}</section>
    <p style={{fontSize:"0.85rem",color:"#64748b",margin:"16px 0"}}>Vital signs are not connected to a measuring device. No heart rate, temperature or oxygen readings are assumed.</p>
    {upcoming[0]&&<PreAppointmentBrief appointment={upcoming[0]} recentSymptoms={symptoms||[]}/>}
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,marginTop:24}}>
      <div style={card}><h2 style={{fontSize:"1.1rem",fontWeight:700}}>Recent symptom entries</h2>{loading?<p style={{marginTop:16}}>Loading your records…</p>:symptoms===null?<p style={{marginTop:16,color:"#64748b"}}>Symptom records are unavailable.</p>:recent.length===0?<p style={{marginTop:16,color:"#64748b"}}>No symptom entries saved yet.</p>:<ul style={{marginTop:16}}>{recent.map((item,index)=><li key={item._id||index} style={{padding:"12px 0",borderBottom:"1px solid #edf2f7"}}><p style={{fontWeight:600}}>{item.date||"Date not recorded"}{item.mood?" · "+item.mood:""}</p><p style={{color:"#64748b",marginTop:4}}>{item.symptoms||"No symptom description recorded."}</p></li>)}</ul>}</div>
      <div style={card}><h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:16}}>Quick actions</h2>{actions.map(({label,path,icon:Icon})=><Link key={path} to={path} style={{display:"flex",gap:12,padding:"12px 0",color:"#0a7e6e",textDecoration:"none",fontWeight:600}}><Icon size={19}/>{label} →</Link>)}</div>
    </section>
    <HealthTimeline mode="patient"/>
  </div></div>;
}
