/**
 * Geocoding via OpenStreetMap Nominatim (no API key).
 * Rate limit: 1 request per second for Nominatim usage policy.
 * Requires a valid User-Agent; requests without one may be blocked.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'AngelMarketplaceApp/1.0 (https://angelmarketplace.com; contact@angelmarketplace.com)';

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
}

const nominatimHeaders: HeadersInit = {
  'User-Agent': USER_AGENT,
  Accept: 'application/json',
  'Accept-Language': 'en',
};

/** Address (search query) → single result (for Enter / exact search) */
export async function geocode(query: string): Promise<GeoResult | null> {
  const results = await geocodeSearch(query, 1);
  return results.length > 0 ? results[0] : null;
}

/** Address (search query) → list of results (for suggestions while typing) */
export async function geocodeSearch(query: string, limit = 5): Promise<GeoResult[]> {
  const trimmed = query?.trim() ?? '';
  if (trimmed.length < 3) return [];
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(trimmed)}&format=json&limit=${limit}`;
    const res = await fetch(url, { headers: nominatimHeaders });
    if (!res.ok) {
      if (__DEV__) console.warn('[geocodeSearch] Nominatim error:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: { lat: string; lon: string; display_name?: string }) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name ?? `${item.lat}, ${item.lon}`,
    }));
  } catch (e) {
    if (__DEV__) console.warn('[geocodeSearch] Failed:', e);
    return [];
  }
}

/** Coordinates → address (display name). Returns fallback "lat, lon" if API fails. */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const fallback = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: nominatimHeaders });
    if (!res.ok) {
      if (__DEV__) console.warn('[reverseGeocode] Nominatim error:', res.status, res.statusText);
      return fallback;
    }
    const data = await res.json();
    const name = data?.display_name ?? fallback;
    return typeof name === 'string' ? name : fallback;
  } catch (e) {
    if (__DEV__) console.warn('[reverseGeocode] Failed:', e);
    return fallback;
  }
}
