// Builds the Express app: CORS, JSON parsing, routes and error handling.
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import dbHealthRouter from './routes/dbHealth.js'
import authRouter from './routes/auth.js'
import symptomsRouter from './routes/symptoms.js'
import { createSessionMiddleware } from './session.js'

const app = express()

// CORS: only the local React dev server may call this API from a browser.
// CLIENT_ORIGIN can hold several addresses separated by commas.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
// credentials: true lets the browser send the login cookie to this API.
app.use(cors({ origin: allowedOrigins, credentials: true }))

// Behind a proxy in production (needed for secure cookies to work).
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

// Read JSON request bodies, but refuse anything larger than 100 KB.
app.use(express.json({ limit: '100kb' }))

// Routes
app.use('/api/health', healthRouter)
app.use('/api/db-health', dbHealthRouter)
// Sessions are only loaded for routes that need them, so health checks never depend on them.
const sessionMiddleware = createSessionMiddleware()
app.use('/api/auth', sessionMiddleware, authRouter)
app.use('/api/symptoms', sessionMiddleware, symptomsRouter)

// Anything else under /api does not exist.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` })
})

// Error handler: must be last. Turns errors into clear JSON responses.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' })
  }
  // Database not reachable: say so honestly instead of a vague 500.
  if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01', '57P03', '28P01', '3D000'].includes(err.code) ||
      /timeout exceeded when trying to connect|Connection terminated/.test(err.message ?? '')) {
    console.error('Database unavailable:', err.code ?? 'connection error')
    return res.status(503).json({ error: 'The database is not available right now.' })
  }
  // Log only the error type, never request bodies (they may hold passwords).
  console.error('Unexpected error:', err.code ?? err.name)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

export default app