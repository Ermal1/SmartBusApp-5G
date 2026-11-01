'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { moveBusTowardsDestination } from '@/data/mockData';
import { busLines } from '@/data/routes';
import { Bus } from '@/types';
import { WeeklyStats } from '@/lib/weeklyStats';
import { useSSE } from '@/lib/useSSE';
import { useRequestDeduplication } from '@/lib/useRequestDeduplication';
import TopTabs, { TabType } from '@/components/TopTabs';
import BottomNavigation from '@/components/BottomNavigation';
import AppHeader from '@/components/AppHeader';
import HomeTab from '@/components/tabs/HomeTab';
import MapTab from '@/components/tabs/MapTab';
import StatsTab from '@/components/tabs/StatsTab';
import ScheduleTab from '@/components/tabs/ScheduleTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import PerformanceDebug from '@/components/PerformanceDebug';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Check onboarding on mount (only redirect if not on onboarding page already)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
      const onboardingSeen = localStorage.getItem('onboardingSeen');
      if (!onboardingSeen) {
        router.push('/onboarding');
      }
    }
  }, [router]);

  // Handle navigateToMap custom event from HomeTab
  useEffect(() => {
    const handleNavigateToMap = () => {
      setActiveTab('map');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('navigateToMap', handleNavigateToMap);
      return () => {
        window.removeEventListener('navigateToMap', handleNavigateToMap);
      };
    }
  }, []);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set(busLines.map(l => l.id))); // All lines selected by default
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Removed networkMode state - no longer needed as we're not modifying data based on network type
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [allBusStops, setAllBusStops] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<'external' | 'mock' | null>(null);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
  const busesRef = useRef<Bus[]>([]);
  const allBusStopsRef = useRef<any[]>([]);
  
  // Request Deduplication hook
  const { deduplicatedFetch } = useRequestDeduplication();
  const deduplicatedFetchRef = useRef(deduplicatedFetch);
  
  // Update ref kur ndryshon
  useEffect(() => {
    deduplicatedFetchRef.current = deduplicatedFetch;
  }, [deduplicatedFetch]);

  // Fetch bus stops on mount
  // No client-side slice/limit - use all stops returned from API
  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await fetch('/api/bus-stops');
        const data = await response.json();
        if (data.stops && Array.isArray(data.stops)) {
          // Convert to BusStop format with location object
          // Normalized shape: { id, name, lat, lng, address? }
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
          allBusStopsRef.current = stops; // Update ref gjithashtu
        }
      } catch (error) {
        console.warn('Failed to fetch bus stops:', error);
      }
    };

    fetchBusStops();
  }, []);

  // No default stop selection - map shows overview of Prishtina by default

  const selectedStop = allBusStops.find((stop) => stop.id === selectedStopId);

  // Removed applyNetworkModeEffects - no longer modifying data based on network mode

  // Clear selected bus when stop or line changes
  useEffect(() => {
    setSelectedBus(null);
  }, [selectedStopId, selectedLineId]);
  
  // Filter buses by selected lines (multiple lines can be selected)
  const filteredBuses = useMemo(() => {
    // If a specific line is selected via BusLineSelector, use that
    if (selectedLineId) {
      return buses.filter((bus) => bus.lineId === selectedLineId);
    }
    // Otherwise, filter by selected lines from BusLineFilter
    // If no lines are selected, show all buses (don't return empty array)
    if (selectedLines.size === 0) return buses; // Show all if nothing selected
    if (selectedLines.size === busLines.length) return buses; // All selected
    return buses.filter((bus) => selectedLines.has(bus.lineId));
  }, [buses, selectedLineId, selectedLines]);

  // Clear selected bus if it's no longer in the buses list
  useEffect(() => {
    if (selectedBus && !buses.find((b) => b.id === selectedBus.id)) {
      setSelectedBus(null);
    }
  }, [buses, selectedBus]);

  // Fetch weekly stats on mount and periodically
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch('/api/stats/weekly');
        const data = await response.json();
        if (data.stats) {
          setWeeklyStats(data.stats);
        }
      } catch (error) {
        // Silently fail - stats are optional
        console.warn('Failed to fetch weekly stats:', error);
      }
    };

    fetchWeeklyStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeeklyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // SSE URL (no longer depends on network mode)
  const sseUrl = selectedStopId
    ? `/api/buses/stream?stopId=${selectedStopId}`
    : null;

  // SSE handler për real-time updates - përdor ref për të shmangur re-rendering
  const handleSSEMessageRef = useRef<((data: any) => void) | null>(null);
  
  useEffect(() => {
    handleSSEMessageRef.current = (data: any) => {
      if (data.type !== 'update' || !data.buses) return;
      
      // Kontrollo nëse është array valid dhe ka të dhëna
      if (!Array.isArray(data.buses)) {
        console.warn('⚠️ [SSE] Invalid buses array format');
        return;
      }
      
      console.log('✅ [SSE] Update real-time nga SSE stream -', data.buses?.length || 0, 'autobusë');
      
      // Nëse ka të dhëna, përditëso
      if (data.buses.length > 0) {
        setBuses(data.buses);
        busesRef.current = data.buses;
        setLastUpdate(new Date());
        setLoading(false);
        
        // Set dataSource nëse vjen nga SSE
        if (data.dataSource) {
          setDataSource(data.dataSource);
        }
      } else {
        // Nëse array është bosh, mos e fshi automatikisht - mund të jetë një mesazh i gabuar
        // Vetëm nëse nuk ka të dhëna ekzistuese, vendos array bosh
        if (busesRef.current.length === 0) {
          setBuses([]);
          setLoading(false);
        } else {
          // Ruaj të dhënat ekzistuese nëse SSE dërgon array bosh
          console.warn('⚠️ [SSE] Received empty buses array, keeping existing data');
        }
      }
    };
  }, []);
  
  const handleSSEMessage = useCallback((data: any) => {
    handleSSEMessageRef.current?.(data);
  }, []);

  // SSE hook
  const { isConnected: isSSEConnected, disconnect: disconnectSSE } = useSSE(sseUrl, handleSSEMessage, {
    enabled: !!selectedStopId,
    onError: (error) => {
      console.warn('SSE connection error, falling back to polling:', error);
    },
    onConnect: () => {
      console.log('✅ [SSE] Connected për real-time updates');
      setLoading(false);
    },
    onDisconnect: () => {
      console.log('⚠️ [SSE] Disconnected');
    },
  });
  
  // Ref për SSE connection status për të shmangur dependencies që ndryshojnë
  const isSSEConnectedRef = useRef(isSSEConnected);
  useEffect(() => {
    isSSEConnectedRef.current = isSSEConnected;
  }, [isSSEConnected]);

  // Fetch buses when stop is selected OR fetch all buses when no stop is selected (for MapTab)
  useEffect(() => {
    // If we're on MapTab and no stop is selected, fetch all buses
    const shouldFetchAllBuses = activeTab === 'map' && !selectedStopId;
    
    if (!selectedStopId && !shouldFetchAllBuses) {
      // Not on MapTab and no stop selected - clear buses
      const hadBuses = busesRef.current.length > 0;
      if (hadBuses) {
        setBuses([]);
        busesRef.current = [];
      }
      if (dataSource !== null) {
        setDataSource(null);
      }
      if (loading) {
        setLoading(false);
      }
      return;
    }
    
    // Use 'all' as stopId if we should fetch all buses
    const effectiveStopId = shouldFetchAllBuses ? 'all' : selectedStopId;

    let isMounted = true;
    let isFirstFetch = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    // Optimistic Update: Shfaq të dhënat ekzistuese menjëherë (vetëm nëse janë për të njëjtin stacion)
    // Kontrollo nëse të dhënat ekzistuese janë për stacionin e zgjedhur
    if (busesRef.current.length > 0) {
      // Shfaq të dhënat ekzistuese menjëherë për UX më të shpejtë
      setBuses(busesRef.current);
      setLastUpdate(new Date());
      // Mos shfaq loading nëse ka të dhëna ekzistuese
      setLoading(false);
    }

    const fetchBuses = async (showLoading = false) => {
      if (!isMounted) return;
      
      if (showLoading || isFirstFetch) {
        setLoading(true);
        isFirstFetch = false;
      }
      
      try {
        const body = {
          stopId: effectiveStopId,
          existingBuses: busesRef.current.length > 0 ? busesRef.current : null,
        };
        
        // Request Deduplication: përdor deduplicatedFetch për të parandaluar request-e të dyfishta
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
        
        // Store last API response for debug component
        if (isMounted) {
          setLastApiResponse(data);
        }
        
        // Console log për të treguar burimin e të dhënave
        if (data.dataSource === 'external') {
          console.log('✅ [FRONTEND] Të dhëna REALE nga external API -', data.buses?.length || 0, 'autobusë');
        } else if (data.dataSource === 'mock') {
          console.log('⚠️ [FRONTEND] Të dhëna MOCK (fallback) -', data.buses?.length || 0, 'autobusë');
        }
        
        if (isMounted && data.dataSource) {
          setDataSource(data.dataSource);
        }
        
        if (!data || !Array.isArray(data.buses)) {
          console.warn('Invalid response format from API, using empty array');
          if (isMounted) {
            setBuses([]);
            busesRef.current = [];
            setDataSource(null);
          }
          return;
        }
        
        if (isMounted) {
          setBuses(data.buses);
          busesRef.current = data.buses;
          setLastUpdate(new Date());
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching buses:', error);
        if (busesRef.current.length === 0) {
          setBuses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // SSE merr kujdesin për updates real-time
    if (sseUrl) {
      // Fetch i parë për të marrë të dhënat fillestare (vetëm nëse nuk ka të dhëna ekzistuese)
      // Ose nëse effectiveStopId ka ndryshuar (p.sh. nga null në 'all')
      const shouldFetch = busesRef.current.length === 0 || 
        (effectiveStopId === 'all' && busesRef.current.length > 0 && busesRef.current[0]?.destinationStationId !== 'all');
      
      if (shouldFetch) {
        console.log('🚀 [MapTab] Fetching buses with effectiveStopId:', effectiveStopId);
        fetchBuses(true);
      } else {
        // Nëse ka të dhëna ekzistuese, mos shfaq loading dhe prit për SSE updates
        setLoading(false);
      }
      
      // Fallback polling nëse SSE dështon (vetëm nëse SSE nuk është connected)
      const fallbackPolling = setInterval(() => {
        if (isMounted && !isSSEConnectedRef.current) {
          // Vetëm nëse SSE nuk është connected, përdor polling
          fetchBuses(false);
        }
      }, 25000);
      
      return () => {
        isMounted = false;
        clearInterval(fallbackPolling);
      };
    } else if (sseUrl === null) {
      // Fallback polling if SSE is not available
      fetchBuses(true);

      const refreshInterval = 25000; // 25 seconds
      pollingInterval = setInterval(() => {
        if (isMounted) {
          fetchBuses(false);
        }
      }, refreshInterval);
      
      return () => {
        isMounted = false;
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [selectedStopId]);

  // Simulate bus movement (frequency depends on network mode)
  // Only simulate if we have buses (either from selected stop or all buses)
  useEffect(() => {
    if (buses.length === 0) {
      return;
    }

    let isMounted = true; // Flag për të parandaluar state updates pas unmount

        const moveBuses = () => {
      if (!isMounted) return;
      
      // Përdor busesRef në vend të buses state për të shmangur dependencies
      const currentBuses = busesRef.current;
      if (!currentBuses || currentBuses.length === 0) {
        return;
      }
      
      setBuses((prevBuses) => {
        if (!isMounted || prevBuses.length === 0) return prevBuses;
        
        // Përdor ref në vend të state për të shmangur dependencies që ndryshojnë
        const currentStops = allBusStopsRef.current;
        
        const updatedBuses = prevBuses.map((bus) => {
          // Use allBusStopsRef në vend të allBusStops për të shmangur dependencies
          const targetStop = currentStops.find(
            (stop) => stop.id === bus.destinationStationId
          );
          
          if (!targetStop) {
            return bus;
          }

          // Move bus towards destination
          const movedBus = moveBusTowardsDestination(bus, targetStop);
          
          return movedBus;
        });

        if (isMounted) {
        busesRef.current = updatedBuses;
        setLastUpdate(new Date());
        }
        return updatedBuses;
      });
    };

    // Movement interval based on network mode
    // Movement interval (same for all network types now)
    const movementInterval = 20000; // 20 seconds
    const interval = setInterval(moveBuses, movementInterval);
    
    return () => {
      isMounted = false; // Mark as unmounted
      clearInterval(interval);
    };
  }, [buses.length]); // Use buses.length instead of selectedStopId

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] pb-16 lg:pb-0">
      {/* New Yellow Header */}
      <AppHeader />

      {/* Top Tabs - Web only */}
      <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-2 pt-4 md:pt-6 pb-8 md:pb-8 lg:pb-8">
        {/* Performance Debug Section - Desktop only */}
        <div className="mb-4 hidden md:block">
          <PerformanceDebug lastApiResponse={lastApiResponse} />
        </div>
        
        {/* Tab Content */}
        {activeTab === 'home' && (
          <HomeTab
            selectedStopId={selectedStopId}
            selectedLineId={selectedLineId}
            onStopSelect={setSelectedStopId}
            onLineSelect={setSelectedLineId}
            buses={buses}
            filteredBuses={filteredBuses}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
            loading={loading}
            lastUpdate={lastUpdate}
            weeklyStats={weeklyStats}
            dataSource={dataSource}
            selectedStop={selectedStop}
          />
        )}

        {activeTab === 'map' && (
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
        )}

        {activeTab === 'stats' && (
          <StatsTab
            buses={filteredBuses}
            weeklyStats={weeklyStats}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            selectedStopId={selectedStopId}
            allBusStops={allBusStops}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab />
        )}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
}
