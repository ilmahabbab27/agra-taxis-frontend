export type LocationPoint = {
  lat: number;
  lng: number;
};

export type LocationClassification = {
  isHillCountry: boolean;
  region: string | null;
};

export type LocationSuggestion = {
  id: string;
  label: string;
  provider: "google" | "osm";
  lat?: number;
  lng?: number;
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const SRI_LANKA_VIEWBOX = "79.4,9.9,82.1,5.7";

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
};

type GooglePlaceResponse = {
  formattedAddress?: string;
  displayName?: {
    text?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type GoogleTextSearchResponse = {
  places?: Array<{
    id?: string;
    formattedAddress?: string;
    displayName?: {
      text?: string;
    };
    location?: {
      latitude?: number;
      longitude?: number;
    };
  }>;
};

type GoogleRouteResponse = {
  routes?: Array<{
    distanceMeters?: number;
  }>;
};

type NominatimSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export function hasGoogleLocationKey() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

export async function searchLocationSuggestions(query: string, signal?: AbortSignal) {
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleResults = await searchGooglePlaces(query, signal);
      if (googleResults.length) return googleResults;

      const googleTextResults = await searchGoogleTextPlaces(query, signal);
      if (googleTextResults.length) return googleTextResults;
    } catch {
      // Fall back to OpenStreetMap search when Google is unavailable or not enabled.
    }
  }

  return searchOpenStreetMapPlaces(query, signal);
}

export async function resolveLocationSuggestion(suggestion: LocationSuggestion) {
  if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
    return {
      label: suggestion.label,
      point: {
        lat: suggestion.lat,
        lng: suggestion.lng,
      },
    };
  }

  if (suggestion.provider === "google" && GOOGLE_MAPS_API_KEY) {
    const res = await fetch(`https://places.googleapis.com/v1/places/${suggestion.id}`, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "displayName,formattedAddress,location",
      },
    });
    if (!res.ok) throw new Error("Google place details failed");

    const data = (await res.json()) as GooglePlaceResponse;
    const latitude = data.location?.latitude;
    const longitude = data.location?.longitude;
    if (latitude === undefined || longitude === undefined) {
      throw new Error("Google place details did not include coordinates");
    }

    return {
      label: compactPlaceName(data.formattedAddress || data.displayName?.text || suggestion.label),
      point: {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6)),
      },
    };
  }

  throw new Error("Location suggestion cannot be resolved");
}

export async function reverseLookupLocation(point: LocationPoint) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "en",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      county?: string;
      state?: string;
    };
  };
  if (!data.display_name) return null;
  return {
    label: compactPlaceName(data.display_name),
    classification: classifyHillCountry(data.address || {}, point),
  };
}

export function classifyHillCountry(
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
  },
  point?: LocationPoint,
): LocationClassification {
  const text = [address.city, address.town, address.village, address.county, address.state]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hillKeywords = [
    "nuwara eliya",
    "badulla",
    "bandarawela",
    "ella",
    "haputale",
    "kandy",
    "matale",
    "maskeliya",
    "hatton",
    "diyatalawa",
    "talawakele",
    "koslanda",
    "gampola",
  ];

  const keywordHit = hillKeywords.some((keyword) => text.includes(keyword));
  // Central highlands bounding box only
  const latHint = point ? point.lat >= 6.7 && point.lat <= 7.4 && point.lng >= 80.4 && point.lng <= 81.2 : false;

  return {
    isHillCountry: keywordHit || latHint,
    region: keywordHit ? text : null,
  };
}

export async function getRouteDistanceKm(
  origin: LocationPoint,
  destination: LocationPoint,
  signal?: AbortSignal,
) {
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleDistance = await getGoogleRouteDistanceKm(origin, destination, signal);
      if (googleDistance !== null) return googleDistance;
    } catch {
      // Fall back to OSRM if Google Routes is unavailable.
    }
  }

  return getOpenStreetMapRouteDistanceKm(origin, destination, signal);
}

export async function getMultiPointRouteDistanceKm(
  points: LocationPoint[],
  signal?: AbortSignal,
): Promise<number> {
  if (points.length < 2) return 0;

  if (GOOGLE_MAPS_API_KEY) {
    try {
      const distance = await getGoogleMultiPointDistanceKm(points, signal);
      if (distance !== null) return distance;
    } catch {
      // Fall back to OSRM.
    }
  }

  return getOsrmMultiPointDistanceKm(points, signal);
}

