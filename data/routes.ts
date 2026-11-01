import { BusLine, ScheduleEntry, Alert } from '@/types';

// Bus line definitions with stops in order - Real Prishtina bus lines
export const busLines: BusLine[] = [
  {
    id: 'line-1',
    number: '1',
    name: 'Prishtinë → Fushkosovë',
    color: '#3b82f6', // Blue
    stops: ['1', '2'], // Prishtinë → Fushkosovë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-1a',
    number: '1a',
    name: 'Stacioni i Autobusëve → Aeroport',
    color: '#2563eb', // Darker Blue
    stops: ['2', '8'], // Bus Station → Airport
    price: 1.0,
    studentPrice: 0.5,
  },
  {
    id: 'line-3',
    number: '3',
    name: 'Mati → Bardhosh',
    color: '#f59e0b', // Orange
    stops: ['1', '5'], // Mati → Bardhosh
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-3a',
    number: '3a',
    name: '27 Nëntori → Lagjja e Spitalit',
    color: '#f97316', // Orange Red
    stops: ['1', '4'], // 27 Nëntori → Lagjja e Spitalit
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-3b',
    number: '3b',
    name: 'Mat → Bernice',
    color: '#fb923c', // Light Orange
    stops: ['1', '5'], // Mat → Bernice
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-3c',
    number: '3c',
    name: 'Breku i Diellit → Sinidoll',
    color: '#fdba74', // Pale Orange
    stops: ['1', '5'], // Breku i Diellit → Sinidoll
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-4',
    number: '4',
    name: 'Mat → Germi',
    color: '#8b5cf6', // Purple
    stops: ['1', '7'], // Mat → Germi
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-6',
    number: '6',
    name: 'Arbëria → Arkivi i Kosovës',
    color: '#06b6d4', // Cyan
    stops: ['1', '6'], // Arbëria → Arkivi i Kosovës
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-6a',
    number: '6a',
    name: 'Arbëri te Varrezat → Tregu e Shumicë',
    color: '#0891b2', // Darker Cyan
    stops: ['1', '6'], // Arbëri te Varrezat → Tregu e Shumicë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-7',
    number: '7',
    name: 'Kolovice e Jetër → Kosova Tex',
    color: '#10b981', // Green
    stops: ['1', '3'], // Kolovice e Jetër → Kosova Tex
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-7a',
    number: '7a',
    name: 'Lagjja Vershtat → Arkivi i Kosovës',
    color: '#059669', // Darker Green
    stops: ['1', '6'], // Lagjja Vershtat → Arkivi i Kosovës
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-8',
    number: '8',
    name: 'Grashticë → Prishtinë',
    color: '#ef4444', // Red
    stops: ['1', '2'], // Grashticë → Prishtinë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-10',
    number: '10',
    name: 'Hajvali → Prishtinë',
    color: '#ec4899', // Pink
    stops: ['1', '2'], // Hajvali → Prishtinë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-10a',
    number: '10a',
    name: 'Parku i Ariut → Prishtinë',
    color: '#f472b6', // Light Pink
    stops: ['1', '2'], // Parku i Ariut → Prishtinë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-11',
    number: '11',
    name: 'Barilevë → Prishtinë',
    color: '#a855f7', // Purple
    stops: ['1', '2'], // Barilevë → Prishtinë
    price: 0.4,
    studentPrice: 0.25,
  },
  {
    id: 'line-12',
    number: '12',
    name: 'Lagjja e Llumnicëve → Prishtinë',
    color: '#6366f1', // Indigo
    stops: ['1', '2'], // Lagjja e Llumnicëve → Prishtinë
    price: 0.4,
    studentPrice: 0.25,
  },
];

// Schedule definitions - departures from first stop
export const schedules: ScheduleEntry[] = [
  {
    lineId: 'line-1',
    stopId: '1', // First stop
    departureTimes: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'],
  },
  {
    lineId: 'line-2',
    stopId: '3',
    departureTimes: ['06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45', '18:15', '18:45', '19:15', '19:45', '20:15', '20:45', '21:15'],
  },
  {
    lineId: 'line-3',
    stopId: '2',
    departureTimes: ['06:00', '06:20', '06:40', '07:00', '07:20', '07:40', '08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00', '20:20', '20:40', '21:00', '21:20'],
  },
  {
    lineId: 'line-4',
    stopId: '1',
    departureTimes: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
  },
  {
    lineId: 'line-5',
    stopId: '4',
    departureTimes: ['06:00', '06:25', '06:50', '07:15', '07:40', '08:05', '08:30', '08:55', '09:20', '09:45', '10:10', '10:35', '11:00', '11:25', '11:50', '12:15', '12:40', '13:05', '13:30', '13:55', '14:20', '14:45', '15:10', '15:35', '16:00', '16:25', '16:50', '17:15', '17:40', '18:05', '18:30', '18:55', '19:20', '19:45', '20:10', '20:35', '21:00'],
  },
  {
    lineId: 'line-6',
    stopId: '5',
    departureTimes: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
  },
];

