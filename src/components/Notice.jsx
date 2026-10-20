import './Notice.css'

// Shown when someone clicks something whose page has not been built yet.
export default function Notice({ name, onClose }) {
  return (
    <div className="notice" role="status">
      <div className="container notice-inner">
        <p><strong>{name}</strong> has not been built yet. It is planned for a later stage of the project.</p>
        <button onClick={onClose} aria-label="Dismiss message">Dismiss</button>
      </div>
    </div>
  )
}
