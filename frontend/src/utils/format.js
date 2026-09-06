import { BASE_URL } from '../api/client.js';

/**
 * Qiymət formatı köməkçi funksiyaları
 * Backend-dən gələn Decimal/string dəyərlərini istifadəçi dostu formata çevirir.
 */

/**
 * formatPrice(value) — "450.0000000000" → "450"  |  "1200.50" → "1,201"
 *
 * - Sıfırla bitən onluq hissəni kəsir (450.00 → "450")
 * - İki onluq hissə istifadəçi üçün mənalıdırsa saxlayır (450.50 → "450.50")
 * - Minlik ayırıcısı əlavə edir (1200 → "1,200")
 * - Yanlış dəyərlərdə (null/undefined/NaN) boş string qaytarır
 *
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);

  // Onluq hissə 0-dırsa tam ədəd kimi göstər, əks halda max 2 onluq rəqəm
  const formatted = num % 1 === 0
    ? num.toFixed(0)
    : num.toFixed(2).replace(/\.?0+$/, ''); // "450.50" qalar, "450.10" → "450.1"

  // Minlik ayırıcısı (locale-independent)
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * formatPriceLabel(value) — "450.0000000000" → "450 AZN/ay"
 *
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function formatPriceLabel(value) {
  const p = formatPrice(value);
  return p ? `${p} AZN/ay` : '— AZN/ay';
}

/**
 * resolveImageUrl(imageObj, baseUrl) — nisbi URL-i tam URL-ə çevirir.
 *
 * Backend ListingImageResponse: { id: 1, image_url: "/static/listing_images/xxx.jpg" }
 * Bu funksiya image_url field-ini baseUrl ilə birləşdirir.
 *
 * @param {object|string|null} imageObj  — ya `{ image_url: "..." }` object, ya da birbaşa URL string
 * @param {string} [baseUrl]            — default: import.meta.env.VITE_API_URL || BASE_URL || "http://127.0.0.1:8000"
 * @returns {string|null}
 */
export function resolveImageUrl(imageObj, baseUrl) {
  const base = baseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || BASE_URL || 'http://127.0.0.1:8000';

  if (!imageObj) return null;

  // Əgər birbaşa string gəlirsə
  const rawUrl = typeof imageObj === 'string' ? imageObj : imageObj.image_url;

  if (!rawUrl) return null;

  // Artıq tam URL-dirsə (http/https ilə başlayırsa) — olduğu kimi qaytar
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // Nisbi yolsa — base URL ilə birləşdir
  const separator = rawUrl.startsWith('/') ? '' : '/';
  return `${base}${separator}${rawUrl}`;
}

/**
 * getListingThumbnail(listing, baseUrl) — listing-in ilk şəkilini tam URL kimi qaytarır,
 * şəkil yoxdursa null qaytarır.
 *
 * @param {object} listing
 * @param {string} [baseUrl]
 * @returns {string|null}
 */
export function getListingThumbnail(listing, baseUrl) {
  if (!listing?.images || listing.images.length === 0) return null;
  return resolveImageUrl(listing.images[0], baseUrl);
}
