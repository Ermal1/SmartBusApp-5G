# SmartBus 5G Prishtina - Dokumentim Teknik

## Prezantim

**SmartBus 5G Prishtina** është një aplikacion demonstrativ i zhvilluar për projektin e kursit **"Advanced 5G Technologies"**. Aplikacioni simulon një sistem gjurmimi të autobusëve në kohë reale që funksionon mbi një rrjet 5G, duke ofruar informacion të detajuar për pasagjerët në lidhje me pozicionin, ETA (Estimated Time of Arrival), statusin dhe informacion të tjera për autobusët në Prishtinë.

**Tema e Projektit:** Zhvillimi i një aplikacioni për rrjetet 5G për asistencë të pasagjerëve të autobusëve në Prishtinë  
**Autorët:** Natyra Arifi, Vesa Ademi

---

## Përmbledhje e Funksionaliteteve

### 1. Gjurmimi i Autobusëve në Kohë Reale

Aplikacioni ofron gjurmim në kohë reale të autobusëve përmes:
- **Pozicionim GPS**: Koordinata aktuale (lat/lng) për çdo autobus
- **Përditësim i vazhdueshëm**: Të dhënat përditësohen çdo 25-30 sekonda
- **Vizualizim në hartë**: Shfaqje interaktive e autobusëve në Google Maps
- **Kontinuitet i pozicionit**: Autobusët lëvizin pa lëshim të befasuar (teleportation)

### 2. Integrimi me Google Maps

Aplikacioni përdor Google Maps JavaScript API për:
- **Hartë interaktive**: Hartë e detajuar e Prishtinës dhe zonave rrethore
- **Markers personalizuar**: Ikona të veçanta për autobusët dhe stacionet
- **Clustering inteligjent**: Grupim automatik i autobusëve afër për lehtësi leximi
- **Route visualization**: Vizualizim i rrugëve të autobusëve me polylines
- **InfoWindows**: Dritare informacioni me detaje për autobusët dhe stacionet
- **Zoom dhe navigim**: Kontroll të plotë të zoom dhe pan

### 3. Stacionet e Autobusëve

Sistemi integrohet me Google Places API për:
- **Zbulim automatik**: Mbledhje automatike e të gjitha stacioneve/bus stops në Prishtinë
- **Mbulim i gjerë**: Kërkime nga 6 pika qendrore që mbulojnë të gjithë qytetin dhe zonat rrethore
- **Koordinata reale**: Përdorim i koordinatave reale nga Google Places
- **Filtra inteligjente**: Përfshirje e stacioneve dhe bus stops të vogla (transit_station + keyword "bus stop")
- **Caching**: Cache 10-minutësh për reduktim të thirrjeve të API-së

### 4. Informacion për Autobusët

Për çdo autobus, aplikacioni shfaq:

#### Informacion Bazë
- **Numri i linjës/rrugës**: (p.sh., "Route 3", "Route 5")
- **Destinacioni**: Emri i destinacionit përfundimtar
- **ETA (Estimated Time of Arrival)**: Kohë e vlerësuar arrirjeje në minuta
- **Statusi**: 
  - "On time" (në kohë)
  - "Delayed" (e vonuar)
  - "In traffic jam" (në bllokadë trafiku)
- **Vonesa**: Minutat e vonesës (nëse ka)

#### Informacion i Avancuar
- **Niveli i zënies**: Low (i ulët) / Medium (mesatar) / High (i lartë)
- **Çmimi i biletës**: Çmimi i biletës për rrugën (në Euro)
- **Çmimi për studentë**: Çmimi i reduktuar për studentë (nëse aplikon)
- **Alerts**: Njoftime për incidente, trafik, ose ndryshime në rrugë

#### Informacion i Mjetit (nga External API)
- **Targë**: Numri i targës së autobusit
- **Shpejtësia**: Shpejtësia aktuale në km/h
- **Adresa aktuale**: Lokacioni aktual i autobusit (adresë)
- **Statusi i mjetit**: "moving", "offline", etj.
- **Last updated**: Koha e përditësimit të fundit të të dhënave

### 5. Mënyrat e Rrjetit (4G vs 5G)

Aplikacioni simulon dy mënyra të ndryshme të rrjetit:

#### Mënyra 5G
- **Latency ultra e ulët**: 1-5ms (simuluar)
- **Përditësime më të shpeshta**: Çdo 25 sekonda
- **ETAs të sakta**: Llogaritje të sakta pa zhurmë
- **Përditësime në kohë reale**: Simulim i kapaciteteve reale të 5G

