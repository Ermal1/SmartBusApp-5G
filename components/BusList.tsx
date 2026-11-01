'use client';

import { useState } from 'react';
import { Bus } from '@/types';
import BusCard from './BusCard';

interface BusListProps {
  buses: Bus[];
  stopName: string;
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus | null) => void;
}

const INITIAL_BUSES_COUNT = 3; // Number of buses displayed by default

export default function BusList({
  buses,
  stopName,
  selectedBus,
  onBusSelect,
}: BusListProps) {
  const [showAll, setShowAll] = useState(false);

  if (buses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <p className="text-lg">No buses scheduled at this time</p>
        <p className="text-sm mt-2">Please check back later</p>
      </div>
    );
  }

  // Determine which buses to display
  const displayedBuses = showAll ? buses : buses.slice(0, INITIAL_BUSES_COUNT);
  const hasMoreBuses = buses.length > INITIAL_BUSES_COUNT;

  return (
    <div className="w-full">
      <div className="space-y-4">
        {displayedBuses.map((bus) => (
          <BusCard
            key={bus.id}
            bus={bus}
            isSelected={selectedBus?.id === bus.id}
            onSelect={() => onBusSelect(selectedBus?.id === bus.id ? null : bus)}
          />
        ))}
      </div>
      
      {/* Butoni "See more" / "Show less" */}
      {hasMoreBuses && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 bg-[var(--primary)] hover:opacity-90 text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
          >
            {showAll ? (
              <>
                <span>Show less</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>See more ({buses.length - INITIAL_BUSES_COUNT} more)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
