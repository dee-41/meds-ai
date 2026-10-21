// Tiny in-memory limiter: each logged-in user may make `max` requests per `windowMs`.
// It protects your AI bill. (Memory is per server process and resets on restart.)
export function rateLimitPerUser({ windowMs, max }) {
  const hits = new Map() // userId -> array of request times

  return (req, res, next) => {
    const now = Date.now()
    const key = String(req.session.userId)
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

    if (recent.length >= max) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - recent[0])) / 1000)
      res.set('Retry-After', String(retryAfterSeconds))
      return res.status(429).json({
        error: `You have reached the limit of ${max} analyses per ${Math.round(windowMs / 60000)} minutes. Please wait and try again.`,
        code: 'user_rate_limited',
        retryAfterSeconds,
      })
    }
    recent.push(now)
    hits.set(key, recent)
    next()
  }
}