#### Mënyra 4G
- **Latency më e lartë**: Simuluar
- **Përditësime më pak të shpeshta**: Çdo 30 sekonda
- **ETAs me zhurmë**: ETAs me gabim të rastësishëm (±1-3 minuta) për simulim
- **Simulim realistik**: Paraqitje e diferencës mes 4G dhe 5G

### 6. Analitikë dhe Statistikë

Aplikacioni ofron:
- **Përmbledhje performancë**: 
  - Numri total i autobusëve aktivë
  - Mesatarja e vonesave
  - Numri i autobusëve në kohë
  - Statistikat e zënies (low/medium/high)
- **Statistikat javore**: 
  - Ora më e ngarkuar e javës
  - Shpërndarja e aktivitetit gjatë 24 orëve
  - Informacion nga external API (heatmap stats)

### 7. Sistemi i Alerts

- **Njoftime në kohë reale**: Alerts për incidente, trafik, dhe ndryshime rruge
- **Kategorizim**: Alerts të rëndësishme (critical), paralajmërime (warning), informacione
- **Lokacione**: Vendosje e alerts në hartë
- **Filtra**: Shfaqje e alerts sipas linjës së zgjedhur

### 8. Orari dhe Skedulimi

- **Orari i linjave**: Skedula për çdo linjë autobusi
- **Ora të planifikuara**: Ora e planifikuar e mbërritjes
- **Krahasim me vonesën**: Paraqitje e diferencës mes orarit të planifikuar dhe ETA aktual
- **Stacionet në rrugë**: Lista e të gjitha stacioneve në rrugë

---

## Arkitektura Teknike

### Stack Teknologjik

