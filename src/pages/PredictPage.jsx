import { useMemo, useRef, useState } from 'react'
import SymptomInput from '../components/SymptomInput.jsx'
import ResultsPanel from '../components/ResultsPanel.jsx'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../api.js'
import { hasEmergencySigns, EMERGENCY_MESSAGE } from '../data/emergencySigns.js'
import './PredictPage.css'

export default function PredictPage() {
  const { user, status: authStatus } = useAuth()

  // All form data lives here, in React state.
  const [selected, setSelected] = useState([])   // chips chosen from suggestions
  const [freeText, setFreeText] = useState('')   // symptoms in the user's own words
  const [duration, setDuration] = useState('')   // number
  const [unit, setUnit] = useState('days')
  const [severity, setSeverity] = useState('')
  const [error, setError] = useState('')         // form validation message

  // Analysis state: 'idle' | 'loading' | 'success' | 'error' | 'needs-login'
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)     // the real server/AI response
  const [errorInfo, setErrorInfo] = useState(null)
  const requestCounter = useRef(0)               // lets us ignore answers that arrive after Reset

  // Shown right away, without waiting for the AI.
  const emergencyNow = useMemo(() => hasEmergencySigns(selected, freeText), [selected, freeText])

  function addSymptom(symptom) {
    if (!selected.includes(symptom)) setSelected([...selected, symptom])
    setError('')
  }

  function removeSymptom(symptom) {
    setSelected(selected.filter((s) => s !== symptom))
  }

  function handleReset() {
    requestCounter.current += 1 // any answer still on its way is ignored
    setSelected([])
    setFreeText('')
    setDuration('')
    setUnit('days')
    setSeverity('')
    setError('')
    setStatus('idle')
    setResult(null)
    setErrorInfo(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('idle')
    setResult(null)
    setErrorInfo(null)

    if (selected.length === 0 && freeText.trim() === '') {
      setError('Add at least one symptom, or describe how you feel in your own words.')
      return
    }
    if (duration !== '' && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
      setError('Duration must be a whole number greater than 0, or leave it empty.')
      return
    }
    setError('')

    if (authStatus === 'loading') {
      setErrorInfo({ message: 'Still checking your login. Please try again in a moment.' })
      setStatus('error')
      return
    }
    if (!user && authStatus === 'ready') {
      setStatus('needs-login')
      return
    }

    const body = { symptoms: selected }
    if (freeText.trim()) body.description = freeText.trim()
    if (duration !== '') body.duration = { value: Number(duration), unit }
    if (severity) body.severity = severity

    const thisRequest = ++requestCounter.current
    setStatus('loading')
    const res = await apiRequest('/api/symptoms/analyze', { method: 'POST', body, timeoutMs: 90000 })
    if (thisRequest !== requestCounter.current) return // user pressed Reset meanwhile

    if (res.ok) {
      setResult(res.data)
      setStatus('success')
    } else if (res.status === 401) {
      setStatus('needs-login')
    } else {
      let message = res.data?.error ?? 'Something went wrong. Please try again.'
      if (res.networkError) {
        message = res.timedOut
          ? 'The request took too long. Please try again.'
          : 'Could not reach the server. Check that the backend is running.'
      }
      if (res.data?.fields) message = Object.values(res.data.fields).join(' ')
      setErrorInfo({ message, safety: res.data?.safety })
      setStatus('error')
    }
  }

  return (
    <div className="predict-page">
      <div className="container">
        <h1>Predict Disease</h1>
        <p className="predict-intro">
          Describe your symptoms to get general, AI-generated health information. It is not a diagnosis
          and does not replace a healthcare professional.
        </p>
        <p className="safety-note">
          <strong>In an emergency, do not use this tool.</strong> Call your local emergency number or go to
          the nearest emergency department right away.
        </p>

        {emergencyNow && (
          <div className="emergency-banner" role="alert">{EMERGENCY_MESSAGE}</div>
        )}

        <div className="predict-layout">
          <form className="predict-card" onSubmit={handleSubmit} noValidate>
            <SymptomInput selected={selected} onAdd={addSymptom} onRemove={removeSymptom} />

            <div className="field">
              <label htmlFor="free-text">Describe your symptoms in your own words</label>
              <textarea
                id="free-text"
                rows="4"
                maxLength={1000}
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

            <p className="privacy-note">
              Your symptom details are sent to an AI service (Anthropic) to create the analysis. MEDS-AI does not save them.
            </p>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                {status === 'loading' ? 'Analyzing...' : 'Analyze symptoms'}
              </button>
              <button type="button" className="btn reset-btn" onClick={handleReset}>Reset</button>
            </div>
          </form>

          <ResultsPanel status={status} result={result} errorInfo={errorInfo} />
        </div>
      </div>
    </div>
  )
}