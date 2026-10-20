import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-text">
          <h1>Your Health, Powered by AI</h1>
          <p>
            MEDS-AI is being built to help you describe your symptoms, understand
            possible next steps and find hospitals. It is a work in progress and
            does not replace a doctor.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#/predict">Start Symptom Check</a>
            <a className="btn btn-outline" href="#features">Learn More</a>
          </div>
        </div>
        <div className="hero-panel" aria-hidden="true">
          <div className="hero-cross">+</div>
        </div>
      </div>
    </section>
  )
}