#### Frontend
- **Next.js 14** (App Router): Framework React për SSR dhe routing
- **TypeScript**: Type safety dhe code quality
- **Tailwind CSS**: Styling dhe responsive design
- **React Hooks**: State management (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`)
- **@react-google-maps/api**: Integrimi me Google Maps JavaScript API
- **@googlemaps/markerclusterer**: Clustering i markers për performance

#### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Server-side caching**: In-memory cache për bus stops (10 minuta)
- **External API integration**: Integrimi me arvento-buses.onrender.com
- **Error handling**: Fallback automatik në mock data nëse external API dështon

#### External Services
- **Google Maps JavaScript API**: Hartë interaktive
- **Google Places API**: Zbulimi i stacioneve të autobusëve
- **External Buses API**: Të dhëna reale të autobusëve (arvento-buses.onrender.com)

### Struktura e Projekti

```
smartbus-5g/
├── app/
│   ├── api/
│   │   ├── buses/              # API route për të dhënat e autobusëve (POST/GET)
│   │   ├── bus-stops/          # API route për stacionet nga Google Places
│   │   └── stats/              # API route për statistikat javore
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Faqja kryesore (Dashboard)
│   ├── about/                  # Faqja "About"
│   └── globals.css             # Stilizime globale
├── components/
│   ├── BusCard.tsx             # Komponenti për kartën e autobusit
│   ├── BusList.tsx             # Lista e autobusëve
│   ├── BusMap.tsx              # Komponenti kryesor i Google Maps
│   ├── BusMiniMap.tsx          # Wrapper për hartën me sidebar layout
│   ├── BusSideList.tsx         # Sidebar me listën e autobusëve live
│   ├── BusStopSelector.tsx     # Dropdown për zgjedhjen e stacionit
│   ├── NetworkModeToggle.tsx   # Toggle për 4G/5G
│   ├── AnalyticsSummary.tsx    # Përmbledhje analitike
│   ├── SchedulePanel.tsx       # Paneli i orarit
│   ├── AlertsPanel.tsx         # Paneli i alerts
│   └── WeeklyStatsCard.tsx     # Karta e statistikave javore
├── lib/
│   ├── externalBuses.ts        # Integrimi me external API
│   ├── geo.ts                  # Llogaritje gjeografike (Haversine, ETA)
│   ├── mapStyles.ts            # Stilizime të personalizuara për Google Maps
│   └── weeklyStats.ts          # Procesimi i statistikave javore
├── data/
│   ├── mockData.ts             # Mock data për autobusët dhe skedulat
│   └── routes.ts               # Linjat, rrugët dhe alerts
├── types/
│   └── index.ts                # Përkufizime TypeScript
└── public/                     # Asete statike
```

---

## Rrjedha e Të Dhënave (Data Flow)

### 1. Zgjedhja e Stacionit

**Frontend:**
```typescript
User zgjedh stacion → BusStopSelector.tsx
→ Fetch në /api/bus-stops
→ Set selectedStopId në state
```

**Backend:**
```typescript
GET /api/bus-stops
→ Check cache (10 min)
→ Nëse cache i vjetër, fetch nga Google Places API
→ Multi-query nga 6 pika qendrore
→ Deduplication nga place_id
→ Return { stops: [...] }
```

### 2. Marrja e Të Dhënave të Autobusëve

**Frontend:**
```typescript
selectedStopId ndryshon
→ POST /api/buses me { stopId, existingBuses }
→ Process response dhe update state
→ Interval refresh (25s për 5G, 30s për 4G)
```

**Backend:**
```typescript
POST /api/buses
→ Parse body: { stopId, existingBuses }
→ Try: fetchExternalBuses(stopId)
  → Nëse sukses: return external buses
  → Nëse fail: generateBusesForStop(stopId, existingBuses)
→ Calculate ETA, delay, status (geo-based)
→ Return { buses: [...], dataSource, computationMethod }
```

### 3. Integrimi me External API

**externalBuses.ts:**
```typescript
fetchExternalBuses(stopId)
→ Fetch nga arvento-buses.onrender.com/api/buses
→ Fetch bus stops nga /api/bus-stops (për koordinata)
→ Map external bus data në internal Bus type
→ Calculate distance nga stop
→ Calculate ETA (haversineDistanceKm / averageSpeed)
→ Calculate delay (ETA - plannedEta)
→ Determine status (on-time/delayed/traffic-jam)
→ Return Bus[]
```

### 4. Vizualizimi në Hartë

**BusMap.tsx:**
```typescript
onLoad callback
→ Create bounds
→ Add station location
→ Filter buses (max 5km distance)
→ Set zoom 16
→ Create markers për buses
→ Create clusterer (maxZoom: 13)
→ Render markers dhe clusters
```

**Përditësimet:**
```typescript
buses array ndryshon
→ useEffect triggers
→ Clear old markers
→ Create new markers
→ Update clusterer
→ Respect user zoom/pan (nuk reset)
```

---

## Komponentët Kryesorë

### 1. `app/page.tsx` (Dashboard Kryesor)

**Përgjegjësitë:**
- Menaxhim i state global (selectedStopId, buses, selectedBus, networkMode)
- Fetch i bus stops dhe buses
- Simulation i lëvizjes së autobusëve
- Orchestrimi i komponentëve të tjerë
- Network mode effects (4G adds noise)

**Funksionalitete Kryesore:**
- `fetchBuses()`: POST request për të dhënat e autobusëve
- `moveBuses()`: Simulim i lëvizjes së autobusëve drejt destinacionit
- `applyNetworkModeEffects()`: Shtim i zhurmës për 4G mode

### 2. `components/BusMap.tsx`

**Përgjegjësitë:**
- Rendering i Google Map
- Menaxhimi i markers për autobusët dhe stacionet
- Clustering i markers
- InfoWindows për autobusët dhe stacionet
- Route polylines
- Zoom dhe distance filtering

**Funksionalitete Kryesore:**
- `onLoad()`: Initial setup, zoom 16, distance filtering (5km)
- Marker creation me custom icons (bus icons me route numbers)
- Clustering me custom renderer (orange circles me count)
- InfoWindows me detaje të plota
- Position continuity (nuk reset zoom në refresh)

### 3. `components/BusCard.tsx`

**Përgjegjësitë:**
- Shfaqja e informacionit për një autobus
- Expandable/collapsible content
- Visual feedback për selection
- Shfaqja e alerts, occupancy, price

**Funksionalitete:**
- Compact header me route number, ETA, status
- Expanded content me occupancy, price, vehicle info
- Click për selection (triggers onSelect callback)

### 4. `components/BusStopSelector.tsx`

**Përgjegjësitë:**
- Dropdown për zgjedhjen e stacionit
- Fetch i bus stops nga /api/bus-stops
- Formatting i labels (name + address)
- Loading dhe error states

### 5. `app/api/buses/route.ts`

**Endpoints:**
- `POST /api/buses`: Preferred method, accepts `{ stopId, existingBuses }`
- `GET /api/buses?stopId=...`: Fallback method (no position continuity)

**Logjika:**
- Try external API first
- Fallback në mock data nëse external API fails
- Position continuity: përdor existingBuses për smooth movement
- Safety limit: ignore existingBuses nëse > 500 items

### 6. `app/api/bus-stops/route.ts`

**Përgjegjësitë:**
- Fetch i bus stops nga Google Places API
- Multi-query nga 6 center points
- Deduplication nga place_id
- Caching (10 minutes)

**Search Strategy:**
- 6 center points rreth Prishtinës
- 2.5km radius për secilin point
- Type: `transit_station` + keyword: `bus stop`
- Parallel fetching me Promise.all

### 7. `lib/externalBuses.ts`

**Përgjegjësitë:**
- Fetch nga external API (arvento-buses.onrender.com)
- Mapping i external data në internal Bus type
- Geo-calculations (distance, ETA, delay)
- Error handling dhe timeout (10 sekonda)

---

## Algoritma dhe Llogaritjet

### 1. Llogaritja e ETA (Estimated Time of Arrival)

```typescript
distanceKm = haversineDistanceKm(
  bus.currentLat, 
  bus.currentLng,
  station.location.lat, 
  station.location.lng
)

averageSpeed = 35 km/h (default) ose nga external API
etaMinutes = (distanceKm / averageSpeed) * 60
```

**Formula Haversine:**
```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
c = 2 * atan2(√a, √(1-a))
distance = R * c (ku R = 6371 km, rrezja e Tokës)
```

### 2. Llogaritja e Vonesës

```typescript
delayMinutes = etaMinutes - plannedEta
if (delayMinutes <= 1) status = "on-time"
else if (delayMinutes <= 5) status = "delayed"
else status = "traffic-jam"
```

### 3. Distance Filtering për Map Bounds

```typescript
MAX_DISTANCE_KM = 5 // Vetëm autobusët brenda 5km
nearbyBuses = buses.filter(bus => {
  distance = haversineDistanceKm(...)
  return distance <= MAX_DISTANCE_KM
})
```

### 4. Position Continuity

```typescript
// Frontend: dërgo existingBuses në body
existingBuses: busesRef.current

// Backend: përdor existingBuses për smooth movement
existingBusesMap = new Map(existingBuses.map(b => [b.id, b]))
// Nëse bus ekziston, ruan pozicionin e mëparshëm
// Lëvizje graduale drejt destinacionit
```

### 5. Network Mode Effects (4G)

```typescript
if (networkMode === '4G') {
  noise = Math.random() * 4 - 2 // -2 to +2 minutes
  noisyEta = Math.max(1, Math.round(bus.eta + noise))
  noisyDelay = Math.max(0, noisyEta - bus.plannedEta)
  // Update status bazuar në noisyDelay
}
```

---

## Përdoruesi dhe Rrjedha e Përdorimit (User Flow)

### 1. Hyrje në Aplikacion

1. Përdoruesi hap aplikacionin
2. Shfaqet faqja kryesore me dropdown për zgjedhjen e stacionit
3. Bus stops ngarkohen automatikisht nga Google Places API
4. Nëse loading, shfaqet "Loading bus stops..."
5. Nëse error, shfaqet mesazh error dhe fallback në mock data

### 2. Zgjedhja e Stacionit

1. Përdoruesi klikon në dropdown
2. Shfaqet lista e stacioneve (format: "Emri – (adresë)")
3. Përdoruesi zgjedh një stacion
4. `selectedStopId` përditësohet në state
5. Trigger: fetch i autobusëve për stacionin e zgjedhur

### 3. Shfaqja e Autobusëve

1. Loading state shfaqet ("Fetching real-time data via 5G...")
2. POST request në `/api/buses` me `stopId` dhe `existingBuses`
3. Backend fetch nga external API (ose mock data)
4. Response: lista e autobusëve me ETA, delay, occupancy, etj.
5. Frontend process: aplikon network mode effects
6. Update state: `buses`, `lastUpdate`

### 4. Vizualizimi në Hartë

1. Google Map ngarkohet me stacionin e zgjedhur në qendër
2. Zoom fillestar: 16
3. Markers krijohen për:
   - Stacioni i zgjedhur (orange pin me "S")
   - Të gjitha bus stops (blue pins me "S")
   - Të gjithë autobusët (orange bus icons me route numbers)
4. Clustering: autobusët afër grupohen në clusters
5. InfoWindows: klikim në marker shfaq detaje

### 5. Zgjedhja e një Autobusi

1. Përdoruesi klikon në:
   - Bus card në listë, OSE
   - Bus marker në hartë, OSE
   - Bus në sidebar list
2. `selectedBus` përditësohet
3. Map pan në autobusin e zgjedhur
4. InfoWindow hapet (nëse në hartë)
5. Bus card shfaqet highlighted
6. Route polyline shfaqet (nëse ka route info)

### 6. Përditësimet në Kohë Reale

1. Interval timer (25s për 5G, 30s për 4G)
2. `fetchBuses()` thirret automatikisht
3. New buses data merret
4. `moveBuses()` simulon lëvizje graduale
5. Markers përditësohen në hartë (pa reset zoom/pan)
6. Cards përditësohen me ETA/status të ri

### 7. Switching Network Mode

1. Përdoruesi klikon toggle 4G/5G
2. `networkMode` përditësohet
3. `applyNetworkModeEffects()` aplikon zhurmë (4G) ose hiq (5G)
4. Refresh interval ndryshon (30s për 4G, 25s për 5G)
5. UI përditësohet (indicator i rrjetit)

---

## Features të Avancuara

### 1. Map Clustering

**Problem:** Kur ka shumë autobusë, markers mbivendosen dhe hartës është e vështirë për t'u lexuar.

**Zgjidhje:**
- Përdorim i MarkerClusterer me GridAlgorithm
- `maxZoom: 13` - individual markers shfaqen vetëm në zoom >= 13
- Custom cluster renderer: orange circles me white count number
- Click në cluster: auto-zoom +2 levels dhe pan në cluster

### 2. Distance Filtering dhe Zoom Clamping

**Problem:** Autobusët e largët e zmadhojnë hartën tepër (zoom out).

**Zgjidhje:**
- Distance filtering: vetëm autobusët brenda 5km përfshihen në bounds
- Zoom fillestar: 16 (fixed, pa fitBounds)
- Autobusët e largët ende shfaqen (nëse user zoom out), por nuk ndikojnë në initial zoom

### 3. Position Continuity

**Problem:** Nëse buses array ndryshon plotësisht, autobusët "teleportojnë" në pozicione të reja.

**Zgjidhje:**
- Frontend: dërgon `existingBuses` në POST body
- Backend: përdor existingBuses për të ruajtur pozicionet e mëparshme
- Lëvizje graduale drejt destinacionit (jo teleportation)
- Smooth animation në hartë

### 4. POST vs GET për Large Payloads

**Problem:** GET requests me `existingBuses` në query string shkakton 431 Request Header Fields Too Large.

**Zgjidhje:**
- Përdorim i POST me JSON body për të dhënat e mëdha
- `existingBuses` dërgohet në body (jo query string)
- GET endpoint mbetet si fallback (pa position continuity)

### 5. External API Integration me Fallback

**Problem:** External API mund të jetë i padisponueshëm (timeout, error, etj.).

**Zgjidhje:**
- Try external API first
- Timeout: 10 sekonda (për Render.com free tier)
- Nëse fail: automatic fallback në mock data
- Graceful degradation: aplikacioni vazhdon të funksionojë
- Logging: console logs tregojnë burimin e të dhënave

### 6. Multi-Query për Bus Stops

**Problem:** Një query e vetme nga Google Places API kthen vetëm 4-5 stacione të mëdha.

**Zgjidhje:**
- 6 center points rreth Prishtinës (north, south, east, west, bardhosh, center)
- Parallel queries me Promise.all
- Deduplication nga place_id
- Type: `transit_station` + keyword: `bus stop` (përfshin edhe stops të vogla)
- Rezultati: 50+ bus stops (në vend të 4-5)

---

## Performanca dhe Optimizime

### 1. Caching

- **Bus Stops**: In-memory cache për 10 minuta
- **External Buses**: Next.js fetch cache për 30 sekonda
- **Reduction**: ~90% më pak API calls

### 2. Debouncing

- **Search input**: Debounced search në BusSideList (300ms delay)
- **Reduction**: Më pak re-renders dhe filtering operations

### 3. Clustering

- **MarkerClusterer**: Grupim i markers për performance
- **Reduction**: O(n) markers → O(k) clusters (ku k << n)

### 4. Lazy Loading

- **Google Maps**: Load vetëm kur komponenti mount
- **Components**: Conditional rendering bazuar në loading state

### 5. Memoization

- **useMemo**: Për route polylines, selected bus, bus line
- **useCallback**: Për event handlers
- **Reduction**: Më pak re-computations

---

## Security dhe Best Practices

### 1. Environment Variables

- API keys në `.env.local` (jo në code)
- Server-side dhe client-side keys të ndara
- `.gitignore` përfshin `.env.local`

### 2. Error Handling

- Try-catch blocks në të gjitha API calls
- Graceful fallbacks (mock data)
- User-friendly error messages
- Console logging për debugging

### 3. Type Safety

- TypeScript për të gjithë kodbase
- Interface definitions për të gjitha data structures
- Type checking në compile time

### 4. Input Validation

- Validation në API routes (stopId required)
- Safety limits (existingBuses max 500 items)
- Coordinate validation (lat/lng ranges)

---

## Raste Përdorimi (Use Cases)

### 1. Pasagjer që Pret Autobus

**Skenar:**
- Pasagjeri është në stacion "Heroinat"
- Dëshiron të shohë kur vjen autobusi i linjës 3

**Përdorim:**
1. Zgjedh "Heroinat" nga dropdown
2. Shfaqet lista e autobusëve që vijnë në këtë stacion
3. Gjen autobusin e linjës 3
4. Shikon ETA: "4 min"
5. Status: "On time"
6. Shikon pozicionin në hartë
7. Vëzhgon lëvizjen e autobusit drejt stacionit

### 2. Pasagjer që Planifikon Udhtimin

**Skenar:**
- Pasagjeri dëshiron të shkojë nga "City Center" në "University"
- Dëshiron të shohë orarin dhe çmimin

**Përdorim:**
1. Zgjedh "City Center" si stacion
2. Zgjedh autobusin që shkon në "University"
3. Shikon skedulën në SchedulePanel
4. Shikon çmimin e biletës (0.40 €)
5. Shikon rrugën e plotë në hartë (polyline)
6. Vendos kohën e nisjes

### 3. Pasagjer që Kontrollon Statusin e Trafikut

**Skenar:**
- Pasagjeri dëshiron të shohë nëse ka vonesa ose alerts

**Përdorim:**
1. Zgjedh stacionin
2. Shikon AnalyticsSummary:
   - Average delay: 2.5 min
   - Buses on time: 8/10
3. Shikon AlertsPanel:
   - 1 alert: "Traffic jam në rrugën kryesore"
4. Shikon autobusët e vonuar në hartë (orange markers)
5. Vendos nëse të presë ose të zgjedhë rrugë tjetër

### 4. Demonstrimi i Diferencës 4G vs 5G

**Skenar:**
- Student ose profesor dëshiron të shohë simulimin e 5G

**Përdorim:**
1. Toggle në "5G mode"
   - Shikon: "5G Connected" me pulsing indicator
   - Përditësimet: çdo 25 sekonda
   - ETAs: të sakta
2. Toggle në "4G mode"
   - Shikon: "4G Connected" me static indicator
   - Përditësimet: çdo 30 sekonda
   - ETAs: me zhurmë (±1-3 min)
3. Krahasohet diferenca në latency dhe saktësi

---

## Konfigurimi dhe Setup

### Variablat e Mjedisit (Environment Variables)

```env
# Required
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional
NEXT_PUBLIC_EXTERNAL_BUSES_URL=https://arvento-buses.onrender.com/api/buses
NEXT_PUBLIC_EXTERNAL_STATS_URL=https://arvento-buses.onrender.com/api/snapshots/heatmap/hourly?range=week
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Instalimi

```bash
npm install
npm run dev
```

### Build për Production

```bash
npm run build
npm start
```

---

## Konkluzion

**SmartBus 5G Prishtina** është një aplikacion i plotë që demonstron:

1. **Kapacitetet e 5G**: Ultra-low latency, high bandwidth, real-time updates
2. **IoT Integration**: Simulim i të dhënave nga sensors në autobusë
3. **Geo-calculations**: Llogaritje realiste të distancave dhe ETAs
4. **User Experience**: UI modern, responsive, dhe intuitive
5. **Scalability**: Architecture që mund të shkallëzohet
6. **Reliability**: Error handling dhe fallbacks për robustësi

Aplikacioni ofron një platformë komplekse për gjurmimin e autobusëve që mund të përdoret si bazë për një sistem real në të ardhmen, me integrim të plotë me rrjetet 5G dhe IoT devices.

---

**Data e Dokumentimit:** Dhjetor 2024  
**Version:** 1.0  
**Status:** Komplet dhe funksional
