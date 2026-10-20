import FeatureCard from './FeatureCard.jsx'
import './Features.css'

// Simple inline SVG icons so we don't need an icon library.
const icons = {
  brain: <svg viewBox="0 0 24 24"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>,
  doctor: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  shield: <svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  pin: <svg viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
}

const features = [
  { icon: icons.brain, title: 'AI Symptom Analysis', description: 'Describe how you feel and get general information about what your symptoms could mean.' },
  { icon: icons.doctor, title: 'Doctor Consultations', description: 'Connect with qualified doctors for advice that fits your situation.' },
  { icon: icons.shield, title: 'Verified Medical Guidance', description: 'Health information that is reviewed and clearly sourced, so you know what to trust.' },
  { icon: icons.pin, title: 'Hospital Discovery', description: 'Find hospitals near you and see what each one offers.' },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <h2>What MEDS-AI is being built to do</h2>
        <p className="features-intro">
          These services are planned for future releases. None of them are available yet.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
