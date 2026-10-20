import { useEffect, useState } from 'react'
import { API_URL } from '../config.js'
import './BackendStatus.css'

// Asks the real backend (GET /api/health) whether it is running.
// status is 'loading', 'connected' or 'disconnected'.
export default function BackendStatus() {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0) // changing this re-runs the check

  useEffect(() => {
    let cancelled = false

    async function check() {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000) // give up after 4 seconds
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal })
        const data = await res.json()
        if (!cancelled) setStatus(res.ok && data.status === 'ok' ? 'connected' : 'disconnected')
      } catch {
        if (!cancelled) setStatus('disconnected')
      } finally {
        clearTimeout(timer)
      }
    }

    check()
    const interval = setInterval(check, 15000) // re-check every 15 seconds
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return (
    <div className={`backend-status ${status}`} role="status">
      <span className="status-dot" aria-hidden="true" />
      {status === 'loading' && <span>Checking backend connection...</span>}
      {status === 'connected' && <span>Backend connected</span>}
      {status === 'disconnected' && (
        <>
          <span>Backend not reachable at {API_URL}. Start it with &quot;npm run server&quot;.</span>
          <button type="button" onClick={retry}>Retry</button>
        </>
      )}
    </div>
  )
}