// Mock alerts for incidents
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'accident',
    severity: 'warning',
    title: 'Accident near Dardania',
    message: 'Traffic accident reported near Dardania stop. Expect delays of 10-15 minutes for routes passing through this area.',
    affectedLineIds: ['line-3', 'line-6'],
    affectedStopIds: ['6'],
    location: { lat: 42.6501, lng: 21.1756 },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    id: 'alert-2',
    type: 'flood',
    severity: 'critical',
    title: 'Flooding on Route 4',
    message: 'Heavy rainfall causing flooding on Ulpiana route. Route 4 temporarily suspended. Use alternative routes.',
    affectedLineIds: ['line-4'],
    affectedStopIds: ['7'],
    location: { lat: 42.6405, lng: 21.1601 },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  },
  {
    id: 'alert-3',
    type: 'heavy-traffic',
    severity: 'info',
    title: 'Heavy Traffic at City Center',
    message: 'Increased traffic volume at City Center stop. Minor delays expected (5-8 minutes).',
    affectedLineIds: ['line-1', 'line-2', 'line-3', 'line-5', 'line-6'],
    affectedStopIds: ['1'],
    location: { lat: 42.6629, lng: 21.1655 },
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    id: 'alert-4',
    type: 'construction',
    severity: 'info',
    title: 'Road Construction near Airport',
    message: 'Road construction work near Airport stop. One lane closed. Expect 5-10 minute delays.',
    affectedLineIds: ['line-1', 'line-6'],
    affectedStopIds: ['8'],
    location: { lat: 42.5728, lng: 21.0358 },
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

// Route waypoints for realistic route visualization on map
// Each route has waypoints (intermediate points) to create a realistic path
export const routeWaypoints: Record<string, Array<{ lat: number; lng: number }>> = {
  'line-3': [
    // Bardhosh → Muharrem Fejza (via Prishtina center)
    // Bardhosh: 42°43′3″N, 21°8′41″E = 42.7175, 21.1447
    // Muharrem Fejza: 42°38′47″N, 21°10′45″E = 42.6464, 21.1792
    { lat: 42.7175, lng: 21.1447 }, // Bardhosh (start)
    { lat: 42.7000, lng: 21.1500 }, // Intermediate point 1
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit (City Center - waypoint)
    { lat: 42.6550, lng: 21.1720 }, // Intermediate point 2
    { lat: 42.6464, lng: 21.1792 }, // Muharrem Fejza (end)
  ],
  'line-4': [
    // Mat → Germi
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit (Mat)
    { lat: 42.6515, lng: 21.1600 }, // Intermediate point
    { lat: 42.6405, lng: 21.1601 }, // Ulpiana (Germi)
  ],
  'line-1': [
    // Prishtinë → Fushkosovë
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
  ],
  'line-1a': [
    // Stacioni i Autobusëve → Aeroport
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6100, lng: 21.0900 }, // Intermediate point
    { lat: 42.5728, lng: 21.0358 }, // Aeroporti
  ],
  'line-3a': [
    // 27 Nëntori → Lagjja e Spitalit
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6678, lng: 21.1723 }, // Spitali Amerikan
  ],
  'line-3b': [
    // Mat → Bernice
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6589, lng: 21.1489 }, // Dragodan (Bernice area)
  ],
  'line-3c': [
    // Breku i Diellit → Sinidoll
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6589, lng: 21.1489 }, // Dragodan (Sinidoll area)
  ],
  'line-6': [
    // Arbëria → Arkivi i Kosovës
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6501, lng: 21.1756 }, // Dardania (Arkivi i Kosovës)
  ],
  'line-6a': [
    // Arbëri te Varrezat → Tregu e Shumicë
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6501, lng: 21.1756 }, // Dardania
  ],
  'line-7': [
    // Kolovice e Jetër → Kosova Tex
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6581, lng: 21.1655 }, // Universiteti i Prishtinës (Kosova Tex area)
  ],
  'line-7a': [
    // Lagjja Vershtat → Arkivi i Kosovës
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
    { lat: 42.6501, lng: 21.1756 }, // Dardania
  ],
  'line-8': [
    // Grashticë → Prishtinë
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
  ],
  'line-10': [
    // Hajvali → Prishtinë
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
  ],
  'line-10a': [
    // Parku i Ariut → Prishtinë
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
  ],
  'line-11': [
    // Barilevë → Prishtinë
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
  ],
  'line-12': [
    // Lagjja e Llumnicëve → Prishtinë
    { lat: 42.6508, lng: 21.1479 }, // Stacioni i Autobusëve
    { lat: 42.6629, lng: 21.1655 }, // Qendra e Qytetit
  ],
};

// Helper function to get bus line by number
export function getBusLineByNumber(number: string): BusLine | undefined {
  return busLines.find((line) => line.number === number);
}

// Helper function to get bus line by ID
export function getBusLineById(id: string): BusLine | undefined {
  return busLines.find((line) => line.id === id);
}

// Helper function to get schedule for a line and stop
export function getScheduleForLineAndStop(lineId: string, stopId: string): ScheduleEntry | undefined {
  return schedules.find((s) => s.lineId === lineId && s.stopId === stopId);
}

// Helper function to get upcoming departures (next 3)
export function getUpcomingDepartures(lineId: string, stopId: string, count: number = 3): string[] {
  const schedule = schedules.find((s) => s.lineId === lineId && s.stopId === stopId);
  if (!schedule) return [];

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const upcoming = schedule.departureTimes
    .filter((time) => time >= currentTime)
    .slice(0, count);

  return upcoming;
}

// Helper function to get active alerts for a line
export function getAlertsForLine(lineId: string): Alert[] {
  return mockAlerts.filter((alert) => alert.affectedLineIds.includes(lineId));
}

// Helper function to get active alerts for a stop
export function getAlertsForStop(stopId: string): Alert[] {
  return mockAlerts.filter((alert) => alert.affectedStopIds?.includes(stopId));
}
