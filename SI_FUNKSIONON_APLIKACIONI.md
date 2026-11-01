# Si Funksionon Aplikacioni SmartBus-5G - Hap pas Hapi

## 📱 Përshkrim i Përgjithshëm

Aplikacioni SmartBus-5G është një sistem gjurmimi autobusësh në kohë reale që demonstron avantazhet e rrjetit 5G për transport publik. Aplikacioni shfaq pozicionet e autobusëve, kohën e ardhjes (ETA), vonesat, dhe informacione të tjera relevante për përdoruesit.

---

## 🚀 Hap pas Hapi - Si Funksionon nga Ana e Përdoruesit

### **HAPI 1: Hyrja në Aplikacion**

**Çfarë ndodh:**
- Përdoruesi hap aplikacionin në browser
- Aplikacioni ngarkohet dhe fillon të marrë të dhëna

**Të dhëna që merren:**
1. **Bus Stops (Stacionet)** - ✅ **REAL DATA**
   - Burimi: Google Places API
   - Endpoint: `/api/bus-stops`
   - API: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
   - Çfarë merr: Emër, koordinata (lat/lng), adresë, place_id
   - Cache: 10 minuta
   - Status: **100% Real Data** nga Google

2. **Weekly Stats (Statistikat javore)** - ⚠️ **MIXED**
   - Burimi: External API (nëse ekziston) ose mock
   - Endpoint: `/api/stats/weekly`
   - Status: Mund të jetë real ose mock (fallback)

**Rezultati:**
- Dropdown me lista të stacioneve të autobusëve në Prishtinë
- Përdoruesi shikon emrat dhe adresat e stacioneve

---

### **HAPI 2: Zgjedhja e Stacionit**

**Çfarë ndodh:**
- Përdoruesi zgjedh një stacion nga dropdown
- Aplikacioni fillon të marrë të dhëna për autobusët që do të vijnë në atë stacion

**Të dhëna që merren:**
1. **Autobusët (Buses)** - ⚠️ **MIXED (Real me Fallback Mock)**
   - Burimi primar: External API (`arvento-buses.onrender.com/api/buses`)
   - Fallback: Mock data (nëse external API nuk funksionon)
   - Endpoint: `/api/buses` (POST)
   - Status: 
     - ✅ **Real Data** nëse external API funksionon
     - ❌ **Mock Data** nëse external API failon/timeout

**Si funksionon:**
```
1. Frontend dërgon POST request në /api/buses me stopId
2. Backend provon të marrë nga external API (arvento-buses.onrender.com)
3. Nëse external API funksionon:
   ✅ Përdor të dhënat reale (pozicione GPS, shpejtësi, targë)
4. Nëse external API failon:
   ❌ Përdor mock data (pozicione të simuluara)
```

**Çfarë llogaritet:**
- ETA (Estimated Time of Arrival) - bazuar në distancë dhe shpejtësi
- Delay (Vonesa) - diferenca midis ETA dhe planned ETA
- Status (On-time, Delayed, Traffic Jam)
- Occupancy (Low, Medium, High) - simuluar

**Rezultati:**
- Shfaqet lista me autobusët që do të vijnë në stacion
- Çdo autobus shfaq: numër linje, destinacion, ETA, status, çmim

---

### **HAPI 3: Shfaqja e Hartës**

**Çfarë ndodh:**
- Harta Google Maps shfaqet me stacionin e zgjedhur dhe autobusët

**Të dhëna që përdoren:**
1. **Google Maps** - ✅ **REAL SERVICE**
   - Burimi: Google Maps JavaScript API
   - Status: **100% Real Service** nga Google
   - Çfarë ofron: Harta, rendering, markers, polylines

2. **Pozicionet e Autobusëve** - ⚠️ **MIXED**
   - Nëse external API funksionon: ✅ Pozicione reale GPS
   - Nëse përdoret mock: ❌ Pozicione të simuluara

3. **Rrugët (Routes)** - ❌ **MOCK/HARDCODED**
   - Burimi: `data/routes.ts` → `busLines` array
   - Status: **100% Mock/Hardcoded**
   - Çfarë përmban: 6 linja me ID, numër, emër, ngjyrë, stacione, çmime

**Rezultati:**
- Harta shfaq stacionin e zgjedhur (marker portokalli)
- Shfaq autobusët si markers me numra ngjyrash (1-6)
- Shfaq rrugën e plotë si polyline me ngjyrë (kur zgjedh autobus)
- Shfaq stacionet e tjera si markers blu

---

### **HAPI 4: Zgjedhja e Autobusit**

**Çfarë ndodh:**
- Përdoruesi klikon në një autobus (ose në kartelën e autobusit)
- Shfaqen detaje shtesë për atë autobus

**Të dhëna që shfaqen:**
1. **Schedule Panel (Orari)** - ❌ **MOCK/HARDCODED**
   - Burimi: `data/routes.ts` → `schedules` array
   - Status: **100% Mock/Hardcoded**
   - Çfarë shfaq: Orari i nisjes për linjën e zgjedhur (next 3 departures)

2. **Alerts Panel (Alarmet)** - ❌ **MOCK/HARDCODED**
   - Burimi: `data/routes.ts` → `mockAlerts` array
   - Status: **100% Mock/Hardcoded**
   - Çfarë shfaq: 4 alerts hardcoded (accident, flood, traffic, construction)

3. **Live Vehicle Info** - ⚠️ **MIXED**
   - Nëse external API funksionon: ✅ Targë, shpejtësi, adresë, status real
   - Nëse përdoret mock: ❌ Nuk shfaqet (vetëm nëse ka të dhëna nga external API)

