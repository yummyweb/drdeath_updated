/**
 * Central env config for Vite. Only VITE_* variables are exposed to the client.
 * Set VITE_BACKEND_URL in .env (e.g. VITE_BACKEND_URL=http://localhost:8000).
 */
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL != null && import.meta.env.VITE_BACKEND_URL !== ''
    ? import.meta.env.VITE_BACKEND_URL
    : 'http://localhost:8000';

export const getBackendUrl = () => BACKEND_URL;
export const getApiUrl = () => `${BACKEND_URL}/api`;
export const isDev = import.meta.env.DEV;
