// Entry point: reads settings and starts the server.
import './env.js' // must stay first: loads .env before the other files read settings
import app from './app.js'

const port = Number(process.env.PORT ?? 5000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT "${process.env.PORT}". Use a whole number between 1 and 65535.`)
  process.exit(1)
}

const server = app.listen(port, () => {
  console.log(`MEDS-AI server running at http://localhost:${port}`)
})

// Give a clear message instead of a long error if the port is already used.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other program or set a different PORT in .env.`)
  } else {
    console.error('Server failed to start:', err.message)
  }
  process.exit(1)
})