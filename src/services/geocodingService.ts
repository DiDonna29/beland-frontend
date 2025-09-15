// Lightweight client-side geocoding helpers for Google Places/Geocoding
// Note: When used from the browser, ensure your API key is restricted to your domain
// and set the env variable REACT_APP_GOOGLE_MAPS_API_KEY in your build environment.
import { Platform } from "react-native";

type Suggestion = { description: string; place_id: string };
type NormalizedAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

// Support multiple environment variable names (Expo public, CRA-style REACT_APP_, or generic)
const API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  "";
const PLACES_AUTOCOMPLETE =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const PLACE_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";

const _cache = new Map<string, any>();

async function fetchJson(url: string) {
  if (_cache.has(url)) return _cache.get(url);
  const res = await fetch(url);
  const json = await res.json();
  _cache.set(url, json);
  return json;
}

// Load Google Maps JS SDK dynamically on web
let _mapsLoader: Promise<void> | null = null;
function loadGoogleMapsScript(): Promise<void> {
  if (!Platform || Platform.OS !== "web") return Promise.resolve();
  if ((global as any).google && (global as any).google.maps)
    return Promise.resolve();
  if (_mapsLoader) return _mapsLoader;
  if (!API_KEY) return Promise.reject(new Error("Google Maps API key missing"));

  _mapsLoader = new Promise((resolve, reject) => {
    const callbackName = `__gmaps_onload_${Date.now()}`;
    (window as any)[callbackName] = () => {
      resolve();
      try {
        delete (window as any)[callbackName];
      } catch (e) {}
    };
    const script = document.createElement("script");
    // Use recommended loading patterns (loading=async) and a stable weekly version
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      API_KEY
    )}&libraries=places&callback=${callbackName}&language=es&loading=async&v=weekly`;
    script.async = true;
    script.onerror = (err) => {
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return _mapsLoader;
}

export async function autocomplete(query: string): Promise<Suggestion[]> {
  if (!query || query.trim().length < 2) return [];
  // Prefer JS SDK on web to avoid CORS issues and take advantage of Places Autocomplete service
  if (Platform && Platform.OS === "web") {
    try {
      await loadGoogleMapsScript();
      const g = (window as any).google;
      // Prefer new AutocompleteSuggestion API when available
      try {
        if (g.maps && g.maps.places && g.maps.places.AutocompleteSuggestion) {
          const asm = new g.maps.places.AutocompleteSuggestion();
          return await new Promise<Suggestion[]>((resolve) => {
            asm.getPlacePredictions({ input: query }, (preds: any[]) => {
              if (!preds || preds.length === 0) return resolve([]);
              resolve(
                preds.map((p) => ({
                  description: p.description,
                  place_id: p.place_id,
                }))
              );
            });
          });
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback to AutocompleteService when AutocompleteSuggestion not available
      const service = new g.maps.places.AutocompleteService();
      return await new Promise<Suggestion[]>((resolve) => {
        service.getPlacePredictions(
          { input: query, types: ["address"], componentRestrictions: {} },
          (preds: any[], status: any) => {
            if (!preds || preds.length === 0) return resolve([]);
            resolve(
              preds.map((p) => ({
                description: p.description,
                place_id: p.place_id,
              }))
            );
          }
        );
      });
    } catch (e) {
      console.warn(
        "Places JS SDK failed, falling back to REST autocomplete",
        e
      );
    }
  }

  if (!API_KEY) return [];
  const url = `${PLACES_AUTOCOMPLETE}?input=${encodeURIComponent(
    query
  )}&types=address&language=es&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!json || !Array.isArray(json.predictions)) return [];
  return json.predictions.map((p: any) => ({
    description: p.description,
    place_id: p.place_id,
  }));
}

function extractComponents(components: any[]): NormalizedAddress {
  const get = (type: string) => {
    const c = components.find((x) => x.types && x.types.includes(type));
    return c ? c.long_name : undefined;
  };
  const streetNumber = get("street_number");
  const route = get("route");
  const street = route
    ? streetNumber
      ? `${route} ${streetNumber}`
      : route
    : undefined;
  return {
    street,
    city:
      get("locality") ||
      get("sublocality") ||
      get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    postalCode: get("postal_code"),
    country: get("country"),
  };
}

export async function getPlaceDetails(
  placeId: string
): Promise<NormalizedAddress | null> {
  // On web use PlacesService to fetch place details (avoids CORS/rest issues)
  if (Platform && Platform.OS === "web") {
    try {
      await loadGoogleMapsScript();
      return await new Promise<NormalizedAddress | null>((resolve) => {
        const mapEl = document.createElement("div");
        const service = new (window as any).google.maps.places.PlacesService(
          mapEl
        );
        service.getDetails(
          { placeId, fields: ["address_component", "geometry"] },
          (res: any, status: any) => {
            if (!res || !res.address_components) return resolve(null);
            const comps = res.address_components || [];
            const geom = res.geometry?.location;
            const normalized = extractComponents(comps);
            if (geom) {
              normalized.lat = geom.lat();
              normalized.lng = geom.lng();
            }
            resolve(normalized);
          }
        );
      });
    } catch (e) {
      console.warn("PlacesService failed, falling back to REST details", e);
    }
  }

  if (!API_KEY) return null;
  const url = `${PLACE_DETAILS}?place_id=${encodeURIComponent(
    placeId
  )}&language=es&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!json || !json.result) return null;
  const comps = json.result.address_components || [];
  const geom = json.result.geometry?.location;
  const normalized = extractComponents(comps);
  if (geom) {
    normalized.lat = geom.lat;
    normalized.lng = geom.lng;
  }
  return normalized;
}

export async function geocodeTextAddress(
  text: string
): Promise<NormalizedAddress | null> {
  if (!API_KEY) return null;
  const url = `${GEOCODE}?address=${encodeURIComponent(
    text
  )}&language=es&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!json || !Array.isArray(json.results) || json.results.length === 0)
    return null;
  const best = json.results[0];
  const comps = best.address_components || [];
  const geom = best.geometry?.location;
  const normalized = extractComponents(comps);
  if (geom) {
    normalized.lat = geom.lat;
    normalized.lng = geom.lng;
  }
  return normalized;
}

export async function validateAddress(
  address: Partial<NormalizedAddress>
): Promise<{ ok: boolean; normalized?: NormalizedAddress; reason?: string }> {
  // Simple validation: geocode combined string and compare presence of city/state/country/postalCode
  const text = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ");
  if (!text) return { ok: false, reason: "Dirección vacía" };
  const normalized = await geocodeTextAddress(text);
  if (!normalized) return { ok: false, reason: "No se encontró coincidencia" };
  // Very permissive check: ensure same country and city (if provided)
  if (
    address.country &&
    normalized.country &&
    address.country.toLowerCase() !== normalized.country.toLowerCase()
  ) {
    return { ok: false, normalized, reason: "País no coincide" };
  }
  if (
    address.city &&
    normalized.city &&
    address.city.toLowerCase() !== normalized.city.toLowerCase()
  ) {
    return { ok: false, normalized, reason: "Ciudad no coincide" };
  }
  return { ok: true, normalized };
}

export default {
  autocomplete,
  getPlaceDetails,
  geocodeTextAddress,
  validateAddress,
};
