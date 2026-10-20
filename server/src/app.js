// Builds the Express app: CORS, JSON parsing, routes and error handling.
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import dbHealthRouter from './routes/dbHealth.js'

const app = express()

// CORS: only the local React dev server may call this API from a browser.
// CLIENT_ORIGIN can hold several addresses separated by commas.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
app.use(cors({ origin: allowedOrigins }))

// Read JSON request bodies, but refuse anything larger than 100 KB.
app.use(express.json({ limit: '100kb' }))

// Routes
app.use('/api/health', healthRouter)
app.use('/api/db-health', dbHealthRouter)

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
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

export default app