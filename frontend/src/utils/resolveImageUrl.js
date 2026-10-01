/**
 * Resolves a backend image path to a fully-qualified URL.
 *
 * Handles three cases:
 *  1. Already absolute (http/https) → return as-is.
 *  2. Relative path without leading slash → prepend BASE_URL + "/static/" if needed.
 *  3. Falsy value → return null so callers can use a fallback image.
 *
 * The base URL is read from the VITE_API_URL env variable (set in .env /
 * .env.local). Falls back to http://localhost:8000 for local development.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * @param {string | null | undefined} imagePath - Raw image path/URL from the API.
 * @returns {string | null} Fully-qualified URL, or null if no path provided.
 */
export function resolveImageUrl(imagePath) {
  if (!imagePath) return null

  // Already a full URL (e.g. an external CDN or a data: URI)
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
    return imagePath
  }

  // Strip a leading slash to avoid double-slash in the final URL
  const stripped = imagePath.replace(/^\//, '')

  // Ensure the "static/" prefix is present (backend serves uploads under /static/)
  const withPrefix = stripped.startsWith('static/') ? stripped : `static/${stripped}`

  return `${BASE_URL}/${withPrefix}`
}
