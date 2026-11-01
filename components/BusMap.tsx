'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import { BusStop, Bus } from '@/types';
import { cleanMapStyle } from '@/lib/mapStyles';
import { haversineDistanceKm } from '@/lib/geo';
import { getBusLineById, getAlertsForLine, mockAlerts } from '@/data/routes';
import { busStops as staticBusStops } from '@/data/mockData';

interface BusMapProps {
  station?: BusStop; // Optional - if not provided, center on Prishtina
  buses: Bus[];
  selectedBusId: string | null;
  onSelectBus: (id: string | null) => void;
  onSelectStop?: (stopId: string | null) => void; // New: for selecting stops from map
  allBusStops?: BusStop[]; // All bus stops for route display
  pauseRefresh?: boolean; // Pause refresh when InfoWindow is open
}

// Calculate angle from bus to station (in degrees)
const calculateAngleToStation = (
  busLat: number,
  busLng: number,
  stationLat: number,
  stationLng: number
): number => {
  const lat1 = (busLat * Math.PI) / 180;
  const lng1 = (busLng * Math.PI) / 180;
  const lat2 = (stationLat * Math.PI) / 180;
  const lng2 = (stationLng * Math.PI) / 180;

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  return angle;
};

// Cache for bus icon images (base64)
const busIconImageCache = new Map<string, string>();

// Load bus image and convert to base64 (cached)
const loadBusIconImage = (): Promise<string> => {
  const cacheKey = 'bus-icon-base64';
  if (busIconImageCache.has(cacheKey)) {
    return Promise.resolve(busIconImageCache.get(cacheKey)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      busIconImageCache.set(cacheKey, base64);
      resolve(base64);
    };
    img.onerror = () => {
      reject(new Error('Failed to load bus icon image'));
    };
    img.src = '/isometric-bus-icon-yellow-vector-44811811-Photoroom.png';
  });
};

// Create bus icon using image from public folder with route number badge
const createBusIcon = (
  routeNumber: string,
  angle: number,
  isSelected: boolean,
  isDelayed: boolean,
  lineColor?: string,
  busImageBase64?: string // Optional: pre-loaded base64 image
): any => {
  // Përdor ngjyrën e linjës për badge-in, ose portokalli si fallback
  const badgeColor = lineColor || (isSelected ? '#fb923c' : '#f59e0b');
  
  // Ikona më e vogël për të shmangur mbivendosjen (zvogëluar nga 60 në 50px)
  const iconSize = isSelected ? 36 : 30;
  const badgeRadius = 9;
  const badgeY = 6; // Badge position from top
  const textLength = routeNumber.length;
  const fontSize = textLength > 1 ? 9 : 10;
  
  // Canvas dimensions
  const canvasSize = 64;
  const busImageData = busImageBase64 || '/isometric-bus-icon-yellow-vector-44811811-Photoroom.png';
  
  // Create SVG with bus image embedded as base64 and badge overlay
  const svg = `
    <svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <filter id="busShadow${routeNumber.replace(/[^a-zA-Z0-9]/g, '')}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="1.5" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- White circle background for contrast -->
      <circle cx="${canvasSize / 2}" cy="${canvasSize / 2 + 4}" r="${iconSize / 2 + 2}" fill="white" opacity="0.95"/>
      
      <!-- Bus image - centered in bottom half, rotated -->
      <g transform="translate(${canvasSize / 2}, ${canvasSize / 2 + 4}) rotate(${angle} 0 0)">
        <image 
          x="${-iconSize / 2}" 
          y="${-iconSize / 2}" 
          width="${iconSize}" 
          height="${iconSize}" 
          href="${busImageData}"
          opacity="${isDelayed ? 0.85 : 1}"
          style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));"
        />
        ${isSelected ? `
        <circle cx="0" cy="0" r="${iconSize / 2 + 4}" fill="none" stroke="#fb923c" stroke-width="2" stroke-dasharray="3,3" opacity="0.7"/>
        ` : ''}
      </g>
      
      <!-- Route number badge at top -->
      <circle cx="${canvasSize / 2}" cy="${badgeY + badgeRadius}" r="${badgeRadius}" fill="${badgeColor}" stroke="white" stroke-width="2.5"/>
      <text x="${canvasSize / 2}" y="${badgeY + badgeRadius + 1}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" dominant-baseline="central" font-family="system-ui, -apple-system, sans-serif">${routeNumber}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 50, height: 50 }, // Smaller than before (was 60)
    anchor: { x: 32, y: 56 }, // Anchor at bottom-center (center horizontally, near bottom vertically)
  };
};

// Create station marker icon with orange theme (for selected station)
const createStationIcon = (stationName: string): any => {
  const svg = `
    <svg width="56" height="56" viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="stationShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Soft orange circle background -->
      <circle cx="0" cy="0" r="26" fill="#fff5e6" opacity="0.9" filter="url(#stationShadow)"/>
      <!-- Station pin with bus stop icon -->
      <circle cx="0" cy="-8" r="14" fill="#fb923c" stroke="white" stroke-width="3"/>
      <!-- Bus stop icon -->
      <path d="M -6 -12 L -6 -4 L 6 -4 L 6 -12 Z" fill="white"/>
      <rect x="-4" y="-10" width="8" height="2" fill="#fb923c"/>
      <circle cx="0" cy="-6" r="2" fill="white"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
};

