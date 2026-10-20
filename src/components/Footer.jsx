import BackendStatus from './BackendStatus.jsx'
import './Footer.css'

export default function Footer({ onUnavailable }) {
  function pending(e, name) {
    e.preventDefault()
    onUnavailable(name)
  }

  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <h3 className="footer-brand">MEDS<span>-AI</span></h3>
          <p>An AI-powered healthcare web application, currently in development.</p>
        </div>

        <nav aria-label="Footer">
          <h4>Navigate</h4>
          <ul>
            <li><a href="#top">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#/predict">Predict Disease</a></li>
            <li><a href="#" onClick={(e) => pending(e, 'Hospitals')}>Hospitals</a></li>
            <li><a href="#" onClick={(e) => pending(e, 'About Us')}>About Us</a></li>
          </ul>
        </nav>
        </div>
      </footer>
  )
}