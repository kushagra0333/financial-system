// Use VITE_API_URL if defined, otherwise fallback to localhost for development.
// In production (monolithic Docker), VITE_API_URL will be set to an empty string to use relative paths.
const envApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = typeof envApiUrl === 'string' ? envApiUrl : 'http://localhost:8000';
