import { Router } from 'express'
import { pool, missingDbSettings } from '../db/pool.js'

const router = Router()

// GET /api/db-health -> runs a real query against PostgreSQL.
// It only says "ok" if the database actually answered.
router.get('/', async (req, res) => {
  const missing = missingDbSettings()
  if (missing.length > 0) {
    return res.status(503).json({
      status: 'error',
      database: 'not_configured',
      error: `Database settings missing: ${missing.join(', ')}. See .env.example.`,
    })
  }

  try {
    await pool.query('SELECT 1 AS ok')
    res.json({
      status: 'ok',
      database: 'connected',
      checkedAt: new Date().toISOString(),
    })
  } catch (err) {
    // Log only the error code, never connection details or passwords.
    console.error('db-health check failed:', err.code ?? 'unknown error')
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      error: 'Could not reach the database. Check that PostgreSQL is running and the DB_* settings are correct.',
    })
  }
})

router.all('/', (req, res) => {
  res.set('Allow', 'GET').status(405).json({ error: 'Method not allowed. Use GET.' })
})

export default router