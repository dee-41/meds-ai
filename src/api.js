import { API_URL } from './config.js'

// Small helper for talking to the backend.
// credentials: 'include' makes the browser send and store the login cookie.
// It never throws: it always returns { ok, status, data, networkError }.
export async function apiRequest(path, { method = 'GET', body, timeoutMs } = {}) {
  const options = { method, credentials: 'include' }
  // Optional time limit: give up if the server has not answered in time.
  const controller = new AbortController()
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null
  options.signal = controller.signal
  if (method !== 'GET') {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body ?? {})
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, options)
  } catch (err) {
    return { ok: false, status: 0, data: null, networkError: true, timedOut: err.name === 'AbortError' }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // response had no JSON body
  } finally {
    if (timer) clearTimeout(timer)
  }
  return { ok: res.ok, status: res.status, data, networkError: false }
}