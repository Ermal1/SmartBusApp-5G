# SmartBus 5G Prishtina

A demonstration application for the **Advanced 5G Technologies** course project, simulating how a bus tracking application would work over a 5G network with real-time data visualization.

**Project Topic:** Development of an application for 5G networks to assist bus passengers in Prishtina  
**Authors:** Vesa Ademi, Natyra Arifi

## Features

### Core Functionality
- **Real-time Bus Tracking**: View live bus positions and upcoming arrivals for selected bus stops in Prishtina
- **Google Maps Integration**: Interactive map with real-time bus markers, clustering, and route visualization
- **Real Bus Stops**: Bus stops fetched from Google Places API covering Prishtina and surrounding areas
- **ETA Display**: See estimated time of arrival for each bus with geo-based calculations
- **Occupancy Levels**: Monitor bus capacity (Low/Medium/High)
- **Status Updates**: Track bus status (On Time/Delayed/In Traffic Jam)
- **Network Mode Toggle**: Switch between 4G and 5G modes to see latency differences
- **Performance Analytics**: View average delays, route performance metrics, and weekly statistics
- **Alerts System**: Real-time alerts for incidents, traffic, and route disruptions
- **Schedule View**: View bus schedules and timetables for selected routes
- **Ticket Pricing**: Display ticket prices for each route

### Advanced Features
- **External API Integration**: Fetches live bus data from external APIs (with fallback to mock data)
- **Map Clustering**: Intelligent clustering of buses and stops for better readability
- **Distance Filtering**: Smart zoom controls that focus on nearby buses (within 25km)
- **Position Continuity**: Smooth bus movement without random teleportation
- **Vehicle Details**: Real-time vehicle information (plate, speed, address, last updated)
- **InfoWindows**: Detailed bus information on map markers
- **Route Visualization**: Visual representation of bus routes with polylines
- **Mobile-First Design**: Responsive layout optimized for all devices

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Google Maps JavaScript API** (@react-google-maps/api) for real-time map visualization
- **Google Places API** for bus stop discovery
- **MarkerClusterer** (@googlemaps/markerclusterer) for efficient marker clustering
- **External API Integration** (arvento-buses.onrender.com) for live bus data

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Maps API key (required for map visualization and bus stops)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your Google Maps API key (required):
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs for your project:
     - Maps JavaScript API
     - Places API (for bus stop discovery)
   - Set up billing (required for Places API)
   
   - (Optional) External buses API URL (defaults to arvento-buses.onrender.com):
   ```
   NEXT_PUBLIC_EXTERNAL_BUSES_URL=https://arvento-buses.onrender.com/api/buses
   ```
   
   - (Optional) External stats API URL:
   ```
   NEXT_PUBLIC_EXTERNAL_STATS_URL=https://arvento-buses.onrender.com/api/snapshots/heatmap/hourly?range=week
   ```
   
   - (Optional) App URL for server-side API calls:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

**Note:** If you don't have a Google Maps API key, the map will show a loading message. The application will still function with all other features working correctly.

## Project Structure

```
smartbus-5g/
├── app/
│   ├── api/
│   │   ├── buses/              # API route for bus data (POST/GET)
│   │   ├── bus-stops/          # API route for Google Places bus stops
│   │   └── stats/               # API route for weekly statistics
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main application page
│   ├── about/                  # About page
│   └── globals.css             # Global styles
├── components/
│   ├── BusCard.tsx             # Individual bus card component
│   ├── BusList.tsx             # List of buses component
│   ├── BusMap.tsx              # Main Google Map component
│   ├── BusMiniMap.tsx          # Map wrapper with sidebar layout
│   ├── BusSideList.tsx         # Live buses sidebar list
│   ├── BusStopSelector.tsx     # Bus stop dropdown selector
│   ├── NetworkModeToggle.tsx   # 4G/5G network mode toggle
│   ├── AnalyticsSummary.tsx   # Performance analytics component
│   ├── SchedulePanel.tsx       # Schedule/timetable panel
│   ├── AlertsPanel.tsx         # Alerts display component
│   └── WeeklyStatsCard.tsx     # Weekly statistics card
├── lib/
│   ├── externalBuses.ts        # External API integration
│   ├── geo.ts                  # Geographic calculations (Haversine, ETA)
│   ├── mapStyles.ts            # Google Maps custom styles
│   └── weeklyStats.ts          # Weekly statistics processing
├── data/
│   ├── mockData.ts             # Mock data for buses and schedules
│   └── routes.ts               # Bus routes, lines, and alerts
├── types/
│   └── index.ts                # TypeScript type definitions
└── public/                     # Static assets
```

## How It Works

### Data Flow

