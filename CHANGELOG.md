# Changelog - SmartBus 5G Prishtina

## Recent Changes (Latest Session)

### UI/UX Improvements

1. **Removed "Select Bus Stop" Dropdown from Map Tab**
   - Removed the dropdown selector from MapTab component
   - Map now shows overview of Prishtina by default
   - Users interact directly with map markers

2. **Direct Map Interaction**
   - Clicking a bus stop marker on the map selects that stop and shows buses arriving at it
   - Clicking a bus marker selects the bus and shows its route information
   - Added `onStopSelectFromMap` callback to allow stop selection from map clicks

3. **Bus Line Filter Fix**
   - Fixed duplicate BusLineFilter display (was showing twice)
   - Now displays once in MapTab (mobile sidebar + desktop horizontal bar)
   - Removed duplicate from main page.tsx

4. **Translation to English**
   - All UI text translated from Albanian to English
   - Updated components: TopTabs, BottomNavigation, ScheduleTab, StatsTab, ProfileTab, BusLineFilter, BusLineSelector, MobileBusDetailTabs, HomeTab
   - Changed "Linjat" to "Lines" throughout the application

5. **Map Tab Default Behavior**
   - Map displays by default when MapTab is opened (centered on Prishtina)
   - No mandatory stop selection required
   - Buses are fetched automatically when on MapTab (even without selected stop)

### Map Functionality

6. **Route Visualization Changes**
   - Initially added complex route polyline with waypoints
   - Later removed complex route polyline functionality (was not working correctly)
   - Added simple mock route line for demonstration (from bus position to next stop/destination)
   - Route line shows direction of travel for selected bus only

7. **Map Position Preservation**
   - Map now preserves user's zoom and center position after refresh
   - Added `userHasInteractedRef` to track user interactions
   - Map only auto-centers on initial load, respects user's viewport after that
   - Fixed issue where map would reset position on every data refresh

8. **Optimized Bus Marker Updates**
   - Implemented efficient marker update system using Map storage
   - Bus positions update smoothly without re-rendering the entire map
   - Markers are updated in-place using `setPosition()` instead of recreating
   - Clusterer only updates when markers are added/removed, not on position changes
   - Result: Buses move smoothly on map without map refresh

### Data Fetching

9. **Fetch All Buses for Map Tab**
   - Added support for fetching all buses when on MapTab without selected stop
   - API route `/api/buses` now accepts `stopId: 'all'` to fetch all buses in Prishtina
   - Updated `fetchExternalBuses` to handle `'all'` parameter
   - Map shows all buses when no specific stop is selected

10. **Removed Direct Polyline**
    - Removed direct polyline connection from station to selected bus
    - Only shows simple route line from bus to destination/next stop (for demonstration)

### Code Structure

11. **Component Organization**
    - Moved BusLineFilter from main page to MapTab component
    - Cleaned up imports and removed unused code
    - Fixed TypeScript errors and linter warnings

12. **README Updates**
    - Updated authors: "Vesa Ademi, Natyra Arifi"
    - Removed all emojis from feature list
    - Maintained all technical documentation

### Bug Fixes

13. **Fixed "No buses to display" Issue**
    - Map now always displays (even without buses)
    - Bus list shows "No buses to display" message only in sidebar
    - Fixed `filteredBuses` to show all buses when no lines are selected (instead of empty array)

14. **Fixed Map Refresh Issue**
    - Optimized marker updates to prevent unnecessary map re-renders
    - Map position and zoom are preserved during data updates
    - Buses move smoothly without disrupting user's view

15. **Fixed Build Errors**
    - Fixed JSX syntax errors
    - Fixed duplicate identifier issues
    - Fixed missing dependencies in useEffect hooks

### Technical Details

**Files Modified:**
- `app/page.tsx` - Main application logic, bus fetching, state management
- `components/BusMap.tsx` - Map component with optimized marker updates
- `components/BusMiniMap.tsx` - Map wrapper component
- `components/tabs/MapTab.tsx` - Map tab component
- `components/BusLineFilter.tsx` - Bus line filter component
- `components/tabs/ScheduleTab.tsx` - Schedule tab
- `components/tabs/ProfileTab.tsx` - About app tab
- `components/tabs/StatsTab.tsx` - Statistics tab
- `components/MobileBusDetailTabs.tsx` - Mobile bus details
- `app/api/buses/route.ts` - API route for bus data
- `lib/externalBuses.ts` - External API integration
- `data/routes.ts` - Bus routes and waypoints (later removed)
- `README.md` - Documentation updates

**Key Technical Changes:**
- Implemented marker Map storage for efficient updates
- Added position continuity tracking with `previousBusesRef`
- Optimized clusterer updates to only refresh when needed
- Added user interaction tracking to preserve map state
- Enhanced bus fetching logic for MapTab without selected stop

**5G Functionality:**
- All 5G features remain intact and functional
- Network mode toggle (4G/5G) working correctly
- SSE (Server-Sent Events) for 5G real-time updates
- Latency simulation (1-5ms for 5G)
- Update frequency differences (5G: SSE stream, 4G: polling)
- ETA accuracy differences (4G adds noise, 5G is accurate)

---

**Note:** All changes maintain backward compatibility and do not break existing functionality. The application continues to demonstrate 5G network capabilities as required by the course project.
