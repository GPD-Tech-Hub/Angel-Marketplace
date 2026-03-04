/**
 * Geocoding via Google Places API (New) — comprehensive global coverage
 * including Nigerian estates, UK postcodes, US addresses, etc.
 *
 * Uses:
 *   POST https://places.googleapis.com/v1/places:autocomplete  — search suggestions
 *   GET  https://places.googleapis.com/v1/places/:id           — place details (lat/lon + address)
 *   GET  https://maps.googleapis.com/maps/api/geocode/json      — reverse geocode
 */

const GOOGLE_KEY =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GOOGLE_PLACES_KEY) ||
  'AIzaSyDgskNxdPZpq2N06DzY2IrGDHcFF9bddYg';

const PLACES_BASE = 'https://places.googleapis.com/v1';
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

export interface GeoResult {
  lat: number;
  lon: number;
  placeId?: string;
  /** Full human-readable address */
  displayName: string;
  /** Short primary label — estate/street name */
  primaryLine: string;
  /** Secondary label — city, state, country */
  secondaryLine: string;
  // Structured fields for saving
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface SearchSuggestion {
  placeId: string;
  primaryLine: string;
  secondaryLine: string;
  fullText: string;
}

// ── Autocomplete (fast, no coordinates yet) ──────────────────────────────────

export async function searchSuggestions(query: string, limit = 8): Promise<SearchSuggestion[]> {
  const trimmed = query?.trim() ?? '';
  if (trimmed.length < 2) return [];
  try {
    const res = await fetch(`${PLACES_BASE}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
      },
      body: JSON.stringify({
        input: trimmed,
        languageCode: 'en',
      }),
    });
    if (!res.ok) {
      if (__DEV__) console.warn('[searchSuggestions] Google error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const suggestions = data?.suggestions ?? [];
    return suggestions
      .slice(0, limit)
      .map((s: any) => {
        const p = s?.placePrediction;
        if (!p) return null;
        return {
          placeId: p.placeId,
          primaryLine: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
          secondaryLine: p.structuredFormat?.secondaryText?.text ?? '',
          fullText: p.text?.text ?? '',
        } as SearchSuggestion;
      })
      .filter(Boolean) as SearchSuggestion[];
  } catch (e) {
    if (__DEV__) console.warn('[searchSuggestions] Failed:', e);
    return [];
  }
}

// ── Place Details (get coordinates + structured address from placeId) ─────────

export async function placeDetails(placeId: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `${PLACES_BASE}/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents',
        },
      }
    );
    if (!res.ok) {
      if (__DEV__) console.warn('[placeDetails] Google error:', res.status);
      return null;
    }
    const d = await res.json();
    return parseGooglePlace(d);
  } catch (e) {
    if (__DEV__) console.warn('[placeDetails] Failed:', e);
    return null;
  }
}

function parseGooglePlace(d: any): GeoResult | null {
  const lat = d?.location?.latitude;
  const lon = d?.location?.longitude;
  if (lat == null || lon == null) return null;

  const components: { longText: string; types: string[] }[] = d?.addressComponents ?? [];

  const get = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types?.includes(t)))?.longText ?? '';

  const streetNumber = get('street_number');
  const route = get('route');
  const neighborhood = get('neighborhood', 'sublocality_level_1', 'sublocality');
  const locality = get('locality', 'administrative_area_level_2');
  const adminArea1 = get('administrative_area_level_1');
  const country = get('country');
  const postcode = get('postal_code');

  const streetLine = streetNumber && route
    ? `${streetNumber} ${route}`
    : route || neighborhood || '';

  const cityLine = locality || adminArea1 || '';

  const displayName = d?.formattedAddress ?? [streetLine, cityLine, country].filter(Boolean).join(', ');
  const primaryLine = d?.displayName?.text ?? (streetLine || cityLine);
  const secondaryLine = [cityLine, country].filter(Boolean).join(', ');

  return {
    lat,
    lon,
    placeId: d?.id,
    displayName,
    primaryLine,
    secondaryLine,
    street: streetLine || neighborhood,
    city: cityLine,
    state: adminArea1,
    postcode,
    country,
  };
}

// ── Combined search (autocomplete → details on selection) ────────────────────
// For backward compat: geocodeSearch returns GeoResults directly (fetches details for each).
// This is slower but keeps the same interface. Use searchSuggestions + placeDetails
// in the UI for better UX (details only on tap).

export async function geocodeSearch(query: string, limit = 8): Promise<GeoResult[]> {
  const suggestions = await searchSuggestions(query, limit);
  if (suggestions.length === 0) return [];

  // Return lightweight results with no lat/lon yet — populate on select
  return suggestions.map((s) => ({
    lat: 0,
    lon: 0,
    placeId: s.placeId,
    displayName: s.fullText,
    primaryLine: s.primaryLine,
    secondaryLine: s.secondaryLine,
  }));
}

// ── Reverse geocode (coordinates → address) ──────────────────────────────────

export async function reverseGeocodeResult(lat: number, lon: number): Promise<GeoResult | null> {
  try {
    const url = `${GEOCODE_BASE}?latlng=${lat},${lon}&key=${GOOGLE_KEY}&language=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK') return null;
    const result = data.results?.[0];
    if (!result) return null;
    return parseGooglePlace({
      location: { latitude: lat, longitude: lon },
      formattedAddress: result.formatted_address,
      addressComponents: result.address_components?.map((c: any) => ({
        longText: c.long_name,
        types: c.types,
      })),
      displayName: { text: result.formatted_address?.split(',')[0] ?? '' },
    });
  } catch (e) {
    if (__DEV__) console.warn('[reverseGeocodeResult] Failed:', e);
    return null;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const result = await reverseGeocodeResult(lat, lon);
  return result?.displayName ?? null;
}

export async function geocode(query: string): Promise<GeoResult | null> {
  const suggestions = await searchSuggestions(query, 1);
  if (!suggestions[0]) return null;
  return placeDetails(suggestions[0].placeId);
}
