// Server-side checks for the symptom analysis request.
const ALLOWED_FIELDS = ['symptoms', 'description', 'duration', 'severity']
const UNITS = ['hours', 'days', 'weeks', 'months']
const SEVERITIES = ['mild', 'moderate', 'severe']

export const LIMITS = { maxSymptoms: 15, maxSymptomLength: 60, maxDescriptionLength: 1000 }

// Control characters (like new lines) are not allowed inside a symptom name.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

export function validateAnalysisRequest(body) {
  const errors = {}

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { body: 'Send a JSON object.' } }
  }
  const unknown = Object.keys(body).filter((key) => !ALLOWED_FIELDS.includes(key))
  if (unknown.length > 0) errors.body = `Unexpected field(s): ${unknown.join(', ')}.`

  // symptoms: optional list of short strings
  let symptoms = []
  if (body.symptoms !== undefined) {
    if (!Array.isArray(body.symptoms)) {
      errors.symptoms = 'Symptoms must be a list.'
    } else if (body.symptoms.length > LIMITS.maxSymptoms) {
      errors.symptoms = `Send at most ${LIMITS.maxSymptoms} symptoms.`
    } else if (body.symptoms.some((s) => typeof s !== 'string')) {
      errors.symptoms = 'Each symptom must be text.'
    } else {
      symptoms = [...new Set(body.symptoms.map((s) => s.trim()).filter(Boolean))]
      if (symptoms.some((s) => s.length > LIMITS.maxSymptomLength || CONTROL_CHARS.test(s))) {
        errors.symptoms = `Each symptom must be a single line of at most ${LIMITS.maxSymptomLength} characters.`
      }
    }
  }

  // description: optional free text
  let description = ''
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') errors.description = 'Description must be text.'
    else {
      description = body.description.trim()
      if (description.length > LIMITS.maxDescriptionLength) {
        errors.description = `Description must be at most ${LIMITS.maxDescriptionLength} characters.`
      }
    }
  }

  // duration: optional { value, unit } (both or neither)
  let duration
  if (body.duration !== undefined) {
    const d = body.duration
    if (d === null || typeof d !== 'object' || Array.isArray(d)) errors.duration = 'Duration must be an object with value and unit.'
    else if (!Number.isInteger(d.value) || d.value < 1 || d.value > 1000) errors.duration = 'Duration value must be a whole number from 1 to 1000.'
    else if (!UNITS.includes(d.unit)) errors.duration = `Duration unit must be one of: ${UNITS.join(', ')}.`
    else duration = { value: d.value, unit: d.unit }
  }

  // severity: optional
  let severity
  if (body.severity !== undefined) {
    if (!SEVERITIES.includes(body.severity)) errors.severity = `Severity must be one of: ${SEVERITIES.join(', ')}.`
    else severity = body.severity
  }

  if (!errors.symptoms && !errors.description && symptoms.length === 0 && description === '') {
    errors.symptoms = 'Provide at least one symptom or a description.'
  }

  if (Object.keys(errors).length > 0) return { errors }
  const values = { symptoms, description }
  if (duration) values.duration = duration
  if (severity) values.severity = severity
  return { values }
}