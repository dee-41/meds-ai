// Run with "npm run db:setup". Creates the tables from schema.sql (if missing).
import '../env.js'
import { readFile } from 'node:fs/promises'
import { pool, missingDbSettings } from './pool.js'

const missing = missingDbSettings()
if (missing.length > 0) {
  console.error(`Database settings missing: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`)
  process.exit(1)
}

try {
  const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(sql)

  // Parameterized query ($1, $2): values are passed separately from the SQL text.
  const result = await pool.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = ANY($2) ORDER BY table_name',
    ['public', ['users', 'symptom_assessments']]
  )
  console.log('Schema applied. Tables present:', result.rows.map((r) => r.table_name).join(', '))
} catch (err) {
  console.error('Database setup failed:', err.code ?? err.message)
  console.error('Check that PostgreSQL is running and the DB_* settings in .env are correct.')
  process.exitCode = 1
} finally {
  await pool.end()
}