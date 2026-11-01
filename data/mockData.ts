import { BusStop, Bus, OccupancyLevel } from '@/types';
import { haversineDistanceKm, calculateEtaMinutes, getStatusFromDelay } from '@/lib/geo';
import { busLines, getBusLineByNumber } from './routes';

// Real bus stops in Prishtina, Kosovo with accurate coordinates
// Coordinates verified using Google Maps and real-world locations
export const busStops: BusStop[] = [
  {
    id: '1',
    name: 'Qendra e Qytetit',
    address: 'City Center, Prishtina',
    location: { lat: 42.6629, lng: 21.1655 }, // City Center / Mother Teresa Square
  },
  {
    id: '2',
    name: 'Stacioni i Autobusëve',
    address: 'Bus Station, Prishtina',
    location: { lat: 42.6508, lng: 21.1479 }, // Updated: Main Bus Station coordinates
  },
  {
    id: '3',
    name: 'Universiteti i Prishtinës',
    address: 'University of Prishtina',
    location: { lat: 42.6581, lng: 21.1655 }, // Updated: University main campus
  },
  {
    id: '4',
    name: 'Spitali Amerikan',
    address: 'American Hospital, Prishtina',
    location: { lat: 42.6678, lng: 21.1723 }, // American Hospital location
  },
  {
    id: '5',
    name: 'Dragodan',
    address: 'Dragodan Neighborhood, Prishtina',
    location: { lat: 42.6589, lng: 21.1489 }, // Dragodan area
  },
  {
    id: '6',
    name: 'Dardania',
    address: 'Dardania Neighborhood, Prishtina',
    location: { lat: 42.6501, lng: 21.1756 }, // Dardania area
  },
  {
    id: '7',
    name: 'Ulpiana',
    address: 'Ulpiana Neighborhood, Prishtina',
    location: { lat: 42.6405, lng: 21.1601 }, // Ulpiana area
  },
  {
    id: '8',
    name: 'Aeroporti',
    address: 'Prishtina International Airport',
    location: { lat: 42.5728, lng: 21.0358 }, // Pristina International Airport (PRN)
  },
];

// Route definitions mapping route numbers to destination stops
const routeDestinations: Record<string, string[]> = {
  '1': ['8'], // Route 1 goes to Airport
  '2': ['5'], // Route 2 goes to Dragodan
  '3': ['6'], // Route 3 goes to Dardania
  '4': ['7'], // Route 4 goes to Ulpiana
  '5': ['1'], // Route 5 goes to City Center
  '6': ['8'], // Route 6 goes to Airport
};

