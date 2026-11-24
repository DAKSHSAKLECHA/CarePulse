import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="cp-footer"><div className="cp-container"><div className="cp-footer-top"><Link to="/" className="cp-footer-brand">CarePulse</Link><nav aria-label="Footer navigation"><Link to="/services">Tools & services</Link><Link to="/activities">Health resources</Link></nav></div><div className="cp-footer-bottom"><p>© {new Date().getFullYear()} CarePulse</p><p>AI responses are for information and may be inaccurate. Consult a qualified clinician for medical advice.</p></div></div></footer>;
}
