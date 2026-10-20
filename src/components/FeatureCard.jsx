import './FeatureCard.css'

// Reusable card: one icon, a title, a description and a status tag.
export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="feature-status">Planned, not available yet</span>
    </article>
  )
}