// Create bus stop marker icon (blue/green pin for all bus stops)
const createBusStopIcon = (): any => {
  const svg = `
    <svg width="40" height="40" viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Blue pin with bus stop indicator -->
      <circle cx="0" cy="-5" r="12" fill="#3b82f6" stroke="white" stroke-width="2.5"/>
      <!-- Bus stop "S" label -->
      <text x="0" y="0" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">S</text>
      <!-- Pin shadow -->
      <circle cx="0" cy="8" r="6" fill="rgba(0,0,0,0.2)"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
};

export default function BusMap({
  station,
  buses,
  selectedBusId,
  onSelectBus,
  onSelectStop,
  allBusStops = [],
  pauseRefresh = false,
}: BusMapProps) {
  const [hoveredBusId, setHoveredBusId] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [busIconBase64, setBusIconBase64] = useState<string | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<any[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Track if user has interacted with the map (moved, zoomed, etc.)
  const userHasInteractedRef = useRef(false);
  const mapInitializedRef = useRef(false);
  
  // Load bus icon image as base64 on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadBusIconImage()
        .then(base64 => setBusIconBase64(base64))
        .catch(err => {
          console.warn('Failed to load bus icon image, using fallback:', err);
        });
    }
  }, []);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setIsMounted(true);
    // Detect desktop vs mobile
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth >= 1024);
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Use allBusStops from props (passed from parent) - no need to fetch separately
  // If not provided, fetch from API as fallback
  const [localBusStops, setLocalBusStops] = useState<BusStop[]>([]);
  const effectiveBusStops = allBusStops.length > 0 ? allBusStops : localBusStops;

  // Fetch all bus stops from Google Places API only if not provided via props
  useEffect(() => {
    if (allBusStops.length > 0) {
      // Already provided via props, no need to fetch
      return;
    }

    const fetchBusStops = async () => {
      try {
        const response = await fetch('/api/bus-stops');
        const data = await response.json();
        if (data.stops && Array.isArray(data.stops)) {
          // Convert to BusStop format (with location object)
          // Normalized shape: { id, name, lat, lng, address? }
          const stops: BusStop[] = data.stops.map((stop: any) => ({
            id: stop.id,
            name: stop.name,
            address: stop.address || '',
            location: {
              lat: stop.lat,
              lng: stop.lng,
            },
          }));
          console.log('✅ [BusMap] Loaded', stops.length, 'bus stops for map markers');
          console.log('✅ [BusMap] First 3 stops:', stops.slice(0, 3).map(s => ({ id: s.id, name: s.name, location: s.location })));
          setLocalBusStops(stops);
        } else {
          console.warn('⚠️ [BusMap] No bus stops returned from API');
        }
      } catch (error) {
        console.warn('❌ [BusMap] Failed to fetch bus stops for map markers:', error);
        // Silently fail - bus stops markers are optional
      }
    };

    fetchBusStops();
  }, [allBusStops.length]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  // Default center for Prishtina (if no station selected)
  const PRISHTINA_CENTER = { lat: 42.6629, lng: 21.1655 };
  
  // Get selected bus for determining map center
  const selectedBus = useMemo(() => {
    if (!selectedBusId) return null;
    return buses.find((b) => b.id === selectedBusId) || null;
  }, [buses, selectedBusId]);

  // Map options - center on selected bus route, station, or Prishtina default
  const mapOptions = useMemo<any>(
    () => {
      // If bus is selected, center on Prishtina (don't focus on station)
      // If station is selected (and no bus), center on station
      // Otherwise, center on Prishtina
      let zoom = 13; // Default overview zoom
      let center = PRISHTINA_CENTER;
      
      if (selectedBus) {
        // When bus is selected, show overview of Prishtina to see the full route
        zoom = 13;
        center = PRISHTINA_CENTER;
      } else if (station) {
        // When station is selected (and no bus), center on station
        zoom = 16;
        center = { lat: station.location.lat, lng: station.location.lng };
      } else {
        // Default: overview of Prishtina
        zoom = 13;
        center = PRISHTINA_CENTER;
      }
      
      console.log('🗺️ MapOptions: Zoom fillestar vendosur në', zoom, selectedBus ? 'me autobus të zgjedhur' : station ? 'me stacion' : 'overview Prishtinë');
      return {
        disableDefaultUI: false,
        clickableIcons: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        backgroundColor: '#ffffff',
        zoom: zoom,
        center: center,
        styles: cleanMapStyle,
      };
    },
    [station, selectedBus]
  );

  // Constants for distance filtering
  const MAX_DISTANCE_KM = 5; // Maximum distance - zvogëluar nga 25 në 5km për të fokusuar në autobusët afër stacionit

  // Fit bounds to show station and nearby buses with padding (only on initial load, not on every refresh)
  const onLoad = useCallback(
    (mapInstance: any) => {
      setMap(mapInstance);
      console.log('🗺️ Harta u ngarkua, zoom fillestar:', mapInstance.getZoom());
      
      // Track user interactions - if user moves/zooms the map, don't auto-center on refresh
      mapInstance.addListener('dragend', () => {
        userHasInteractedRef.current = true;
        console.log('👆 Përdoruesi lëvizi hartën - nuk do të reset-ohet pozicioni');
      });
      
      mapInstance.addListener('zoom_changed', () => {
        const newZoom = mapInstance.getZoom();
        // Only mark as interacted if zoom changed significantly (not just from fitBounds)
        if (!mapInitializedRef.current) {
          userHasInteractedRef.current = true;
          console.log('🔍 👆 Përdoruesi zmadhoi/zvogëloi hartën manualisht! Zoom i ri:', newZoom);
        }
      });
      
      // Only initialize map position on first load, not on refresh
      if (mapInitializedRef.current) {
        console.log('🗺️ Harta tashmë është inicializuar - nuk do të reset-ohet pozicioni');
        return;
      }
      
      mapInitializedRef.current = true;
      
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        try {
          const currentSelectedBus = buses.find((b) => b.id === selectedBusId) || null;
          
          if (currentSelectedBus) {
            // If bus is selected, fit bounds to show the bus route (all stops)
            const busLine = getBusLineById(currentSelectedBus.lineId);
            if (busLine && allBusStops.length > 0) {
              const bounds = new (window as any).google.maps.LatLngBounds();
              
              // Add the selected bus position
              bounds.extend({
                lat: currentSelectedBus.currentLat,
                lng: currentSelectedBus.currentLng,
              });
              
              // Add all stops on the bus route
              busLine.stops.forEach((stopId) => {
                const stop = allBusStops.find((s) => s.id === stopId);
                if (stop && stop.location) {
                  bounds.extend({
                    lat: stop.location.lat,
                    lng: stop.location.lng,
                  });
                }
              });
              
              // Fit bounds with padding
              const padding = { top: 50, right: 50, bottom: 50, left: 50 };
              mapInstance.fitBounds(bounds, padding);
              
              // Clamp minimum zoom after fitBounds
              setTimeout(() => {
                const currentZoom = mapInstance.getZoom();
                if (currentZoom > 15) {
                  mapInstance.setZoom(15);
                }
              }, 100);
            } else {
              // Fallback: center on bus position
              mapInstance.setCenter({
                lat: currentSelectedBus.currentLat,
                lng: currentSelectedBus.currentLng,
              });
              mapInstance.setZoom(14);
            }
          } else if (station) {
            // If station is selected (and no bus), center on it
            const bounds = new (window as any).google.maps.LatLngBounds();
            
            // Add station
            bounds.extend({
              lat: station.location.lat,
              lng: station.location.lng,
            });

            // Filter buses by distance from station to avoid zooming out too much
            // Only include buses within MAX_DISTANCE_KM for bounds calculation
            const nearbyBuses = buses.filter((bus) => {
              const distanceKm = haversineDistanceKm(
                bus.currentLat,
                bus.currentLng,
                station.location.lat,
                station.location.lng
              );
              return distanceKm <= MAX_DISTANCE_KM;
            });

            // Center on station and set zoom 16
            mapInstance.setCenter({
              lat: station.location.lat,
              lng: station.location.lng,
            });
            
            // Set zoom 16 directly
            mapInstance.setZoom(16);
            const verifyZoom = mapInstance.getZoom();
            console.log('🔍 Vendos direkt zoom në 16. Zoom i verifikuar:', verifyZoom);
          
            if (nearbyBuses.length > 0) {
              nearbyBuses.forEach((bus) => {
                bounds.extend({ lat: bus.currentLat, lng: bus.currentLng });
              });
              const padding = { top: 30, right: 30, bottom: 30, left: 30 };
              mapInstance.fitBounds(bounds, padding);
              const currentZoom = mapInstance.getZoom();
              const MIN_ZOOM = 12;
              if (currentZoom && currentZoom < MIN_ZOOM) {
                mapInstance.setZoom(MIN_ZOOM);
              }
            } else {
              mapInstance.setCenter({ lat: station.location.lat, lng: station.location.lng });
              const MIN_ZOOM = 12;
              mapInstance.setZoom(Math.max(16, MIN_ZOOM)); // Default zoom to 16
            }
          } else {
            // No station selected - show overview of Prishtina with all buses
            const bounds = new (window as any).google.maps.LatLngBounds();
            bounds.extend(PRISHTINA_CENTER);
            
            if (buses.length > 0) {
              buses.forEach((bus) => {
                bounds.extend({ lat: bus.currentLat, lng: bus.currentLng });
              });
              const padding = { top: 40, right: 40, bottom: 40, left: 40 };
              mapInstance.fitBounds(bounds, padding);
              const currentZoom = mapInstance.getZoom();
              const MIN_ZOOM = 11;
              if (currentZoom && currentZoom < MIN_ZOOM) {
                mapInstance.setZoom(MIN_ZOOM);
              }
            } else {
              // No buses - just center on Prishtina
              mapInstance.setCenter(PRISHTINA_CENTER);
              mapInstance.setZoom(13);
            }
          }
        } catch (error) {
          console.error('Error setting map bounds:', error);
        }
      }
    },
    [station, buses, selectedBusId, allBusStops] // Depend on station, buses, selectedBusId, and allBusStops
  );

  // Update map view when selectedBusId changes (fit to bus route)
  // Always fit to bus route when bus is selected (expected behavior)
  useEffect(() => {
    if (map && isLoaded && selectedBusId) {
      const currentSelectedBus = buses.find((b) => b.id === selectedBusId) || null;
      if (currentSelectedBus && typeof window !== 'undefined' && (window as any).google?.maps) {
        try {
          const busLine = getBusLineById(currentSelectedBus.lineId);
          if (busLine && allBusStops.length > 0) {
            const bounds = new (window as any).google.maps.LatLngBounds();
            
            // Add the selected bus position
            bounds.extend({
              lat: currentSelectedBus.currentLat,
              lng: currentSelectedBus.currentLng,
            });
            
            // Add all stops on the bus route
            busLine.stops.forEach((stopId) => {
              const stop = effectiveBusStops.find((s) => s.id === stopId);
              if (stop && stop.location) {
                bounds.extend({
                  lat: stop.location.lat,
                  lng: stop.location.lng,
                });
              }
            });
            
            // Fit bounds with padding
            const padding = { top: 50, right: 50, bottom: 50, left: 50 };
            map.fitBounds(bounds, padding);
            
            // Temporarily disable interaction flag during fitBounds
            mapInitializedRef.current = false;
            setTimeout(() => {
              mapInitializedRef.current = true;
              const currentZoom = map.getZoom();
              if (currentZoom > 15) {
                map.setZoom(15);
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error updating map for selected bus:', error);
        }
      }
    }
  }, [map, isLoaded, selectedBusId, buses, effectiveBusStops]);

  // Don't auto-update bounds on refresh - respect user's current viewport
  // Only update if station changes (and no bus is selected) AND user hasn't interacted
  useEffect(() => {
    if (map && isLoaded && map.getCenter && station && !selectedBusId) {
      // Don't auto-center if user has interacted with the map
      if (userHasInteractedRef.current) {
        return;
      }
      
      try {
        if (typeof window !== 'undefined' && (window as any).google?.maps) {
          const currentCenter = map.getCenter();
          const currentZoom = map.getZoom();
          
          // Only re-center if user hasn't interacted (zoom is default or very close to station)
          const stationLat = station.location.lat;
          const stationLng = station.location.lng;
          const centerLat = currentCenter?.lat();
          const centerLng = currentCenter?.lng();
          
          // If map is still centered on station (within 0.005 degrees - më i ngushtë), update it
          if (centerLat && centerLng && 
              Math.abs(centerLat - stationLat) < 0.005 && 
              Math.abs(centerLng - stationLng) < 0.005) {
            // User hasn't moved map, safe to update
            map.setCenter({
              lat: stationLat,
              lng: stationLng,
            });
            
            // Re-center në stacion (pa limit zoom)
            console.log('🔍 Re-center: Zoom aktual:', currentZoom);
          }
          // Otherwise, respect user's current viewport
        }
      } catch (error) {
        console.error('Error updating map center:', error);
      }
    }
  }, [map, station, isLoaded]); // Removed buses dependency to avoid re-centering on refresh


  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On time';
      case 'delayed':
        return 'Delayed';
      case 'traffic-jam':
        return 'In traffic jam';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600';
      case 'delayed':
        return 'text-yellow-600';
      case 'traffic-jam':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low':
        return 'text-[var(--primary)]';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // selectedBus is already defined above in mapOptions useMemo

  // Get bus line for selected bus to show route
  const selectedBusLine = useMemo(() => {
    if (!selectedBus) return null;
    return getBusLineById(selectedBus.lineId);
  }, [selectedBus]);

  // Simple mock route line: from bus position to next stop or destination
  // This is for demonstration purposes only - shows direction of travel
  const mockRouteLine = useMemo(() => {
    if (!selectedBus) return [];
    
    // Get the bus's current position
    const busPosition = { lat: selectedBus.currentLat, lng: selectedBus.currentLng };
    
    // Try to find next stop or destination stop
    let targetStop: BusStop | null = null;
    
    // First try to find next stop
    if (selectedBus.nextStopId) {
      targetStop = effectiveBusStops.find((s) => s.id === selectedBus.nextStopId) || null;
      if (!targetStop) {
        // Try static stops
        const staticStop = staticBusStops.find((s) => s.id === selectedBus.nextStopId);
        if (staticStop) {
          targetStop = staticStop;
        }
      }
    }
    
    // If no next stop, try destination stop
    if (!targetStop && selectedBus.destinationStationId) {
      targetStop = effectiveBusStops.find((s) => s.id === selectedBus.destinationStationId) || null;
      if (!targetStop) {
        const staticStop = staticBusStops.find((s) => s.id === selectedBus.destinationStationId);
        if (staticStop) {
          targetStop = staticStop;
        }
      }
    }
    
    // If we found a target stop, create a simple line from bus to stop
    if (targetStop && targetStop.location) {
      return [
        busPosition,
        { lat: targetStop.location.lat, lng: targetStop.location.lng }
      ];
    }
    
    // Fallback: create a short line in the direction the bus is heading (mock direction)
    // Use a small offset to show direction
    return [
      busPosition,
      { 
        lat: busPosition.lat + 0.005, // Small offset north
        lng: busPosition.lng + 0.005  // Small offset east
      }
    ];
  }, [selectedBus, effectiveBusStops]);

  // Get alerts for selected bus line
  const routeAlerts = useMemo(() => {
    if (!selectedBusLine) return [];
    return getAlertsForLine(selectedBusLine.id);
  }, [selectedBusLine]);

  // Store markers in a Map for efficient updates without re-creating
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const previousBusesRef = useRef<Map<string, Bus>>(new Map());

  // Create and update markers with clustering - optimized to update positions without re-rendering map
  useEffect(() => {
    if (!map || !isLoaded || typeof window === 'undefined' || !(window as any).google?.maps) {
      return;
    }
    
    // Wait for bus icon to be loaded before creating markers (base64 is required for SVG data URIs)
    if (!busIconBase64) {
      return;
    }
    
    const google = (window as any).google;
    
    // If no buses, clear all markers
    if (buses.length === 0) {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      markersMapRef.current.forEach((marker) => marker.setMap(null));
      markersMapRef.current.clear();
      markersRef.current = [];
      previousBusesRef.current.clear();
      return;
    }

    // Create a Map of current buses for efficient lookup
    const currentBusesMap = new Map(buses.map(bus => [bus.id, bus]));
    
    // Update existing markers' positions without recreating them
    const markersToUpdate: any[] = [];
    const busesToRemove: string[] = [];
    
    // Check existing markers - update or remove
    markersMapRef.current.forEach((marker, busId) => {
      const currentBus = currentBusesMap.get(busId);
      if (!currentBus) {
        // Bus no longer exists - remove marker
        marker.setMap(null);
        markersMapRef.current.delete(busId);
        busesToRemove.push(busId);
      } else {
        // Bus exists - always update position smoothly without recreating marker
        const previousBus = previousBusesRef.current.get(busId);
        const positionChanged = !previousBus || 
          previousBus.currentLat !== currentBus.currentLat || 
          previousBus.currentLng !== currentBus.currentLng;
        
        const isSelected = selectedBusId === currentBus.id;
        const wasSelected = (marker as any).previousSelectedBusId === currentBus.id;
        const selectionChanged = isSelected !== wasSelected;
        const iconNeedsUpdate = !previousBus || 
          previousBus.routeNumber !== currentBus.routeNumber ||
          previousBus.delayMinutes !== currentBus.delayMinutes ||
          selectionChanged;
        
        // Always update position if it changed (or if no previous data)
        if (positionChanged) {
          marker.setPosition({
            lat: currentBus.currentLat,
            lng: currentBus.currentLng,
          });
        }
        
        // Update icon if needed
        if (iconNeedsUpdate) {
          const angle = station
            ? calculateAngleToStation(
                currentBus.currentLat,
                currentBus.currentLng,
                station.location.lat,
                station.location.lng
              )
            : 0;
          const isDelayed = currentBus.delayMinutes > 1;
          const busLine = getBusLineById(currentBus.lineId);
          const lineColor = busLine?.color;
          const icon = createBusIcon(currentBus.routeNumber, angle, isSelected, isDelayed, lineColor, busIconBase64 || undefined);
          marker.setIcon(icon);
          marker.setZIndex(isSelected ? 1000 : 500);
          marker.setAnimation(isSelected ? google.maps.Animation.BOUNCE : undefined);
          marker.setOpacity(isSelected ? 1 : selectedBusId ? 0.7 : 1);
        }
        
        // Update stored bus data
        (marker as any).busData = currentBus;
        (marker as any).previousSelectedBusId = selectedBusId;
        markersToUpdate.push(marker);
      }
    });
    
    // Create new markers for buses that don't have markers yet
    buses.forEach((bus) => {
      if (!markersMapRef.current.has(bus.id)) {
        const isSelected = selectedBusId === bus.id;
        const angle = station
          ? calculateAngleToStation(
              bus.currentLat,
              bus.currentLng,
              station.location.lat,
              station.location.lng
            )
          : 0;
        const isDelayed = bus.delayMinutes > 1;
        const busLine = getBusLineById(bus.lineId);
        const lineColor = busLine?.color;
        const icon = createBusIcon(bus.routeNumber, angle, isSelected, isDelayed, lineColor, busIconBase64 || undefined);

        const marker = new google.maps.Marker({
          position: {
            lat: bus.currentLat,
            lng: bus.currentLng,
          },
          icon,
          title: `Route ${bus.routeNumber}: ${bus.destination}`,
          zIndex: isSelected ? 1000 : 500,
          animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
          opacity: isSelected ? 1 : selectedBusId ? 0.7 : 1,
        });

        (marker as any).busData = bus;
        (marker as any).previousSelectedBusId = selectedBusId;

        marker.addListener('click', () => {
          onSelectBus(bus.id);
          // Only show InfoWindow on desktop (mobile uses BottomSheet)
          // Check window size directly since marker listeners are created in useEffect
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setHoveredBusId(bus.id);
            setInfoWindowOpen(true);
          }
          if (map) {
            map.panTo({
              lat: bus.currentLat,
              lng: bus.currentLng,
            });
          }
        });

        markersMapRef.current.set(bus.id, marker);
        markersToUpdate.push(marker);
      }
    });

    // Update markersRef for clusterer
    markersRef.current = Array.from(markersMapRef.current.values());

    // Update clusterer - but don't recreate it completely to avoid map refresh
    if (clustererRef.current) {
      // Only update clusterer if markers were added/removed, not on every position update
      const markersChanged = busesToRemove.length > 0 || 
        buses.some(bus => !markersMapRef.current.has(bus.id));
      
      if (markersChanged) {
        // Markers added/removed - need to update clusterer
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markersRef.current);
      }
      // If only positions changed, clusterer will automatically update clusters
    } else {
      // Create new clusterer
      const algorithm = new GridAlgorithm({ maxZoom: 13 });

      class CustomClusterRenderer {
        render({ count, position }: { count: number; position: google.maps.LatLng }, stats: any, map: google.maps.Map) {
          const size = count < 10 ? 36 : count < 100 ? 38 : 40;
          const color = '#f59e0b';
          
          const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2.5"/>
              <text x="${size/2}" y="${size/2 + 3}" text-anchor="middle" fill="white" font-size="${count < 100 ? '13' : '11'}" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">${count}</text>
            </svg>
          `;
          
          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
              scaledSize: new google.maps.Size(size, size),
              anchor: new google.maps.Point(size/2, size/2),
            },
            zIndex: 300,
          });

          clusterMarker.addListener('click', () => {
            const currentZoom = map.getZoom() || 14;
            const newZoom = Math.min(currentZoom + 2, 18);
            map.setZoom(newZoom);
            map.panTo(position);
          });

          return clusterMarker;
        }
      }

      const clusterer = new MarkerClusterer({
        map,
        markers: markersRef.current,
        algorithm,
        renderer: new CustomClusterRenderer() as any,
      });

      clustererRef.current = clusterer;
    }

    // Update previous buses ref for next comparison
    previousBusesRef.current = currentBusesMap;

    // Cleanup
    return () => {
      // Don't clear on every update - only on unmount
    };
  }, [map, isLoaded, buses, selectedBusId, station, onSelectBus, busIconBase64]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      markersMapRef.current.forEach((marker) => marker.setMap(null));
      markersMapRef.current.clear();
      markersRef.current = [];
      previousBusesRef.current.clear();
    };
  }, []);

  // Pan to selected bus and open InfoWindow when selection changes (from side list or card)
  // MUST be called before early returns
  useEffect(() => {
    if (map && selectedBusId && isLoaded && !pauseRefresh) {
      const selectedBus = buses.find((b) => b.id === selectedBusId);
      if (selectedBus && typeof window !== 'undefined' && (window as any).google?.maps) {
        try {
          // Pan to bus
          map.panTo({
            lat: selectedBus.currentLat,
            lng: selectedBus.currentLng,
          });
          // Open InfoWindow if not already open (desktop only - mobile uses BottomSheet)
          if (isDesktop) {
            if (!hoveredBusId || hoveredBusId !== selectedBusId) {
              setHoveredBusId(selectedBusId);
              setInfoWindowOpen(true);
            }
          }
        } catch (error) {
          console.error('Error panning to bus:', error);
        }
      }
    }
  }, [map, selectedBusId, buses, isLoaded, pauseRefresh, hoveredBusId]);

  // Don't render until mounted (prevents hydration errors)
  // Early returns MUST come after all hooks
  if (!isMounted) {
    return (
      <div className="h-[500px] bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || loadError) {
    return (
      <div className="h-[500px] bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          {!apiKey ? (
            <>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Google Maps API Key Required
              </p>
              <p className="text-xs text-gray-600">
                Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Map Loading Error
              </p>
              <p className="text-xs text-gray-600">
                {loadError?.message || 'Unable to load Google Maps'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm h-[700px] w-full">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={mapOptions}
        onLoad={onLoad}
      >
        {/* Selected station marker (highlighted) - duhet të shfaqet gjithmonë */}
        {station && station.location && station.location.lat && station.location.lng && (
          <Marker
            position={{
              lat: station.location.lat,
              lng: station.location.lng,
            }}
            icon={createStationIcon(station.name)}
            title={station.name}
            zIndex={1000}
          >
          {/* InfoWindow for selected station */}
          <InfoWindow
            position={{
              lat: station.location.lat,
              lng: station.location.lng,
            }}
            options={{
              maxWidth: 250,
            }}
          >
            <div className="p-2">
              <div className="font-semibold text-gray-900 mb-1 text-sm">
                {station.name}
              </div>
              {station.address && (
                <div className="text-xs text-gray-600">
                  {station.address}
                </div>
              )}
            </div>
          </InfoWindow>
          </Marker>
        )}

        {/* All bus stop markers (from Google Places) */}
        {effectiveBusStops && effectiveBusStops.length > 0 && effectiveBusStops.map((stop) => {
          // Skip if this is the selected station (already shown above)
          if (station && stop.id === station.id) return null;
          
          // Kontrollo nëse stop ka location valid
          if (!stop.location || !stop.location.lat || !stop.location.lng) {
            console.warn('⚠️ [BusMap] Invalid stop location:', stop);
            return null;
          }
          
          return (
            <Marker
              key={stop.id}
              position={{
                lat: stop.location.lat,
                lng: stop.location.lng,
              }}
              icon={createBusStopIcon()}
              title={stop.name}
              zIndex={800}
              onMouseOver={() => setHoveredStopId(stop.id)}
              onMouseOut={() => setHoveredStopId(null)}
              onClick={() => {
                // When clicking a stop, select it and show buses arriving at that stop
                if (onSelectStop) {
                  onSelectStop(stop.id);
                }
                // Also clear bus selection when selecting a stop
                if (onSelectBus) {
                  onSelectBus(null);
                }
              }}
            >
              {/* InfoWindow for bus stops on hover or click */}
              {hoveredStopId === stop.id && (
                <InfoWindow
                  position={{
                    lat: stop.location.lat,
                    lng: stop.location.lng,
                  }}
                  onCloseClick={() => setHoveredStopId(null)}
                  options={{
                    maxWidth: 250,
                  }}
                >
                  <div className="p-2">
                    <div className="font-semibold text-gray-900 mb-1 text-sm">
                      {stop.name}
                    </div>
                    {stop.address && (
                      <div className="text-xs text-gray-600 mb-2">
                        {stop.address}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (onSelectStop) {
                          onSelectStop(stop.id);
                        }
                        if (onSelectBus) {
                          onSelectBus(null);
                        }
                        setHoveredStopId(null);
                      }}
                      className="mt-2 px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
                    >
                      Show buses at this stop
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {/* Simple mock route line - for demonstration purposes only */}
        {selectedBus && mockRouteLine.length === 2 && (
          <Polyline
            path={mockRouteLine}
            options={{
              strokeColor: selectedBusLine?.color || '#f59e0b',
              strokeOpacity: 0.6,
              strokeWeight: 4,
              zIndex: 50,
              geodesic: false,
            }}
          />
        )}

        {/* Alert markers on map */}
        {routeAlerts.map((alert) => {
          if (!alert.location) return null;
          return (
            <Marker
              key={`alert-${alert.id}`}
              position={{
                lat: alert.location.lat,
                lng: alert.location.lng,
              }}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="32" height="32" viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="0" cy="0" r="14" fill="${alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'}" stroke="white" stroke-width="3"/>
                    <text x="0" y="6" text-anchor="middle" fill="white" font-size="18" font-weight="bold">⚠</text>
                  </svg>
                `)}`,
              }}
              title={alert.title}
              zIndex={700}
            />
          );
        })}

        {/* No direct polyline between station and bus - only show route polyline */}

        {/* InfoWindow for selected/hovered bus - Desktop only (mobile uses BottomSheet) */}
        {isDesktop && (hoveredBusId || (selectedBusId && infoWindowOpen)) && (() => {
          const bus = buses.find((b) => b.id === (hoveredBusId || selectedBusId));
          if (!bus) return null;
          return (
            <InfoWindow
              position={{
                lat: bus.currentLat,
                lng: bus.currentLng,
              }}
              onCloseClick={() => {
                setHoveredBusId(null);
                setInfoWindowOpen(false);
                // Clear selectedBusId nëse është i njëjtë me busin që po mbyllim
                if (selectedBusId === bus.id) {
                  onSelectBus(null); // Clear selection - kjo do të thërrasë parent component për të fshirë selectedBus
                }
              }}
              onUnmount={() => {
                setInfoWindowOpen(false);
              }}
              options={{
                maxWidth: 280,
                disableAutoPan: false,
              }}
            >
              <div className="p-3" style={{ maxWidth: '280px', overflow: 'visible' }}>
                <div className="font-semibold text-gray-900 mb-1.5 text-sm">
                  Route {bus.routeNumber}
                </div>
                <div className="text-sm text-gray-600 mb-2.5 leading-tight">
                  {bus.destination}
                </div>
                <div className="space-y-1.5 text-xs mb-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 whitespace-nowrap">ETA:</span>
                    <span className="font-semibold text-gray-900">{bus.eta} min</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 whitespace-nowrap">Status:</span>
                    <span className={`font-medium ${getStatusColor(bus.status)} text-right`}>
                      {bus.delayMinutes <= 1
                        ? 'On time'
                        : `Delay: ${bus.delayMinutes.toFixed(1)}m`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 whitespace-nowrap">Occupancy:</span>
                    <span className={`font-medium ${getOccupancyColor(bus.occupancy)} text-right`}>
                      {bus.occupancy.charAt(0).toUpperCase() + bus.occupancy.slice(1)}
                    </span>
                  </div>
                </div>
                
                {/* Vehicle Details from External API */}
                {(bus.plate || bus.speedKmh !== undefined || bus.address || bus.lastUpdated || bus.derivedStatus) && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="space-y-1 text-xs">
                      {bus.plate && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Plate:</span>
                          <span className="font-medium text-gray-900">{bus.plate}</span>
                        </div>
                      )}
                      {bus.speedKmh !== undefined && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Speed:</span>
                          <span className="font-medium text-gray-900">{bus.speedKmh.toFixed(1)} km/h</span>
                        </div>
                      )}
                      {bus.address && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-gray-900 text-right text-[10px] leading-tight max-w-[140px]">
                            {bus.address.length > 40 ? `${bus.address.substring(0, 40)}...` : bus.address}
                          </span>
                        </div>
                      )}
                      {bus.derivedStatus && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className={`font-medium ${
                            bus.derivedStatus === 'moving' ? 'text-green-700' :
                            bus.derivedStatus === 'offline' ? 'text-red-700' :
                            'text-gray-700'
                          }`}>
                            {bus.derivedStatus.charAt(0).toUpperCase() + bus.derivedStatus.slice(1)}
                          </span>
                        </div>
                      )}
                      {bus.lastUpdated && (() => {
                        const updatedDate = new Date(bus.lastUpdated);
                        const now = new Date();
                        const diffMinutes = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60));
                        const timeStr = diffMinutes < 1 
                          ? 'Just now' 
                          : diffMinutes < 60 
                            ? `${diffMinutes}m ago`
                            : updatedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-600">Updated:</span>
                            <span className="font-medium text-gray-900">{timeStr}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>
    </div>
  );
}
