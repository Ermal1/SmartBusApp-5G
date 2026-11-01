export type BusStatus = 'on-time' | 'delayed' | 'traffic-jam';

export type OccupancyLevel = 'low' | 'medium' | 'high';

export type AlertType = 'flood' | 'accident' | 'heavy-traffic' | 'construction' | 'other';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface BusStop {
  id: string;
  name: string;
  address: string; // human-readable address/description
  location: {
    lat: number;
    lng: number;
  };
}

// Bus line/route definition with stops in order
export interface BusLine {
  id: string;
  number: string; // e.g. "3", "4", "5", "6"
  name: string; // e.g. "Qendra → Dardania"
  color: string; // hex color for route visualization
  stops: string[]; // Array of stop IDs in order
  price: number; // Ticket price in EUR
  studentPrice?: number; // Student discount price
}

// Schedule entry for a bus line
export interface ScheduleEntry {
  lineId: string;
  stopId: string;
  departureTimes: string[]; // Array of times in HH:mm format, e.g. ["07:15", "07:30", "07:45"]
}

// Alert for incidents affecting bus routes
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedLineIds: string[]; // Which bus lines are affected
  affectedStopIds?: string[]; // Optional: specific stops affected
  location?: { lat: number; lng: number }; // Optional: alert location on map
  timestamp: string; // ISO timestamp
}

export interface Bus {
  id: string;
  routeNumber: string;
  lineId: string; // Reference to BusLine
  destination: string;
  eta: number; // minutes until arrival (computed from distance)
  delayMinutes: number; // delay in minutes (eta - plannedEta)
  plannedEta: number; // planned/scheduled ETA in minutes
  occupancy: OccupancyLevel;
  status: BusStatus;
  currentLat: number; // current GPS latitude
  currentLng: number; // current GPS longitude
  destinationStationId: string; // ID of the destination bus stop
  nextStopId?: string; // ID of the next stop where bus will stop
  lastUpdate: string; // ISO timestamp
  // Optional fields from external API
  plate?: string; // License plate number (e.g. "687/4", "01-491-MB")
  speedKmh?: number; // Current speed in km/h
  address?: string; // Current location address (e.g. "Te Hamburger ABA, Prishtinë")
  lastUpdated?: string; // ISO timestamp of last update from external API
  derivedStatus?: string; // Status from external API (e.g. "moving", "offline", "longIdle", "shortIdle")
}

export interface BusStopWithBuses extends BusStop {
  buses: Bus[];
}
