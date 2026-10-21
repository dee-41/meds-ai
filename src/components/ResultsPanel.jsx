import './ResultsPanel.css'

const URGENCY_LABELS = {
  emergency: 'Possible emergency: seek emergency care now',
  urgent: 'Seek medical care soon',
  routine: 'Consider a routine medical check-up',
  low: 'Lower urgency, keep an eye on your symptoms',
}

function ListSection({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <section className="result-section">
      <h4>{title}</h4>
      <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </section>
  )
}

// Right-hand panel. status: 'idle' | 'loading' | 'success' | 'error' | 'needs-login'.
// Results are only drawn from a real response the server sent after the AI answered.
export default function ResultsPanel({ status, result, errorInfo }) {
  let body

  if (status === 'loading') {
    body = (
      <div className="results-empty" role="status">
        <h3>Analyzing your symptoms...</h3>
        <p>This can take up to a minute. If this is an emergency, do not wait: call your local emergency number.</p>
      </div>
    )
  } else if (status === 'needs-login') {
    body = (
      <div className="results-notice">
        <h3>Please log in first</h3>
        <p>You need to be logged in to analyze symptoms.</p>
        <p><a className="results-link" href="#/login">Go to Login</a></p>
      </div>
    )
  } else if (status === 'error') {
    body = (
      <div className="results-notice" role="alert">
        <h3>The analysis could not be completed</h3>
        <p>{errorInfo?.message}</p>
        {errorInfo?.safety?.emergencySignsDetected && (
          <p className="results-emergency">{errorInfo.safety.message}</p>
        )}
        <p>No results are shown because none were produced. Please try again later or speak with a healthcare professional.</p>
      </div>
    )
  } else if (status === 'success' && result) {
    const { analysis, safety, meta } = result
    body = (
      <div className="results-success">
        <p className="ai-label">
          AI-generated health information (Anthropic{meta.model ? `, ${meta.model}` : ''}). Not a diagnosis.
        </p>

        {safety?.emergencySignsDetected && <p className="results-emergency">{safety.message}</p>}

        <div className={`urgency urgency-${analysis.urgency}`}>
          <strong>{URGENCY_LABELS[analysis.urgency]}</strong>
          <span>{analysis.urgencyReason}</span>
        </div>

        <section className="result-section">
          <h4>Overview</h4>
          <p>{analysis.summary}</p>
        </section>

        {analysis.possibleExplanations.length > 0 && (
          <section className="result-section">
            <h4>Possible explanations to discuss with a clinician</h4>
            <ul>
              {analysis.possibleExplanations.map((item, i) => (
                <li key={i}><strong>{item.name}.</strong> {item.reasoning}</li>
              ))}
            </ul>
          </section>
        )}

        <ListSection title="Warning signs: get care sooner if you notice" items={analysis.warningSigns} />
        <ListSection title="General precautions" items={analysis.generalPrecautions} />
        <ListSection title="Questions to ask a healthcare professional" items={analysis.questionsForClinician} />

        <p className="results-disclaimer">{meta.disclaimer}</p>
      </div>
    )
  } else {
    body = (
      <div className="results-empty">
        <div className="results-empty-icon" aria-hidden="true">+</div>
        <h3>No assessment yet</h3>
        <p>
          Add your symptoms and select Analyze symptoms. Information and precautions will appear here
          after the AI service responds.
        </p>
      </div>
    )
  }

  return (
    <aside className="results-panel" aria-live="polite">
      <h2>Precautions and results</h2>
      {body}
    </aside>
  )
}