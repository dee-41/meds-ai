// Put this in front of any route that needs a logged-in user:
//   router.get('/something', requireAuth, handler)
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ authenticated: false, error: 'You need to log in.' })
  }
  next()
}