**Rezultati:**
- Shfaqet orari për linjën e zgjedhur
- Shfaqen alerts që prekin këtë linjë
- Shfaqen detaje të automjetit (nëse ka të dhëna nga external API)
- Harta fokusohet në autobusin e zgjedhur dhe shfaq rrugën e plotë

---

### **HAPI 5: Përditësimet në Kohë Reale**

**Çfarë ndodh:**
- Aplikacioni përditëson automatikisht të dhënat e autobusëve

**Frekuenca e përditësimeve:**
- **5G Mode**: Çdo 25 sekonda
- **4G Mode**: Çdo 30 sekonda

**Të dhëna që përditësohen:**
1. **Pozicionet e Autobusëve** - ⚠️ **MIXED**
   - Nëse external API funksionon: ✅ Pozicione reale të reja
   - Nëse përdoret mock: ❌ Pozicione të simuluara (lëvizje graduale)

2. **ETA dhe Delay** - ⚠️ **MIXED**
   - Nëse external API funksionon: ✅ ETA e llogaritur nga pozicioni real
   - Nëse përdoret mock: ❌ ETA e llogaritur nga pozicioni i simuluar
   - **4G Mode**: Shtohet "noise" (±1-3 minuta) për të simuluar mungesë saktësie

**Rezultati:**
- Autobusët lëvizin në hartë (nëse ka të dhëna reale ose mock)
- ETA përditësohet automatikisht
- Status ndryshon bazuar në delay

---

## 📊 Tabela e Të Dhënave: Real vs Mock

| Të dhëna | Burimi | Status | Real/Mock |
|----------|--------|--------|-----------|
| **Bus Stops** | Google Places API | ✅ Real | **100% Real** |
| **Google Maps** | Google Maps API | ✅ Real | **100% Real** |
| **Autobusët (Pozicione)** | External API (arvento-buses.onrender.com) | ⚠️ Mixed | **Real** (nëse API funksionon) / **Mock** (fallback) |
| **Routes (Linjat)** | `data/routes.ts` | ❌ Mock | **100% Mock/Hardcoded** |
| **Schedules (Orari)** | `data/routes.ts` | ❌ Mock | **100% Mock/Hardcoded** |
| **Alerts (Alarmet)** | `data/routes.ts` | ❌ Mock | **100% Mock/Hardcoded** |
| **Bus Positions (Mock)** | `data/mockData.ts` | ❌ Mock | **100% Mock** (fallback) |
| **Weekly Stats** | External API (nëse ekziston) | ⚠️ Mixed | **Real** (nëse API funksionon) / **Mock** (fallback) |

---

## 🔄 Flow Diagram i Të Dhënave

```
┌─────────────────────────────────────────────────────────────┐
│                    PËRDORUESI HAP APLIKACIONIN              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. FETCH BUS STOPS                                         │
│     ✅ Google Places API → Real Data                        │
│     Cache: 10 minuta                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. PËRDORUESI ZGJEDH STACION                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. FETCH BUSES                                             │
│     ├─ Provon External API (arvento-buses.onrender.com)    │
│     │  ├─ ✅ SUCCESS → Real Data (GPS, speed, plate)       │
│     │  └─ ❌ FAIL → Mock Data (simulated positions)         │
│     └─ Llogarit ETA, Delay, Status                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SHFAQ HARTËN                                            │
│     ✅ Google Maps API → Real Service                       │
│     ❌ Routes → Mock Data (busLines array)                  │
│     ⚠️ Bus Positions → Real (nëse API funksionon) ose Mock │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. PËRDORUESI ZGJEDH AUTOBUS                                │
│     ❌ Schedule → Mock Data (schedules array)               │
│     ❌ Alerts → Mock Data (mockAlerts array)                │
│     ⚠️ Vehicle Info → Real (nëse API funksionon) ose N/A   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. PËRDITËSIMET AUTOMATIKE                                 │
│     ├─ 5G Mode: Çdo 25 sekonda                            │
│     └─ 4G Mode: Çdo 30 sekonda (+ noise në ETA)            │
│     ⚠️ Bus Positions → Real (nëse API funksionon) ose Mock  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Përmbledhje

### Të dhëna 100% Reale:
1. ✅ **Bus Stops** - Nga Google Places API
2. ✅ **Google Maps** - Service real nga Google

### Të dhëna me Fallback (Real ose Mock):
1. ⚠️ **Autobusët** - Real nga external API, Mock si fallback
2. ⚠️ **Weekly Stats** - Real nga external API, Mock si fallback

### Të dhëna 100% Mock/Hardcoded:
1. ❌ **Routes (Linjat)** - 6 linja hardcoded
2. ❌ **Schedules (Orari)** - Orari hardcoded për çdo linjë
3. ❌ **Alerts (Alarmet)** - 4 alerts hardcoded
4. ❌ **Bus Positions (Mock)** - Pozicione të simuluara (fallback)

---

## 💡 Konkluzion

Aplikacioni përdor një kombinim të të dhënave reale dhe mock:
- **Real Data**: Stacionet (Google Places) dhe shërbimi i hartës (Google Maps)
- **Mixed Data**: Autobusët (real nëse external API funksionon, mock si fallback)
- **Mock Data**: Routes, schedules, alerts (të gjitha hardcoded për demonstrim)

Kjo strukturë lejon aplikacionin të funksionojë edhe kur external API nuk është i disponueshëm, duke përdorur mock data si fallback, ndërsa demonstron avantazhet e 5G për transport publik.

