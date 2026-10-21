import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { rateLimitPerUser } from '../middleware/rateLimit.js'
import { authConfigProblem } from '../session.js'
import { validateAnalysisRequest } from '../validation/symptoms.js'
import { analyzeWithProvider, AiError } from '../ai/analyzeSymptoms.js'
import { detectEmergencySigns, EMERGENCY_MESSAGE } from '../safety/emergency.js'

const router = Router()

const DISCLAIMER =
  'AI-generated health information. This is not a medical diagnosis and does not replace advice from a qualified healthcare professional.'

// Every request: needs working login setup, JSON, a logged-in user, and stays under the rate limit.
router.use((req, res, next) => {
  const problem = authConfigProblem()
  if (problem) return res.status(503).json({ error: `Authentication is not configured. ${problem} See .env.example.` })
  res.set('Cache-Control', 'no-store')
  next()
})
router.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Send the request as JSON.' })
  }
  next()
})
router.use(requireAuth)
router.use(rateLimitPerUser({ windowMs: 10 * 60 * 1000, max: 10 }))

// POST /api/symptoms/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { errors, values } = validateAnalysisRequest(req.body)
    if (errors) return res.status(400).json({ error: 'Please fix the problems below.', fields: errors })

    // Emergency check happens first and does not depend on the AI.
    const emergency = detectEmergencySigns(values)
    const safety = { emergencySignsDetected: emergency, message: emergency ? EMERGENCY_MESSAGE : null }

    try {
      const { analysis, model } = await analyzeWithProvider(values)
      if (emergency && analysis.urgency !== 'emergency') {
        analysis.urgency = 'emergency'
        analysis.urgencyRaisedBySafetyCheck = true
      }
      res.json({
        analysis,
        safety,
        meta: {
          generatedBy: 'AI',
          provider: 'Anthropic',
          model,
          generatedAt: new Date().toISOString(),
          disclaimer: DISCLAIMER,
        },
      })
    } catch (err) {
      if (!(err instanceof AiError)) throw err
      if (err.retryAfter) res.set('Retry-After', String(err.retryAfter))
      // Even when the AI fails, emergency guidance is still returned.
      res.status(err.status).json({ error: err.publicMessage, code: err.code, safety })
    }
  } catch (err) {
    next(err)
  }
})

export default router