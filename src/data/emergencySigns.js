// Shown immediately in the browser (before any AI answer) when the entered text
// contains words that can point to a medical emergency.
// The server runs the same kind of check (server/src/safety/emergency.js). Keep them in sync.
const EMERGENCY_PATTERNS = [
  /chest (pain|tightness|pressure)|pressure in (my |the )?chest/i,
  /(difficulty|trouble|struggling) (breathing|to breathe)|can(no|')?t breathe|shortness of breath|not breathing/i,
  /face droop|slurred speech|sudden (weakness|numbness|confusion|loss of vision)|worst headache/i,
  /loss of consciousness|unconscious|passed out|fainted|seizure|convulsion/i,
  /severe bleeding|bleeding (that )?(won't|will not|doesn't) stop|vomiting blood|coughing (up )?blood/i,
  /swelling of (the |my )?(face|throat|tongue|lips)|throat (is )?closing|anaphyla/i,
  /overdose|swallowed (poison|bleach)/i,
  /suicid|kill myself|end my life|harm myself|self[- ]harm/i,
]

export const EMERGENCY_MESSAGE =
  'Some of the symptoms you entered can be signs of a medical emergency. Do not wait for this analysis. ' +
  'Call your local emergency number or go to the nearest emergency department now. ' +
  'If you are thinking about harming yourself, contact emergency services or a crisis line right away.'

export function hasEmergencySigns(symptoms, description) {
  const text = [...symptoms, description].join(' \n ')
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))
}