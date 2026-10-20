// One shared connection pool for the whole backend.
// Import { pool } wherever you need to talk to PostgreSQL.
import pg from 'pg'

const { Pool } = pg

// The settings that must be filled in (see .env.example).
export const REQUIRED_DB_SETTINGS = ['DB_NAME', 'DB_USER', 'DB_PASSWORD']

export function missingDbSettings() {
  return REQUIRED_DB_SETTINGS.filter((name) => !process.env[name])
}

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,                        // at most 10 connections open at once
  idleTimeoutMillis: 30000,       // close connections unused for 30 seconds
  connectionTimeoutMillis: 3000,  // give up after 3 seconds if the database does not answer
})

// If an idle connection breaks (for example the database restarts), log a short
// note instead of crashing the server. Only the error code is logged.
pool.on('error', (err) => {
  console.error('Database connection problem:', err.code ?? 'unknown error')
})