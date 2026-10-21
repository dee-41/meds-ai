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

        <div>
          <h4>Contact</h4>
          <p>Email: <a href="mailto:contact@meds-ai.example">contact@meds-ai.example</a></p>
          <p className="footer-small">Placeholder address. Real contact details will be added before launch.</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          MEDS-AI does not provide medical advice or diagnosis. In an emergency,
          contact your local emergency services.
        </p>
        <BackendStatus />
        <p>&copy; {new Date().getFullYear()} MEDS-AI</p>
      </div>
    </footer>
  )
}