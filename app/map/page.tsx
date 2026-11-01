'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { busLines } from '@/data/routes';
import { Bus } from '@/types';
import SharedPageLayout from '@/components/SharedPageLayout';
import MapTab from '@/components/tabs/MapTab';
import { useSSE } from '@/lib/useSSE';
import { useRequestDeduplication } from '@/lib/useRequestDeduplication';
import { moveBusTowardsDestination } from '@/data/mockData';

export default function MapPage() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set(busLines.map(l => l.id)));
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(false);
  const [allBusStops, setAllBusStops] = useState<any[]>([]);
  const busesRef = useRef<Bus[]>([]);
  const allBusStopsRef = useRef<any[]>([]);
  
  const { deduplicatedFetch } = useRequestDeduplication();
  const deduplicatedFetchRef = useRef(deduplicatedFetch);
  
  useEffect(() => {
    deduplicatedFetchRef.current = deduplicatedFetch;
  }, [deduplicatedFetch]);

  // Fetch bus stops on mount
  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await fetch('/api/bus-stops');
        const data = await response.json();
        if (data.stops && Array.isArray(data.stops)) {
          const stops = data.stops.map((stop: any) => ({
            id: stop.id,
            name: stop.name,
            address: stop.address || '',
            location: {
              lat: stop.lat,
              lng: stop.lng,
            },
          }));
          setAllBusStops(stops);
          allBusStopsRef.current = stops;
        }
      } catch (error) {
        console.warn('Failed to fetch bus stops:', error);
      }
    };

    fetchBusStops();
  }, []);

  const selectedStop = allBusStops.find((stop) => stop.id === selectedStopId);

  // Clear selected bus when stop changes
  useEffect(() => {
    setSelectedBus(null);
  }, [selectedStopId]);

  // Filter buses by selected lines
  const filteredBuses = useMemo(() => {
    if (selectedLines.size === 0) return buses;
    if (selectedLines.size === busLines.length) return buses;
    return buses.filter((bus) => selectedLines.has(bus.lineId));
  }, [buses, selectedLines]);

  // Clear selected bus if it's no longer in the buses list
  useEffect(() => {
    if (selectedBus && !buses.find((b) => b.id === selectedBus.id)) {
      setSelectedBus(null);
    }
  }, [buses, selectedBus]);

  // SSE URL - for map, use 'all' if no stop selected, otherwise use selectedStopId
  const effectiveStopId = selectedStopId || 'all';
  const sseUrl = `/api/buses/stream?stopId=${effectiveStopId}`;

  // Handle SSE messages
  const handleSSEMessageRef = useRef<((data: any) => void) | null>(null);
  useEffect(() => {
    handleSSEMessageRef.current = (data: any) => {
      if (data.buses && Array.isArray(data.buses)) {
        setBuses(data.buses);
        busesRef.current = data.buses;
      }
    };
  }, []);

  const handleSSEMessage = useCallback((data: any) => {
    handleSSEMessageRef.current?.(data);
  }, []);

  // SSE hook
  const { isConnected: isSSEConnected } = useSSE(sseUrl, handleSSEMessage, {
    enabled: true,
    onError: (error) => {
      console.warn('SSE connection error, falling back to polling:', error);
    },
    onConnect: () => {
      setLoading(false);
    },
  });

  const isSSEConnectedRef = useRef(isSSEConnected);
  useEffect(() => {
    isSSEConnectedRef.current = isSSEConnected;
  }, [isSSEConnected]);

  // Fetch buses - for map, always fetch (either all buses or for selected stop)
  useEffect(() => {
    let isMounted = true;

    const fetchBuses = async (showLoading = false) => {
      if (!isMounted) return;
      
      if (showLoading) {
        setLoading(true);
      }
      
      try {
        const body = {
          stopId: effectiveStopId,
          existingBuses: busesRef.current.length > 0 ? busesRef.current : null,
        };
        
        const response = await deduplicatedFetchRef.current(
          `buses-${effectiveStopId}`,
          () => fetch('/api/buses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
        );
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.buses && Array.isArray(data.buses)) {
          setBuses(data.buses);
          busesRef.current = data.buses;
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching buses:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchBuses(true);

    // Polling fallback if SSE is not connected
    const pollInterval = setInterval(() => {
      if (!isSSEConnectedRef.current) {
        fetchBuses(false);
      }
    }, 25000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [effectiveStopId]);

  // Simulate bus movement
  useEffect(() => {
    if (buses.length === 0) {
      return;
    }

    let isMounted = true;

    const moveBuses = () => {
      if (!isMounted) return;
      
      const currentBuses = busesRef.current;
      if (!currentBuses || currentBuses.length === 0) {
        return;
      }
      
      setBuses((prevBuses) => {
        if (!isMounted || prevBuses.length === 0) return prevBuses;
        
        const currentStops = allBusStopsRef.current;
        
        const updatedBuses = prevBuses.map((bus) => {
          const targetStop = currentStops.find(
            (stop) => stop.id === bus.destinationStationId
          );
          
          if (!targetStop) {
            return bus;
          }

          const movedBus = moveBusTowardsDestination(bus, targetStop);
          return movedBus;
        });

        if (isMounted) {
          busesRef.current = updatedBuses;
        }
        return updatedBuses;
      });
    };

    const movementInterval = 20000; // 20 seconds
    const interval = setInterval(moveBuses, movementInterval);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [buses.length]);

  return (
    <SharedPageLayout showFooter={false}>
      <MapTab
        selectedStopId={selectedStopId}
        selectedStop={selectedStop}
        buses={buses}
        filteredBuses={filteredBuses}
        selectedBus={selectedBus}
        onBusSelect={setSelectedBus}
        onStopSelect={setSelectedStopId}
        allBusStops={allBusStops}
        selectedLines={selectedLines}
        onToggleLine={(lineId: string) => {
          setSelectedLines(prev => {
            const next = new Set(prev);
            if (next.has(lineId)) {
              next.delete(lineId);
            } else {
              next.add(lineId);
            }
            return next;
          });
        }}
        onSelectAll={() => setSelectedLines(new Set(busLines.map(l => l.id)))}
        onDeselectAll={() => setSelectedLines(new Set())}
      />
    </SharedPageLayout>
  );
}
