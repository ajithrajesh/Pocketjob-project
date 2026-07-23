// Lightweight geocoding helper used to turn a job/user's typed location
// (city, district, state, pincode) into approximate coordinates so we can
// support "jobs near me" radius search. Uses OpenStreetMap's free Nominatim
// API — no API key required, but usage must stay polite (one request at a
// time, identifying User-Agent, best-effort only).

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Attempts to geocode a location made up of free-text parts.
 * Returns { lat, lng } on success, or null if it can't be resolved
 * (missing input, network issue, no match, etc). Never throws —
 * geocoding is a best-effort enhancement, not a required step.
 */
export const geocodeLocation = async ({ city, district, state, pincode, country = "India" } = {}) => {
  const parts = [city, district, state, pincode, country].map((p) => (p || "").trim()).filter(Boolean);

  // Need at least one real location part (besides the default country)
  if (parts.length <= 1) {
    console.log("[geocode] Skipped — not enough address parts:", { city, district, state, pincode });
    return null;
  }

  const query = parts.join(", ");

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
    console.log(`[geocode] Requesting: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PocketJob-App/1.0 (job search platform; contact via app support)",
        "Accept-Language": "en",
      },
    });

    console.log(`[geocode] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const body = await response.text().catch(() => "<unreadable body>");
      console.log(`[geocode] Non-OK response body: ${body.slice(0, 300)}`);
      return null;
    }

    const results = await response.json();
    console.log(`[geocode] Result count: ${Array.isArray(results) ? results.length : "not an array"}`);

    if (!Array.isArray(results) || results.length === 0) {
      console.log(`[geocode] No match found for query: "${query}"`);
      return null;
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.log("[geocode] Result had invalid lat/lon:", results[0]);
      return null;
    }

    console.log(`[geocode] Success: "${query}" -> ${lat}, ${lng}`);
    return { lat, lng };
  } catch (error) {
    console.error(`[geocode] Request threw an error for query "${query}":`, error.message);
    return null;
  }
};

/**
 * Builds the location subdocument (including lat/lng/geo) for a job.
 *
 * If the poster already supplied coordinates (from the browser's
 * geolocation, or typed in manually), those are trusted as-is and no
 * geocoding call is made. Otherwise, falls back to best-effort
 * geocoding of the typed address (city/district/state/pincode), which
 * requires outbound network access to Nominatim and can fail silently
 * in some hosting environments — so manual/geolocation coordinates are
 * the more reliable path.
 */
export const buildGeocodedLocation = async (locationInput = {}) => {
  const { state = "", district = "", city = "", pincode = "", lat, lng } = locationInput || {};

  const providedLat = parseFloat(lat);
  const providedLng = parseFloat(lng);
  const hasValidProvidedCoords =
    !Number.isNaN(providedLat) &&
    !Number.isNaN(providedLng) &&
    providedLat >= -90 &&
    providedLat <= 90 &&
    providedLng >= -180 &&
    providedLng <= 180;

  if (hasValidProvidedCoords) {
    return {
      state,
      district,
      city,
      pincode,
      lat: providedLat,
      lng: providedLng,
      geo: { type: "Point", coordinates: [providedLng, providedLat] },
    };
  }

  const geoResult = await geocodeLocation({ city, district, state, pincode });

  return {
    state,
    district,
    city,
    pincode,
    lat: geoResult?.lat ?? null,
    lng: geoResult?.lng ?? null,
    geo: geoResult
      ? { type: "Point", coordinates: [geoResult.lng, geoResult.lat] }
      : undefined,
  };
};
