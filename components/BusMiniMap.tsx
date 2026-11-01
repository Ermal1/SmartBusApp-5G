'use client';

import { ReactNode, useState, useEffect } from 'react';
import BusMap from './BusMap';
import TripInfoCard from './TripInfoCard';
import BusSideList from './BusSideList';
import MobileBusDetailTabs from './MobileBusDetailTabs';
import BusBottomSheet from './BusBottomSheet';
import { BusStop, Bus } from '@/types';
// Removed NetworkMode import - no longer using network mode

interface BusMiniMapProps {
  stop?: BusStop; // Optional - if not provided, show overview
  buses: Bus[];
  selectedBus: Bus | null;
  // Removed networkMode prop - no longer needed
  onBusSelectFromMap?: (bus: Bus | null) => void;
  onStopSelectFromMap?: (stopId: string | null) => void; // New: for selecting stops from map
  allBusStops?: BusStop[]; // Për të shfaqur stacionet në rrugë
  lineFilterButton?: React.ReactNode; // Optional: line filter button to display in card header
}

export default function BusMiniMap({
  stop,
  buses,
  selectedBus,
  onBusSelectFromMap,
  onStopSelectFromMap,
  allBusStops = [],
  lineFilterButton,
}: BusMiniMapProps) {
  // Find nearest bus if no selection
  const nearestBus = buses.length > 0 ? buses[0] : null;
  
  // Bottom sheet state - open when bus is selected on mobile
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  
  // Open bottom sheet when bus is selected on mobile
  useEffect(() => {
    if (selectedBus && typeof window !== 'undefined') {
      // Only open on mobile screens
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      if (isMobile) {
        setBottomSheetOpen(true);
      }
    } else {
      setBottomSheetOpen(false);
    }
  }, [selectedBus]);
  
  const handleCloseBottomSheet = () => {
    setBottomSheetOpen(false);
    if (onBusSelectFromMap) {
      onBusSelectFromMap(null);
    }
  };

  return (
    <div className="w-full">
      {/* Bottom Sheet for Mobile - Shows bus details */}
      <BusBottomSheet
        bus={selectedBus}
        isOpen={bottomSheetOpen}
        onClose={handleCloseBottomSheet}
      />
      
      {/* Mobile: Map on top, list below */}
      <div className="lg:hidden bg-white/90 rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 relative">
          {lineFilterButton && (
            <div className="absolute top-3 right-3 z-10">
              {lineFilterButton}
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Live Network Map
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Real-time locations of buses across Prishtina.
            </p>
          </div>
        </div>

        {/* Map - full width on mobile */}
        <div className="p-4 rounded-2xl overflow-hidden" style={{ minHeight: '60vh' }}>
          <BusMap
            station={selectedBus ? undefined : (stop || undefined)} // Don't center on station if bus is selected
            buses={buses}
            selectedBusId={selectedBus?.id || null}
            onSelectBus={(id) => {
              if (onBusSelectFromMap) {
                if (id === null) {
                  onBusSelectFromMap(null);
                } else {
                  const bus = buses.find((b) => b.id === id);
                  onBusSelectFromMap(bus || null);
                }
              }
            }}
            onSelectStop={(stopId) => {
              if (onStopSelectFromMap) {
                onStopSelectFromMap(stopId);
              }
            }}
            allBusStops={allBusStops}
            pauseRefresh={false}
          />
        </div>

        {/* Bus List - below map on mobile - Show buses for selected stop OR all buses */}
        {buses.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <BusSideList
              buses={buses}
              stop={stop}
              selectedBusId={selectedBus?.id || null}
              onSelectBus={(id) => {
                if (onBusSelectFromMap) {
                  if (id === null) {
                    onBusSelectFromMap(null);
                  } else {
                    const bus = buses.find((b) => b.id === id);
                    onBusSelectFromMap(bus || null);
                  }
                }
              }}
              onBusClick={(bus) => {
                if (onBusSelectFromMap) {
                  onBusSelectFromMap(bus);
                }
              }}
            />
          </div>
        )}

        {/* Mobile Bus Detail Tabs - Removed, using BottomSheet instead */}
        {/* BottomSheet handles mobile bus details display */}

        {/* Trip Info Card - Mobile only (vetëm nëse nuk ka autobus të zgjedhur) */}
        {!selectedBus && (
          <TripInfoCard
            station={stop}
            selectedBus={selectedBus}
            nearestBus={nearestBus}
          />
        )}
      </div>

      {/* Desktop: Full-width card with Map (left 70%) + List (right 30%) */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Live Network Map
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time locations of buses across Prishtina.
            </p>
          </div>
        </div>

        {/* Two-column layout: Map (left 70%) + List (right 30%) */}
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Left: Map - 70% width, taller height - Always show map */}
          <div className="flex-1 min-w-0" style={{ flex: '1 1 70%' }}>
            <BusMap
              station={selectedBus ? undefined : (stop || undefined)} // Don't center on station if bus is selected
              buses={buses}
              selectedBusId={selectedBus?.id || null}
              onSelectBus={(id) => {
                if (onBusSelectFromMap) {
                  const bus = buses.find((b) => b.id === id);
                  onBusSelectFromMap(bus || null);
                }
              }}
              onSelectStop={(stopId) => {
                if (onStopSelectFromMap) {
                  onStopSelectFromMap(stopId);
                }
              }}
              allBusStops={allBusStops}
              pauseRefresh={false}
            />
          </div>
          
          {/* Right: Live Buses List - 30% width - Show when stop is selected OR show all buses */}
          <div className="flex-shrink-0" style={{ flex: '0 0 30%' }}>
            {buses.length > 0 ? (
              <BusSideList
                buses={buses}
                stop={stop}
                selectedBusId={selectedBus?.id || null}
                onSelectBus={(id) => {
                  if (onBusSelectFromMap) {
                    const bus = buses.find((b) => b.id === id);
                    onBusSelectFromMap(bus || null);
                  }
                }}
                onBusClick={(bus) => {
                  if (onBusSelectFromMap) {
                    onBusSelectFromMap(bus);
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-sm">No buses to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer note - Desktop only */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 italic text-center">
            * Map shows real GPS positions transmitted over 5G networks in production
          </p>
        </div>
      </div>
    </div>
  );
}
