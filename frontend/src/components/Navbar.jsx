import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  useEffect(() => { setOpen(false); }, [location.pathname]);
  const links = !token ? [["Home", "/"], ["Services", "/services"], ["Resources", "/activities"]]
    : role === "doctor" ? [["Overview", "/doctor/dashboard"], ["Tools", "/services"], ["Resources", "/activities"]]
    : [["Overview", "/dashboard"], ["Doctors", "/doctors-list"], ["Appointments", "/my-appointments"], ["Symptoms", "/symptom"], ["Documents", "/docUpload"]];
  function logout() {
    ["token", "user", "role", "patientId"].forEach(key => localStorage.removeItem(key));
    setOpen(false);
    navigate("/login");
  }
  return <header className="cp-nav">
    <div className="cp-nav-inner">
      <Link to={token ? role === "doctor" ? "/doctor/dashboard" : "/dashboard" : "/"} className="cp-brand" aria-label="CarePulse home"><span className="cp-brand-mark"><HeartPulse size={23} strokeWidth={1.8}/></span>Care<span>Pulse</span></Link>
      <button className="cp-menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      <nav id="primary-navigation" aria-label="Main navigation" className={`cp-nav-links${open ? " is-open" : ""}`}>
        {links.map(([label, path]) => <NavLink end key={path} to={path} className={({ isActive }) => `cp-nav-link${isActive ? " is-active" : ""}`}>{label}</NavLink>)}
        <div className="cp-nav-account">{token ? <><span className="cp-account-role">{role === "doctor" ? "Doctor account" : "Patient account"}</span><button onClick={logout} className="cp-logout"><LogOut size={16}/><span>Sign out</span></button></> : <Link className="cp-button cp-button-primary" to="/login">Sign in</Link>}</div>
      </nav>
    </div>
  </header>;
}
