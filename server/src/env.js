// Loads the .env file from the project root into process.env.
// It must be imported FIRST (before any file that reads settings).
import dotenv from 'dotenv'

dotenv.config({ path: new URL('../../.env', import.meta.url) })