// Generate realistic bus data for a selected stop with geo-based positions
export function generateBusesForStop(stopId: string, existingBuses?: Map<string, Bus>): Bus[] {
  const routes = [
    { number: '1', destination: 'Qendra → Aeroporti' },
    { number: '2', destination: 'Universiteti → Dragodan' },
    { number: '3', destination: 'Stacioni → Dardania' },
    { number: '4', destination: 'Qendra → Ulpiana' },
    { number: '5', destination: 'Spitali → Qendra' },
    { number: '6', destination: 'Dragodan → Aeroporti' },
  ];

  const occupancies: OccupancyLevel[] = ['low', 'medium', 'high'];
  const selectedStop = busStops.find((s) => s.id === stopId);
  
  if (!selectedStop) {
    return [];
  }

  // Generate 3-6 buses per stop
  const busCount = 3 + Math.floor(Math.random() * 4);
  const buses: Bus[] = [];

  for (let i = 0; i < busCount; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const busId = `${stopId}-bus-${i + 1}`;
    
    // Check if bus already exists (for position continuity)
    let bus: Bus | undefined;
    if (existingBuses && existingBuses.has(busId)) {
      bus = existingBuses.get(busId)!;
    }

    // Determine destination stop
    const destinationIds = routeDestinations[route.number] || [stopId];
    const destinationId = destinationIds[0];
    const destinationStop = busStops.find((s) => s.id === destinationId) || selectedStop;

    // Generate initial position if bus doesn't exist
    // Position bus somewhere between 0.5km and 8km away from the stop
    let currentLat: number;
    let currentLng: number;
    
    if (bus) {
      // Use existing position
      currentLat = bus.currentLat;
      currentLng = bus.currentLng;
    } else {
      // Generate new position: place bus at a random angle and distance from stop
      const distanceKm = 0.5 + Math.random() * 7.5; // 0.5-8 km
      const angle = Math.random() * 2 * Math.PI; // Random direction
      
      // Approximate: 1 degree latitude ≈ 111 km, longitude varies by latitude
      const latOffset = (distanceKm * Math.cos(angle)) / 111;
      const lngOffset = (distanceKm * Math.sin(angle)) / (111 * Math.cos(selectedStop.location.lat * Math.PI / 180));
      
      currentLat = selectedStop.location.lat + latOffset;
      currentLng = selectedStop.location.lng + lngOffset;
    }

    // Calculate distance to stop
    const distanceKm = haversineDistanceKm(
      currentLat,
      currentLng,
      selectedStop.location.lat,
      selectedStop.location.lng
    );

    // Calculate ETA based on distance (average speed: 25-30 km/h, use 27.5)
    const averageSpeedKmH = 25 + Math.random() * 5; // 25-30 km/h
    const etaMinutes = calculateEtaMinutes(distanceKm, averageSpeedKmH);

    // Generate planned ETA (what the schedule says)
    // Planned ETA is typically 2-5 minutes less than actual (to account for delays)
    const plannedEtaMinutes = Math.max(2, etaMinutes - (2 + Math.random() * 3));
    
    // Calculate delay
    const delayMinutes = Math.max(0, etaMinutes - plannedEtaMinutes);
    
    // Determine status from delay
    const status = getStatusFromDelay(delayMinutes);
    
    const occupancy = occupancies[Math.floor(Math.random() * occupancies.length)];

    // Get bus line info
    const busLine = getBusLineByNumber(route.number);
    const lineId = busLine?.id || `line-${route.number}`;
    
    // Determine next stop (first stop in route after current position)
    const nextStopId = busLine?.stops.find((routeStopId, idx) => {
      // Find the stop that comes after the selected stop in the route
      const selectedStopIdx = busLine.stops.indexOf(stopId);
      return selectedStopIdx > -1 && idx > selectedStopIdx;
    }) || busLine?.stops.find((routeStopId) => routeStopId !== stopId) || busLine?.stops[0] || stopId;

    buses.push({
      id: busId,
      routeNumber: route.number,
      lineId,
      destination: route.destination,
      eta: etaMinutes,
      delayMinutes: Math.round(delayMinutes * 10) / 10, // Round to 1 decimal
      plannedEta: Math.round(plannedEtaMinutes),
      occupancy,
      status,
      currentLat,
      currentLng,
      destinationStationId: destinationId,
      nextStopId,
      lastUpdate: new Date().toISOString(),
    });
  }

  // Sort by ETA
  return buses.sort((a, b) => a.eta - b.eta);
}

/**
 * Move a bus slightly towards its destination stop
 * This simulates real-time GPS updates from the bus
 */
export function moveBusTowardsDestination(bus: Bus, targetStop: BusStop, speedKmH: number = 27.5): Bus {
  const distanceKm = haversineDistanceKm(
    bus.currentLat,
    bus.currentLng,
    targetStop.location.lat,
    targetStop.location.lng
  );

  // If bus is very close (< 100m), don't move it
  if (distanceKm < 0.1) {
    return bus;
  }

  // Calculate movement per update (assuming 10-second updates)
  // In 10 seconds at speedKmH km/h, bus moves: (speedKmH / 3600) * 10 km
  const movementKm = (speedKmH / 3600) * 10;
  
  // Calculate direction vector
  const latDiff = targetStop.location.lat - bus.currentLat;
  const lngDiff = targetStop.location.lng - bus.currentLng;
  
  // Normalize and scale
  const moveRatio = Math.min(movementKm / distanceKm, 0.95); // Don't overshoot
  
  const newLat = bus.currentLat + latDiff * moveRatio;
  const newLng = bus.currentLng + lngDiff * moveRatio;

  // Recalculate distance and ETA
  const newDistanceKm = haversineDistanceKm(
    newLat,
    newLng,
    targetStop.location.lat,
    targetStop.location.lng
  );
  
  const etaMinutes = calculateEtaMinutes(newDistanceKm, speedKmH);
  const delayMinutes = Math.max(0, etaMinutes - bus.plannedEta);
  const status = getStatusFromDelay(delayMinutes);

  return {
    ...bus,
    currentLat: newLat,
    currentLng: newLng,
    eta: etaMinutes,
    delayMinutes: Math.round(delayMinutes * 10) / 10,
    status,
    lastUpdate: new Date().toISOString(),
  };
}
