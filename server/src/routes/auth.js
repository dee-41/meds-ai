import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { authConfigProblem, COOKIE_NAME, cookieSettings } from '../session.js'
import { validateRegistration, validateLogin } from '../validation/auth.js'

const router = Router()

const BCRYPT_ROUNDS = 12
// Used when the email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('placeholder-not-a-real-password', BCRYPT_ROUNDS)

// Only these fields ever leave the server. The password hash never does.
function safeUser(row) {
  return { id: row.id, email: row.email, createdAt: row.created_at }
}

// Gives the user a fresh session (a new id) that remembers who they are.
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err)
      req.session.userId = userId
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()))
    })
  })
}

// Every auth route: refuse honestly if auth is not configured, and never cache responses.
router.use((req, res, next) => {
  const problem = authConfigProblem()
  if (problem) {
    return res.status(503).json({ error: `Authentication is not configured. ${problem} See .env.example.` })
  }
  res.set('Cache-Control', 'no-store')
  next()
})

// POST requests must be JSON (browsers cannot send this cross-site without CORS approval).
router.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Send the request as JSON.' })
  }
  next()
})

router.post('/register', async (req, res, next) => {
  try {
    const { errors, values } = validateRegistration(req.body)
    if (errors) return res.status(400).json({ error: 'Please fix the problems below.', fields: errors })

    const duplicateMessage = { error: 'Please fix the problems below.', fields: { email: 'An account with this email already exists.' } }

    // Application check first...
    const existing = await pool.query('SELECT 1 FROM users WHERE lower(email) = $1', [values.email])
    if (existing.rowCount > 0) return res.status(409).json(duplicateMessage)

    const passwordHash = await bcrypt.hash(values.password, BCRYPT_ROUNDS)

    let user
    try {
      const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [values.email, passwordHash]
      )
      user = result.rows[0]
    } catch (err) {
      // ...and the database's unique index is the final safety net (two sign-ups at once).
      if (err.code === '23505') return res.status(409).json(duplicateMessage)
      throw err
    }

    await startSession(req, user.id)
    res.status(201).json({ user: safeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { errors, values } = validateLogin(req.body)
    if (errors) return res.status(400).json({ error: 'Please fix the problems below.', fields: errors })

    const result = await pool.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE lower(email) = $1',
      [values.email]
    )
    const row = result.rows[0]
    const passwordMatches = await bcrypt.compare(values.password, row ? row.password_hash : DUMMY_HASH)

    // Same message for "no such email" and "wrong password" so attackers learn nothing.
    if (!row || !passwordMatches) return res.status(401).json({ error: 'Incorrect email or password.' })

    await startSession(req, row.id)
    res.json({ user: safeUser(row) })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    // Clear the cookie in the browser (must not carry maxAge, or it would be kept).
    const { maxAge, ...clearSettings } = cookieSettings
    res.clearCookie(COOKIE_NAME, clearSettings)
    res.json({ message: 'Logged out.' })
  })
})

// Who am I? Protected by requireAuth, then confirmed against the database.
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.session.userId])
    if (result.rowCount === 0) {
      // The account no longer exists, so the session is worthless.
      return req.session.destroy(() => res.status(401).json({ authenticated: false, error: 'You need to log in.' }))
    }
    res.json({ authenticated: true, user: safeUser(result.rows[0]) })
  } catch (err) {
    next(err)
  }
})

export default router