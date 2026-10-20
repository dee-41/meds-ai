// Where the backend lives. Set VITE_API_URL in a .env file to change it.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')