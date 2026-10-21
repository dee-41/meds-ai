// Server-side checks for registration and login input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Trim spaces and lowercase, so "Me@Mail.com " and "me@mail.com" are the same account.
export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function checkEmail(email) {
  if (!email) return 'Email is required.'
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return null
}

export function validateRegistration(body) {
  const errors = {}
  const email = normalizeEmail(body?.email)
  const password = body?.password

  const emailProblem = checkEmail(email)
  if (emailProblem) errors.email = emailProblem

  if (typeof password !== 'string' || password === '') errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  // bcrypt only uses the first 72 bytes, so longer passwords are refused instead of silently cut.
  else if (Buffer.byteLength(password, 'utf8') > 72) errors.password = 'Password must be at most 72 bytes.'

  return Object.keys(errors).length > 0 ? { errors } : { values: { email, password } }
}

export function validateLogin(body) {
  const errors = {}
  const email = normalizeEmail(body?.email)
  const password = body?.password

  if (!email) errors.email = 'Email is required.'
  if (typeof password !== 'string' || password === '') errors.password = 'Password is required.'
  else if (password.length > 128) errors.password = 'Password is too long.'

  return Object.keys(errors).length > 0 ? { errors } : { values: { email, password } }
}