import './ResultsPanel.css'

// Right-hand panel. `status` is either 'empty' or 'not-connected'.
// It never shows predictions: there is no AI connected yet.
export default function ResultsPanel({ status }) {
  return (
    <aside className="results-panel" aria-live="polite">
      <h2>Precautions and results</h2>

      {status === 'not-connected' ? (
        <div className="results-notice">
          <h3>Prediction is not connected yet</h3>
          <p>
            Your details were checked and look complete, but no assessment was
            made. The prediction feature has not been built, so there are no
            results or precautions to show.
          </p>
        </div>
      ) : (
        <div className="results-empty">
          <div className="results-empty-icon" aria-hidden="true">+</div>
          <h3>No assessment yet</h3>
          <p>
            Add your symptoms and select Predict Disease. Results and
            precautions will appear here once prediction is available.
          </p>
        </div>
      )}
    </aside>
  )
}