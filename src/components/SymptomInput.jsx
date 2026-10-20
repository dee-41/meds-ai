import { useState } from 'react'
import { SYMPTOM_VOCABULARY } from '../data/symptoms.js'
import './SymptomInput.css'

// Text field + suggestions + removable chips.
// The list of selected symptoms lives in the parent page; we get it via props.
export default function SymptomInput({ selected, onAdd, onRemove }) {
  const [query, setQuery] = useState('')

  const text = query.trim().toLowerCase()
  const suggestions = text
    ? SYMPTOM_VOCABULARY.filter(
        (s) => s.toLowerCase().includes(text) && !selected.includes(s)
      ).slice(0, 6)
    : []

  function choose(symptom) {
    onAdd(symptom)
    setQuery('')
  }

  // Enter picks the first suggestion instead of submitting the form.
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) choose(suggestions[0])
    }
  }

  return (
    <div className="symptom-input">
      <label htmlFor="symptom-search">Search symptoms</label>
      <input
        id="symptom-search"
        type="text"
        autoComplete="off"
        placeholder="Start typing, e.g. head"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {text && suggestions.length > 0 && (
        <ul className="suggestions" aria-label="Matching symptoms">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => choose(s)}>{s}</button>
            </li>
          ))}
        </ul>
      )}
      {text && suggestions.length === 0 && (
        <p className="hint">
          No match in the list. Describe it in your own words in the box below instead.
        </p>
      )}

      {selected.length > 0 && (
        <ul className="chips" aria-label="Selected symptoms">
          {selected.map((s) => (
            <li key={s} className="chip">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => onRemove(s)}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}