function searchGooglePlaces(query: string, signal?: AbortSignal): Promise<LocationSuggestion[]> {
  return fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
    },
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ["lk"],
      regionCode: "lk",
      languageCode: "en",
      includePureServiceAreaBusinesses: true,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Google autocomplete failed");
      return res.json() as Promise<GoogleAutocompleteResponse>;
    })
    .then((data) =>
      (data.suggestions || [])
        .map((suggestion) => suggestion.placePrediction)
        .filter((prediction): prediction is NonNullable<typeof prediction> =>
          Boolean(prediction?.placeId && prediction.text?.text),
        )
        .map((prediction) => ({
          id: prediction.placeId || "",
          label: compactPlaceName(prediction.text?.text || ""),
          provider: "google" as const,
        })),
    );
}

async function searchGoogleTextPlaces(query: string, signal?: AbortSignal) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode: "lk",
      languageCode: "en",
      locationBias: {
        rectangle: {
          low: {
            latitude: 5.7,
            longitude: 79.4,
          },
          high: {
            latitude: 9.9,
            longitude: 82.1,
          },
        },
      },
    }),
  });
  if (!res.ok) throw new Error("Google text search failed");

  const data = (await res.json()) as GoogleTextSearchResponse;
  return (data.places || [])
    .filter(
      (place) => place.location?.latitude !== undefined && place.location.longitude !== undefined,
    )
    .map((place) => ({
      id: place.id || place.formattedAddress || place.displayName?.text || "",
      label: compactPlaceName(place.formattedAddress || place.displayName?.text || ""),
      provider: "google" as const,
      lat: Number((place.location?.latitude || 0).toFixed(6)),
      lng: Number((place.location?.longitude || 0).toFixed(6)),
    }));
}

async function searchOpenStreetMapPlaces(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    countrycodes: "lk",
    limit: "6",
    addressdetails: "1",
    viewbox: SRI_LANKA_VIEWBOX,
    bounded: "1",
    "accept-language": "en",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal });
  if (!res.ok) throw new Error("OpenStreetMap location search failed");
  const data = (await res.json()) as NominatimSearchResult[];

  return data.map((result) => ({
    id: String(result.place_id),
    label: compactPlaceName(result.display_name),
    provider: "osm" as const,
    lat: Number(Number(result.lat).toFixed(6)),
    lng: Number(Number(result.lon).toFixed(6)),
  }));
}

async function getGoogleRouteDistanceKm(
  origin: LocationPoint,
  destination: LocationPoint,
  signal?: AbortSignal,
) {
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
    }),
  });
  if (!res.ok) throw new Error("Google route distance failed");

  const data = (await res.json()) as GoogleRouteResponse;
  const meters = data.routes?.[0]?.distanceMeters;
  return meters === undefined ? null : Number((meters / 1000).toFixed(1));
}

async function getOpenStreetMapRouteDistanceKm(
  origin: LocationPoint,
  destination: LocationPoint,
  signal?: AbortSignal,
) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("OpenStreetMap route distance failed");
  const data = await res.json();
  const meters = data.routes?.[0]?.distance;
  if (meters === undefined) throw new Error("OpenStreetMap route did not include distance");
  return Number((meters / 1000).toFixed(1));
}

async function getGoogleMultiPointDistanceKm(
  points: LocationPoint[],
  signal?: AbortSignal,
): Promise<number | null> {
  const [origin, ...rest] = points;
  const destination = rest[rest.length - 1];
  const intermediates = rest.slice(0, -1).map((p) => ({
    location: { latLng: { latitude: p.lat, longitude: p.lng } },
  }));

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      intermediates,
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as GoogleRouteResponse;
  const meters = data.routes?.[0]?.distanceMeters;
  return meters === undefined ? null : Number((meters / 1000).toFixed(1));
}

async function getOsrmMultiPointDistanceKm(
  points: LocationPoint[],
  signal?: AbortSignal,
): Promise<number> {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("OSRM multi-point route failed");
  const data = await res.json();
  const meters = data.routes?.[0]?.distance;
  if (meters === undefined) throw new Error("OSRM route did not include distance");
  return Number((meters / 1000).toFixed(1));
}

function compactPlaceName(name: string) {
  return name
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
}
