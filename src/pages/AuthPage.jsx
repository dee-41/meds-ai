import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import './AuthPage.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One page component for both "login" and "register" (set by the mode prop).
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { user, status, login, register, logout } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Quick checks in the browser. The server checks everything again.
  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    else if (isRegister && password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (isRegister && confirm !== password) errors.confirm = 'Passwords do not match.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = isRegister ? await register(email, password) : await login(email, password)
    setSubmitting(false)

    if (result.ok) {
      setSuccess(isRegister ? 'Your account was created and you are signed in.' : 'Welcome back. You are signed in.')
      setPassword('')
      setConfirm('')
    } else {
      setFieldErrors(result.fields ?? {})
      setFormError(result.error)
    }
  }

  async function handleLogout() {
    const result = await logout()
    if (!result.ok) setFormError(result.error)
    else setSuccess('')
  }

  let content
  if (status === 'loading') {
    content = <p role="status">Checking your session...</p>
  } else if (user) {
    // Shown only when the server has confirmed who is logged in.
    content = (
      <div className="auth-done">
        {success && <p className="auth-success" role="status">{success}</p>}
        <p>You are signed in as <strong>{user.email}</strong>.</p>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="auth-actions">
          <a className="btn btn-primary" href="#/predict">Go to Symptom Checker</a>
          <button type="button" className="btn auth-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    )
  } else {
    content = (
      <form onSubmit={handleSubmit} noValidate>
        {status === 'unreachable' && (
          <p className="form-error" role="alert">
            The server could not be reached, so sign-in will not work right now. Start the backend and reload.
          </p>
        )}

        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" autoComplete="email" value={email}
            aria-invalid={Boolean(fieldErrors.email)} onChange={(e) => setEmail(e.target.value)} />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" value={password}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            aria-invalid={Boolean(fieldErrors.password)} onChange={(e) => setPassword(e.target.value)} />
          {isRegister && <p className="field-hint">At least 8 characters.</p>}
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>

        {isRegister && (
          <div className="field">
            <label htmlFor="auth-confirm">Confirm password</label>
            <input id="auth-confirm" type="password" autoComplete="new-password" value={confirm}
              aria-invalid={Boolean(fieldErrors.confirm)} onChange={(e) => setConfirm(e.target.value)} />
            {fieldErrors.confirm && <p className="field-error">{fieldErrors.confirm}</p>}
          </div>
        )}

        {formError && <p className="form-error" role="alert">{formError}</p>}

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? (isRegister ? 'Creating account...' : 'Logging in...') : (isRegister ? 'Create account' : 'Login')}
        </button>

        <p className="auth-switch">
          {isRegister
            ? <>Already have an account? <a href="#/login">Login</a></>
            : <>New to MEDS-AI? <a href="#/register">Create an account</a></>}
        </p>
      </form>
    )
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>{isRegister ? 'Create your account' : 'Login'}</h1>
          {content}
        </div>
      </div>
    </div>
  )
}