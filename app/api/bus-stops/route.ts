import { NextRequest, NextResponse } from 'next/server';

/**
 * Bus stop from Google Places API
 */
interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[]; // Array of place types
  vicinity?: string;
  formatted_address?: string;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

/**
 * Simplified bus stop for frontend
 */
export interface BusStop {
  id: string; // place_id
  name: string;
  lat: number;
  lng: number;
  address?: string; // vicinity or formatted_address
}

/**
 * Multiple search points around Prishtina to get comprehensive bus stop coverage
 * These cover the city center and surrounding neighborhoods including Bardhosh/Matiqan
 */
const SEARCH_POINTS = [
  { lat: 42.6629, lng: 21.1655 }, // City center
  { lat: 42.6770, lng: 21.1600 }, // North (towards Bardhosh)
  { lat: 42.6470, lng: 21.1655 }, // South
  { lat: 42.6629, lng: 21.1855 }, // East
  { lat: 42.6629, lng: 21.1455 }, // West
  { lat: 42.6720, lng: 21.1920 }, // Bardhosh / Matiqan area
];

const RADIUS_METERS = 2500; // 2.5km radius for each search point

/**
 * In-memory cache for bus stops
 * Cache expires after 10 minutes to avoid hitting Google Places API on every request
 */
interface CacheEntry {
  data: BusStop[];
  lastFetched: number;
}

let busStopsCache: CacheEntry | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch bus stops from Google Places Nearby Search API for a single center point
 * Uses transit_station type with "bus stop" keyword to capture both large stations and small stops
 * @param lat - Latitude
 * @param lng - Longitude
 * @param apiKey - Google Maps API key
 * @returns Array of GooglePlace objects (raw from API)
 */
async function fetchStopsForPoint(
  lat: number,
  lng: number,
  apiKey: string
): Promise<GooglePlace[]> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', RADIUS_METERS.toString());
    url.searchParams.set('type', 'transit_station');
    url.searchParams.set('keyword', 'bus stop');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 10 minutes since bus stops are relatively static
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Google Places API returned status ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data.results || [];
  } catch (error) {
    // Log warning but don't fail completely - other points may succeed
    console.warn(`Failed to fetch bus stops for point (${lat}, ${lng}):`, error);
    return []; // Return empty array on error
  }
}

/**
 * Fetch bus stops from multiple center points around Prishtina
 * Aggregates results from all centers and deduplicates by place_id
 * @returns Array of BusStop objects
 */
async function fetchBusStopsFromMultipleCenters(): Promise<BusStop[]> {
  // Read API key from environment (server-side, can use either name)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                 '';

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  // Fetch from all center points in parallel
  const resultsArrays = await Promise.all(
    SEARCH_POINTS.map((point) => fetchStopsForPoint(point.lat, point.lng, apiKey))
  );

  // Merge all results into one array
  const allPlaces: GooglePlace[] = [];
  resultsArrays.forEach((places) => {
    allPlaces.push(...places);
  });

  // Deduplicate by place_id using a Map
  const byId = new Map<string, GooglePlace>();
  for (const place of allPlaces) {
    if (!place.place_id) continue;
    if (!byId.has(place.place_id)) {
      byId.set(place.place_id, place);
    }
  }

  const mergedPlaces = Array.from(byId.values());

  // Map to the response format expected by the frontend
  const stops: BusStop[] = mergedPlaces
    .map((place) => ({
      id: place.place_id,
      name: place.name,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      address: place.vicinity ?? place.formatted_address ?? '',
    }))
    .filter((stop) => {
      // Filter out invalid coordinates
      return (
        typeof stop.lat === 'number' &&
        typeof stop.lng === 'number' &&
        !isNaN(stop.lat) &&
        !isNaN(stop.lng) &&
        stop.lat >= -90 &&
        stop.lat <= 90 &&
        stop.lng >= -180 &&
        stop.lng <= 180
      );
    });

  return stops;
}

// Revalidate cache every 10 minutes (600 seconds)
export const revalidate = 600;

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now();
    if (
      busStopsCache &&
      now - busStopsCache.lastFetched < CACHE_DURATION_MS
    ) {
      // Return cached data
      return NextResponse.json({ stops: busStopsCache.data });
    }

    // Fetch from multiple center points around Prishtina
    // This aggregates results from all centers and deduplicates by place_id
    const stops = await fetchBusStopsFromMultipleCenters();

    // If we got no stops, check if it's a real error or just no data
    if (stops.length === 0) {
      console.warn('No bus stops found from any center point');
      // Still return empty array - frontend can handle this
    }

    // Update cache
    busStopsCache = {
      data: stops,
      lastFetched: now,
    };

    return NextResponse.json({ stops });
  } catch (error) {
    console.error('Error fetching bus stops from Google Places:', error);
    
    // If ALL Google calls failed, return error response
    // If SOME failed but we have cached data, return that
    if (busStopsCache && busStopsCache.data.length > 0) {
      console.warn('Using cached bus stops due to API error');
      return NextResponse.json({ stops: busStopsCache.data });
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to fetch bus stops from Google Places',
        stops: [], // Return empty array on error
      },
      { status: 500 }
    );
  }
}