1. **Bus Stop Selection**: User selects a bus stop from the dropdown
   - Bus stops are fetched from Google Places API (`/api/bus-stops`)
   - Multiple center points around Prishtina ensure comprehensive coverage
   - Results are cached for 10 minutes to reduce API calls

2. **Bus Data Fetching**: 
   - Frontend sends POST request to `/api/buses` with `stopId` and `existingBuses` (for position continuity)
   - API attempts to fetch from external API (arvento-buses.onrender.com)
   - Falls back to mock data if external API is unavailable
   - Calculates ETA, delays, and status based on geo-distance

3. **Map Visualization**:
   - Google Map displays selected station and all bus stops
   - Bus markers show route numbers, direction, and status
   - Clustering groups nearby buses/stops for readability
   - Distance filtering (25km) keeps initial zoom focused on nearby buses
   - Minimum zoom clamping (level 12) prevents over-zooming

4. **Real-time Updates**:
   - 5G mode: Updates every 25 seconds
   - 4G mode: Updates every 30 seconds (with added noise to ETA)
   - Bus positions update smoothly without teleportation
   - Map respects user zoom/pan - doesn't reset on refresh

### Network Modes

- **5G Mode**: 
  - Ultra-low latency (1-5ms simulated)
  - More frequent updates (25s)
  - Accurate ETAs and real-time positioning

- **4G Mode**:
  - Higher latency simulation
  - Less frequent updates (30s)
  - Added noise to ETAs (±1-3 minutes) to simulate less accurate data

## API Endpoints

### `POST /api/buses`
Fetches bus data for a selected stop. Accepts JSON body:
```json
{
  "stopId": "ChIJ...",
  "existingBuses": [...] // Optional: for position continuity
}
```

### `GET /api/buses?stopId=...`
Simple GET endpoint (fallback, no position continuity)

### `GET /api/bus-stops`
Fetches bus stops from Google Places API
- Uses multiple center points around Prishtina
- Filters by `transit_station` type with "bus stop" keyword
- Returns: `{ stops: [{ id, name, lat, lng, address }] }`
- Cached for 10 minutes

### `GET /api/stats/weekly`
Fetches weekly heatmap statistics (optional)

## Bus Stops

Bus stops are dynamically fetched from Google Places API, covering:
- City center and surrounding neighborhoods
- Areas including Bardhosh, Matiqan, and other Prishtina districts
- Both large bus stations and small bus stops
- Real-world coordinates and addresses

The system uses multiple search points to ensure comprehensive coverage of Prishtina and surrounding areas.

## 5G Network Simulation

The application simulates:
- **Ultra-low latency**: 1-5ms response times (5G mode)
- **IoT sensor data**: GPS tracking, passenger counting, and vehicle status from buses
- **Real-time updates**: Continuous data refresh via 5G/4G network simulation
- **High device density**: Simulating many concurrent users
- **Position continuity**: Smooth bus movement without teleportation
- **Geo-based calculations**: Realistic ETA and delay calculations using Haversine distance

## Map Features

- **Custom Styling**: Clean, light map theme optimized for bus visualization
- **Marker Clustering**: Intelligent clustering at lower zoom levels
- **Individual Markers**: Bus icons with route numbers, rotated toward destination
- **Station Markers**: Highlighted selected station with InfoWindow
- **Bus Stop Markers**: Blue "S" markers for all bus stops from Google Places
- **Route Polylines**: Visual representation of bus routes
- **InfoWindows**: Detailed information on bus and stop markers
- **Zoom Controls**: Smart zoom clamping and distance filtering

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Course Context

This application demonstrates how 5G network capabilities enable real-time public transportation tracking systems:

- **Ultra-low latency (1-5ms)**: Enables instant data updates from IoT sensors
- **High bandwidth**: Supports real-time map visualization with many markers
- **Massive IoT connectivity**: Simulates hundreds of buses sending GPS data simultaneously
- **Edge computing**: Server-side processing of geo-calculations and data aggregation
- **Network slicing**: Differentiated service for 4G vs 5G modes

The app simulates data from IoT sensors on buses connected via 5G networks to provide passengers with instant, accurate information about bus locations, ETAs, occupancy, and route status.

## Technical Notes

- **Position Continuity**: Uses POST requests with `existingBuses` in body to avoid 431 errors and maintain smooth bus movement
- **Distance Filtering**: Only buses within 25km of selected station affect initial map bounds
- **Zoom Clamping**: Minimum zoom level of 12 prevents map from being too zoomed out
- **Caching**: Server-side caching reduces API calls (10 minutes for bus stops)
- **Error Handling**: Graceful fallbacks to mock data if external APIs fail
- **Type Safety**: Full TypeScript coverage for type safety

---

**Note:** This is a demonstration application. While it integrates with real external APIs for bus data and Google Places for bus stops, it is designed for educational purposes to demonstrate 5G network capabilities in a public transportation context.
