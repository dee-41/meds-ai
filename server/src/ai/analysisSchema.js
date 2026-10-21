// Checks that the AI's answer has exactly the shape we expect before it reaches the browser.
// Anything unexpected is rejected, never passed through.
const URGENCY_LEVELS = ['emergency', 'urgent', 'routine', 'low']

function text(value, max) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null
}

function textList(value, maxItems, maxLength) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > maxItems) return null
  const cleaned = value.map((item) => text(item, maxLength))
  return cleaned.includes(null) ? null : cleaned
}

// Pull a JSON object out of the model's text (it may be wrapped in code fences).
export function extractJson(raw) {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
}

// Returns the cleaned analysis, or null if the shape is wrong.
export function validateAnalysis(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null
  if (!URGENCY_LEVELS.includes(data.urgency)) return null

  const summary = text(data.summary, 1500)
  const urgencyReason = text(data.urgencyReason, 500)
  const warningSigns = textList(data.warningSigns, 8, 400)
  const generalPrecautions = textList(data.generalPrecautions, 8, 400)
  const questionsForClinician = textList(data.questionsForClinician, 8, 400)
  if (!summary || !urgencyReason || !warningSigns || !generalPrecautions || !questionsForClinician) return null

  let possibleExplanations = []
  if (data.possibleExplanations !== undefined) {
    if (!Array.isArray(data.possibleExplanations) || data.possibleExplanations.length > 6) return null
    possibleExplanations = data.possibleExplanations.map((item) => ({
      name: text(item?.name, 150),
      reasoning: text(item?.reasoning, 600),
    }))
    if (possibleExplanations.some((item) => !item.name || !item.reasoning)) return null
  }

  return {
    urgency: data.urgency,
    urgencyReason,
    summary,
    possibleExplanations,
    warningSigns,
    generalPrecautions,
    questionsForClinician,
  }
}