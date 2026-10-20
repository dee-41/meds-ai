import { Router } from 'express'

const router = Router()

// GET /api/health -> reports that the server process is running.
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'meds-ai-server',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// Any other method on this URL (POST, PUT, ...) is not allowed.
router.all('/', (req, res) => {
  res.set('Allow', 'GET').status(405).json({ error: 'Method not allowed. Use GET.' })
})

export default router