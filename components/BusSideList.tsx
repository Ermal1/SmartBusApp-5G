'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bus, BusStop } from '@/types';
import { getBusLineById } from '@/data/routes';

interface BusSideListProps {
  buses: Bus[];
  stop?: BusStop; // Optional - if not provided, don't show stop-specific info
  selectedBusId: string | null;
  onSelectBus: (id: string) => void;
  onBusClick?: (bus: Bus) => void; // Optional callback to center map
}

export default function BusSideList({
  buses,
  stop,
  selectedBusId,
  onSelectBus,
  onBusClick,
}: BusSideListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter buses by search query (plate, route, or ID)
  const filteredBuses = useMemo(() => {
    if (!debouncedQuery.trim()) return buses;
    const query = debouncedQuery.toLowerCase();
    return buses.filter((bus) => {
      return (
        bus.plate?.toLowerCase().includes(query) ||
        bus.id.toLowerCase().includes(query) ||
        bus.routeNumber.toLowerCase().includes(query) ||
        bus.destination?.toLowerCase().includes(query)
      );
    });
  }, [buses, debouncedQuery]);

  if (buses.length === 0) {
    return null;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On time';
      case 'delayed':
        return 'Delayed';
      case 'traffic-jam':
        return 'In Traffic Jam';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-700 bg-green-50';
      case 'delayed':
        return 'text-yellow-700 bg-yellow-50';
      case 'traffic-jam':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[700px] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Live Buses ({buses.length})
        </h4>
        {stop && (
          <p className="text-xs text-gray-500 mb-3">
            Buses near {stop.name}
          </p>
        )}
        <input
          type="text"
          placeholder="Search by plate or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredBuses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-gray-500">No buses found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBuses.map((bus) => {
              const isSelected = selectedBusId === bus.id;
              const busLine = getBusLineById(bus.lineId);
              const lineColor = busLine?.color;
              return (
                <div
                  key={bus.id}
                  onClick={() => {
                    onSelectBus(bus.id);
                    if (onBusClick) {
                      onBusClick(bus);
                    }
                  }}
                  className={`p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--primary-soft)] border-l-4 border-l-[var(--primary)]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Compact single-line layout */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span 
                        className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 text-white"
                        style={{
                          backgroundColor: isSelected 
                            ? (lineColor || '#2563eb')
                            : (lineColor || '#f59e0b')
                        }}
                      >
                        {bus.routeNumber}
                      </span>
                      {bus.plate && (
                        <span className="text-xs text-gray-600 font-mono truncate">{bus.plate}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                      {bus.eta} min
                    </span>
                  </div>
                  
                  {/* Brief route name */}
                  <div className="text-xs text-gray-600 mb-1 truncate">
                    {bus.destination || 'Unknown'}
                  </div>
                  
                  {/* Speed and Status - compact */}
                  <div className="flex items-center gap-2 text-xs">
                    {bus.speedKmh !== undefined && (
                      <span className="text-gray-500">
                        {bus.speedKmh.toFixed(0)} km/h
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(bus.status)}`}>
                      {getStatusLabel(bus.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
