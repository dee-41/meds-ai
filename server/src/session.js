// Session setup: sessions are stored in PostgreSQL and referenced by an
// HTTP-only cookie. The browser only ever holds a random session id.
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { pool, missingDbSettings } from './db/pool.js'

const PgStore = connectPgSimple(session)

export const COOKIE_NAME = 'meds.sid'

// Returns a text describing what is missing, or null if auth can work.
export function authConfigProblem() {
  const missing = missingDbSettings()
  if (missing.length > 0) return `Database settings missing: ${missing.join(', ')}.`
  if ((process.env.SESSION_SECRET ?? '').length < 32) {
    return 'SESSION_SECRET is missing or shorter than 32 characters.'
  }
  return null
}

// Cookie settings. Local development: SameSite=Lax over plain http.
// Production (NODE_ENV=production): the cookie is sent over https only.
// If frontend and backend live on different sites, set SESSION_SAMESITE=none (needs https).
function cookieOptions() {
  const sameSite = ['lax', 'strict', 'none'].includes(process.env.SESSION_SAMESITE)
    ? process.env.SESSION_SAMESITE
    : 'lax'
  return {
    httpOnly: true, // JavaScript in the page can never read this cookie
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}

export const cookieSettings = cookieOptions()

export function createSessionMiddleware() {
  // If auth is not configured, skip sessions. The auth routes then answer with an honest 503.
  if (authConfigProblem()) return (req, res, next) => next()
  return session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // no cookie is issued until someone logs in
    store: new PgStore({ pool, tableName: 'user_sessions' }),
    cookie: cookieSettings,
  })
}