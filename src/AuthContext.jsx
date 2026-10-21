import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from './api.js'

// Context = a way to share data (who is logged in) with any component
// without passing props through every level.
const AuthContext = createContext(null)

// Turns a server reply into something the forms can show.
function toResult(res) {
  if (res.ok) return { ok: true }
  if (res.networkError) {
    return { ok: false, error: 'Could not reach the server. Check that the backend is running.' }
  }
  return {
    ok: false,
    error: res.data?.error ?? 'Something went wrong. Please try again.',
    fields: res.data?.fields ?? {},
  }
}

export function AuthProvider({ children }) {
  // user is only ever set from a reply the server sent. Never guessed.
  const [user, setUser] = useState(null)
  // 'loading' = still asking the server, 'ready' = server answered, 'unreachable' = no answer
  const [status, setStatus] = useState('loading')

  // On page load, ask the server whether our cookie belongs to a logged-in user.
  useEffect(() => {
    let cancelled = false
    apiRequest('/api/auth/me').then((res) => {
      if (cancelled) return
      if (res.ok) setUser(res.data.user)
      if (res.networkError || res.status >= 500) setStatus('unreachable')
      else setStatus('ready') // 401 simply means "not logged in"
    })
    return () => { cancelled = true }
  }, [])

  async function register(email, password) {
    const res = await apiRequest('/api/auth/register', { method: 'POST', body: { email, password } })
    if (res.ok) setUser(res.data.user)
    return toResult(res)
  }

  async function login(email, password) {
    const res = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } })
    if (res.ok) setUser(res.data.user)
    return toResult(res)
  }

  async function logout() {
    const res = await apiRequest('/api/auth/logout', { method: 'POST' })
    if (res.ok) setUser(null) // only forget the user once the server confirmed the logout
    return toResult(res)
  }

  return (
    <AuthContext.Provider value={{ user, status, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}