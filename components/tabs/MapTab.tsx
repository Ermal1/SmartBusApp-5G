'use client';

import BusMiniMap from '@/components/BusMiniMap';
import BusLineFilter from '@/components/BusLineFilter';
import { BusStop, Bus } from '@/types';

interface MapTabProps {
  selectedStopId: string | null;
  selectedStop: BusStop | undefined;
  buses: Bus[];
  filteredBuses: Bus[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus | null) => void;
  onStopSelect: (stopId: string | null) => void;
  allBusStops: BusStop[];
  selectedLines: Set<string>;
  onToggleLine: (lineId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function MapTab({
  selectedStopId,
  selectedStop,
  buses,
  filteredBuses,
  selectedBus,
  onBusSelect,
  onStopSelect,
  // Removed networkMode prop
  allBusStops,
  selectedLines,
  onToggleLine,
  onSelectAll,
  onDeselectAll,
}: MapTabProps) {
  return (
    <div className="space-y-6">
      {/* Network Info - Hidden on Map tab (Option A) */}
      {/* Removed NetworkInfo component per requirements */}

      {/* Desktop: Bus Line Filter */}
      <div className="hidden lg:block">
        <BusLineFilter
          selectedLines={selectedLines}
          onToggleLine={onToggleLine}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
      </div>

      {/* Map - Always show, centered on Prishtina */}
      <div className="w-full">
        <BusMiniMap
          stop={selectedStop}
          buses={filteredBuses}
          selectedBus={selectedBus}
          onBusSelectFromMap={onBusSelect}
          onStopSelectFromMap={onStopSelect}
          allBusStops={allBusStops}
          lineFilterButton={
            <BusLineFilter
              selectedLines={selectedLines}
              onToggleLine={onToggleLine}
              onSelectAll={onSelectAll}
              onDeselectAll={onDeselectAll}
            />
          }
        />
      </div>
    </div>
  );
}
