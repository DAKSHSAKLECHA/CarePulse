import { Link } from "react-router-dom";

export default function Footer(){
  return <footer style={{background:"#0d1b2a",color:"#94a3b8",padding:"2.5rem 1.5rem"}}>
    <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:24}}>
      <div><Link to="/" style={{color:"white",fontSize:"1.2rem",fontWeight:800,textDecoration:"none"}}>CarePulse</Link><p style={{maxWidth:440,lineHeight:1.7,marginTop:10}}>A workspace for health records, appointments and AI-assisted information. AI output is not a confirmed medical assessment.</p></div>
      <nav style={{display:"flex",flexWrap:"wrap",gap:18,alignItems:"start"}}>{[["Home","/"],["Services","/services"],["Doctors","/doctors-list"],["Appointments","/my-appointments"]].map(([label,to])=><Link key={to} to={to} style={{color:"#cbd5e1",textDecoration:"none"}}>{label}</Link>)}</nav>
    </div>
    <p style={{maxWidth:1100,margin:"24px auto 0",fontSize:"0.8rem"}}>© {new Date().getFullYear()} CarePulse</p>
  </footer>;
}
