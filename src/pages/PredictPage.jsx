import { useState } from 'react'
import SymptomInput from '../components/SymptomInput.jsx'
import ResultsPanel from '../components/ResultsPanel.jsx'
import './PredictPage.css'

export default function PredictPage() {
  // All form data lives here, in React state.
  const [selected, setSelected] = useState([])   // chips chosen from suggestions
  const [freeText, setFreeText] = useState('')   // symptoms in the user's own words
  const [duration, setDuration] = useState('')   // number
  const [unit, setUnit] = useState('days')
  const [severity, setSeverity] = useState('')
  const [error, setError] = useState('')         // validation message
  const [status, setStatus] = useState('empty')  // 'empty' or 'not-connected'

  function addSymptom(symptom) {
    if (!selected.includes(symptom)) setSelected([...selected, symptom])
    setError('')
  }

  function removeSymptom(symptom) {
    setSelected(selected.filter((s) => s !== symptom))
  }

  function handleReset() {
    setSelected([])
    setFreeText('')
    setDuration('')
    setUnit('days')
    setSeverity('')
    setError('')
    setStatus('empty')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setStatus('empty')

    if (selected.length === 0 && freeText.trim() === '') {
      setError('Add at least one symptom, or describe how you feel in your own words.')
      return
    }
    if (duration !== '' && Number(duration) <= 0) {
      setError('Duration must be a number greater than 0, or leave it empty.')
      return
    }

    setError('')
    setStatus('not-connected') // Real AI prediction will be connected in a later step.
  }

  return (
    <div className="predict-page">
      <div className="container">
        <h1>Predict Disease</h1>
        <p className="predict-intro">
          Tell us about your symptoms. Prediction is not connected yet, so this
          page only collects and checks your details. It does not give medical advice.
        </p>

        <div className="predict-layout">
          <form className="predict-card" onSubmit={handleSubmit} noValidate>
            <SymptomInput selected={selected} onAdd={addSymptom} onRemove={removeSymptom} />

            <div className="field">
              <label htmlFor="free-text">Describe your symptoms in your own words</label>
              <textarea
                id="free-text"
                rows="4"
                placeholder="For example: a dull headache that gets worse in the evening"
                value={freeText}
                onChange={(e) => { setFreeText(e.target.value); setError('') }}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="duration">How long? (optional)</label>
                <div className="duration-group">
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <select aria-label="Duration unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="severity">Severity (optional)</label>
                <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Predict Disease</button>
              <button type="button" className="btn reset-btn" onClick={handleReset}>Reset</button>
            </div>
          </form>

          <ResultsPanel status={status} />
        </div>
      </div>
    </div>
  )
}