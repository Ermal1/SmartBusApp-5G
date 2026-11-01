import { Bus, BusStop, OccupancyLevel } from '@/types';
import { haversineDistanceKm, calculateEtaMinutes, getStatusFromDelay } from '@/lib/geo';
import { getBusLineByNumber, busLines } from '@/data/routes';

/**
 * External bus data structure from arvento-buses.onrender.com API
 * This is a public demo API used for the student project demonstration.
 * We have a fallback to local mock data if this API is unavailable.
 */
interface ExternalBus {
  _id?: string;
  id: string;
  time?: string;
  address?: string;
  latitude: number;
  longitude: number;
  plate?: string;
  speed?: number;
  derivedStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/**
 * Fetch buses from external API and map them to our internal Bus type
 * @param stopId - The selected bus stop ID to calculate ETAs relative to, or 'all' for all buses
 * @returns Array of Bus objects mapped from external API, or null if fetch fails
 */
export async function fetchExternalBuses(stopId: string | 'all'): Promise<Bus[] | null> {
  const externalUrl = process.env.NEXT_PUBLIC_EXTERNAL_BUSES_URL || 
    'https://arvento-buses.onrender.com/api/buses';

  try {
    // Fetch from external API with timeout
    // Rrit timeout në 10 sekonda për API të ngadaltë (Render.com free tier është i ngadaltë)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(externalUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      // Next.js fetch cache options - rrit cache time për të reduktuar requests
      next: { revalidate: 30 }, // Revalidate every 30 seconds (më pak requests)
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ [EXTERNAL API] External buses API returned status ${response.status} - do të përdoret mock data`);
      return null;
    }

    const externalBuses: ExternalBus[] = await response.json();

    if (!Array.isArray(externalBuses) || externalBuses.length === 0) {
      console.warn('⚠️ [EXTERNAL API] External buses API returned invalid or empty data');
      return null;
    }

    console.log('✅ [EXTERNAL API] Të dhëna reale të marra me sukses -', externalBuses.length, 'autobusë nga API');

    // Fetch all bus stops from our bus-stops API to get coordinates
    // This allows us to work with Google Places IDs
    let allStops: BusStop[] = [];
    let selectedStop: BusStop | null = null;
    
    // If stopId is 'all', we don't need to find a specific stop
    if (stopId !== 'all') {
      try {
        const stopResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bus-stops`,
          { next: { revalidate: 300 } } // Cache for 5 minutes
        );
        if (stopResponse.ok) {
          const stopData = await stopResponse.json();
          allStops = (stopData.stops || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address || '',
            location: { lat: s.lat, lng: s.lng },
          }));
          selectedStop = allStops.find((s) => s.id === stopId) || null;
        }
      } catch (error) {
        console.warn('Failed to fetch stop info for ETA calculation:', error);
      }
    }

    // If we can't find the stop or stopId is 'all', use a default Prishtina center
    // This ensures buses still show even if stop lookup fails
    const defaultStop: BusStop = {
      id: stopId === 'all' ? 'center' : stopId,
      name: 'Prishtina Center',
      address: 'Prishtina',
      location: { lat: 42.6629, lng: 21.1655 },
    };
    const targetStop = selectedStop || defaultStop;

    // Map external buses to our internal Bus type
    const mappedBuses: Bus[] = externalBuses
      .filter((extBus) => {
        // Filter out invalid coordinates
        return (
          typeof extBus.latitude === 'number' &&
          typeof extBus.longitude === 'number' &&
          !isNaN(extBus.latitude) &&
          !isNaN(extBus.longitude) &&
          extBus.latitude >= -90 &&
          extBus.latitude <= 90 &&
          extBus.longitude >= -180 &&
          extBus.longitude <= 180
        );
      })
      .map((extBus, index) => {
        // Extract route number from plate or use a default mapping
        // Plate format might be like "01-270-IF" - we'll try to extract a number
        // In a real system, this would come from the bus's assigned route
        let routeNumber = '1'; // Default
        if (extBus.plate) {
          // Try to extract a number from the plate and map to our routes (1-6)
          const plateMatch = extBus.plate.match(/\d+/);
          if (plateMatch) {
            const plateNum = parseInt(plateMatch[0]);
            // Map to our route numbers (1-6) using modulo
            routeNumber = String((plateNum % 6) + 1);
          }
        } else if (extBus.id) {
          // Try to extract number from bus ID if available
          const idMatch = extBus.id.match(/\d+/);
          if (idMatch) {
            const idNum = parseInt(idMatch[0]);
            routeNumber = String((idNum % 6) + 1);
          } else {
            // Use index-based assignment as fallback
            routeNumber = String((index % 6) + 1);
          }
        } else {
          // Use index-based assignment if no plate or ID
          routeNumber = String((index % 6) + 1);
        }

        // Get bus line info
        const busLine = getBusLineByNumber(routeNumber);
        const lineId = busLine?.id || `line-${routeNumber}`;

        // Calculate distance to target stop (use targetStop, not selectedStop)
        // targetStop is guaranteed to exist (either selectedStop or defaultStop)
        const distanceKm = haversineDistanceKm(
          extBus.latitude,
          extBus.longitude,
          targetStop.location.lat,
          targetStop.location.lng
        );

        // Calculate ETA based on distance and speed
        // Use external speed if available, otherwise default to 27.5 km/h
        // Speed from external API might be in m/s or km/h - we'll detect and convert
        let finalSpeedKmH = 27.5; // Default city bus speed
        
        if (extBus.speed && extBus.speed > 0) {
          // If speed is very high (>100), it's likely in m/s, convert to km/h
          // If speed is reasonable (10-100), assume it's already in km/h
          if (extBus.speed > 100) {
            finalSpeedKmH = extBus.speed * 3.6; // Convert m/s to km/h
          } else if (extBus.speed < 1) {
            // Very small speed (< 1) might be in m/s, convert
            finalSpeedKmH = extBus.speed * 3.6;
          } else {
            // Assume already in km/h
            finalSpeedKmH = extBus.speed;
          }
          // Clamp to reasonable city bus speeds (10-60 km/h)
          finalSpeedKmH = Math.max(10, Math.min(60, finalSpeedKmH));
        }

        const etaMinutes = calculateEtaMinutes(distanceKm, finalSpeedKmH);

        // Generate planned ETA (slightly optimistic)
        const plannedEtaMinutes = Math.max(2, etaMinutes - (2 + Math.random() * 3));

        // Calculate delay
        const delayMinutes = Math.max(0, etaMinutes - plannedEtaMinutes);
        const status = getStatusFromDelay(delayMinutes);

        // Simulate occupancy (not available in external API)
        const occupancies: OccupancyLevel[] = ['low', 'medium', 'high'];
        const occupancy = occupancies[Math.floor(Math.random() * occupancies.length)];

        // Determine destination and next stop from route
        // Use allStops array fetched from /api/bus-stops (or default if stopId is 'all')
        const destinationIds = busLine?.stops || [];
        const destinationId = destinationIds[destinationIds.length - 1] || (stopId === 'all' ? 'center' : stopId);
        const destinationStop = allStops.find((s) => s.id === destinationId);
        const destination = destinationStop 
          ? `${busLine?.name || `Route ${routeNumber}`} → ${destinationStop.name}`
          : busLine?.name || `Route ${routeNumber}`;

        // Determine next stop (if stopId is 'all', use first stop in route)
        const effectiveStopId = stopId === 'all' ? (busLine?.stops[0] || 'center') : stopId;
        const nextStopId = busLine?.stops.find((routeStopId, idx) => {
          const selectedStopIdx = busLine.stops.indexOf(effectiveStopId);
          return selectedStopIdx > -1 && idx > selectedStopIdx;
        }) || busLine?.stops.find((routeStopId) => routeStopId !== effectiveStopId) || busLine?.stops[0] || effectiveStopId;

        // Format last updated timestamp
        const lastUpdatedTime = extBus.time || extBus.updatedAt;
        const lastUpdated = lastUpdatedTime ? new Date(lastUpdatedTime).toISOString() : new Date().toISOString();

        return {
          id: extBus.id || `external-${index}`,
          routeNumber,
          lineId,
          destination,
          eta: Math.round(etaMinutes),
          delayMinutes: Math.round(delayMinutes * 10) / 10,
          plannedEta: Math.round(plannedEtaMinutes),
          occupancy,
          status,
          currentLat: extBus.latitude,
          currentLng: extBus.longitude,
          destinationStationId: destinationId,
          nextStopId,
          lastUpdate: lastUpdated,
          // Map external API fields
          plate: extBus.plate,
          speedKmh: finalSpeedKmH > 0 ? Math.round(finalSpeedKmH * 10) / 10 : undefined,
          address: extBus.address,
          lastUpdated: lastUpdated,
          derivedStatus: extBus.derivedStatus,
        };
      })
      .filter((bus) => {
        // Filter out buses that are too far away (more than 50km) - likely not relevant
        return bus.eta < 120; // Less than 2 hours away
      })
      .sort((a, b) => a.eta - b.eta); // Sort by ETA

    return mappedBuses.length > 0 ? mappedBuses : null;
  } catch (error) {
    // Handle network errors, timeouts, etc.
    // Log vetëm nëse nuk është timeout (timeout është normal për API të ngadaltë)
    if (error instanceof Error && error.name === 'AbortError') {
      // Timeout është i pritshëm për external API - fallback në mock data
      console.warn('⚠️ [EXTERNAL API] Request timeout - do të përdoret mock data');
    } else {
      // Log vetëm error-e të tjera (jo timeout)
      console.warn('⚠️ [EXTERNAL API] Failed to fetch external buses:', error instanceof Error ? error.message : 'Unknown error', '- do të përdoret mock data');
    }
    return null;
  }
}
