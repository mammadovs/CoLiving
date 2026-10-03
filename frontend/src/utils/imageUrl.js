export function getImageUrl(url) {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const cleanPath = url.replace(/^\//, '');
  const path = cleanPath.startsWith('static/') ? cleanPath : `static/${cleanPath}`;
  return `${BACKEND_URL}/${path}`;
}
