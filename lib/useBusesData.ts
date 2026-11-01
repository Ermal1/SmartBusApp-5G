'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bus } from '@/types';
import { WeeklyStats } from '@/lib/weeklyStats';
import { useSSE } from '@/lib/useSSE';
import { useRequestDeduplication } from '@/lib/useRequestDeduplication';

interface UseBusesDataOptions {
  selectedStopId?: string | null;
  enabled?: boolean;
}

export function useBusesData({ selectedStopId = null, enabled = true }: UseBusesDataOptions = {}) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [allBusStops, setAllBusStops] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<'external' | 'mock' | null>(null);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
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

    if (enabled) {
      fetchBusStops();
    }
  }, [enabled]);

  // Clear selected bus when stop changes
  useEffect(() => {
    setSelectedBus(null);
  }, [selectedStopId]);

  // Fetch weekly stats
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch('/api/stats/weekly');
        const data = await response.json();
        if (data.stats) {
          setWeeklyStats(data.stats);
        }
      } catch (error) {
        console.warn('Failed to fetch weekly stats:', error);
      }
    };

    if (enabled) {
      fetchWeeklyStats();
      const interval = setInterval(fetchWeeklyStats, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [enabled]);

  // SSE URL
  const sseUrl = selectedStopId
    ? `/api/buses/stream?stopId=${selectedStopId}`
    : null;

  // Handle SSE messages
  const handleSSEMessageRef = useRef<((data: any) => void) | null>(null);
  useEffect(() => {
    handleSSEMessageRef.current = (data: any) => {
      if (data.buses && Array.isArray(data.buses)) {
        setBuses(data.buses);
        busesRef.current = data.buses;
        setLastUpdate(new Date());
        setDataSource(data.dataSource || 'mock');
        setLastApiResponse(data);
      }
    };
  }, []);

  const handleSSEMessage = useCallback((data: any) => {
    handleSSEMessageRef.current?.(data);
  }, []);

  // SSE hook
  const { isConnected: isSSEConnected } = useSSE(sseUrl, handleSSEMessage, {
    enabled: !!selectedStopId && enabled,
    onError: (error) => {
      console.warn('SSE connection error, falling back to polling:', error);
    },
    onConnect: () => {
      setLoading(false);
    },
    onDisconnect: () => {
      console.log('⚠️ [SSE] Disconnected');
    },
  });

  // Fetch buses when stop is selected
  useEffect(() => {
    if (!enabled || !selectedStopId) {
      if (busesRef.current.length > 0) {
        setBuses([]);
        busesRef.current = [];
      }
      return;
    }

    const fetchBuses = async () => {
      setLoading(true);
      try {
        const response = await deduplicatedFetchRef.current(`/api/buses`, () => 
          fetch(`/api/buses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stopId: selectedStopId, existingBuses: busesRef.current }),
          })
        );
        
        if (!response.ok) throw new Error('Failed to fetch buses');
        
        const data = await response.json();
        if (data.buses && Array.isArray(data.buses)) {
          setBuses(data.buses);
          busesRef.current = data.buses;
          setLastUpdate(new Date());
          setDataSource(data.dataSource || 'mock');
          setLastApiResponse(data);
        }
      } catch (error) {
        console.error('Failed to fetch buses:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchBuses();

    // Polling fallback if SSE is not connected
    const pollInterval = setInterval(() => {
      if (!isSSEConnected) {
        fetchBuses();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [selectedStopId, enabled, isSSEConnected]);

  // Clear selected bus if it's no longer in the buses list
  useEffect(() => {
    if (selectedBus && !buses.find((b) => b.id === selectedBus.id)) {
      setSelectedBus(null);
    }
  }, [buses, selectedBus]);

  return {
    buses,
    selectedBus,
    setSelectedBus,
    loading,
    lastUpdate,
    weeklyStats,
    allBusStops,
    dataSource,
    lastApiResponse,
  };
}
