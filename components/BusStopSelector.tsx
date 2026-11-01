'use client';

import { useState, useEffect } from 'react';

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

interface BusStopSelectorProps {
  selectedStopId: string | null;
  onStopSelect: (stopId: string) => void;
}

export default function BusStopSelector({
  selectedStopId,
  onStopSelect,
}: BusStopSelectorProps) {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusStops = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/bus-stops');
        const data = await response.json();
        
        if (data.error) {
          setError(data.message || 'Failed to load bus stops');
          setStops([]);
        } else {
          setStops(data.stops || []);
        }
      } catch (err) {
        console.error('Error fetching bus stops:', err);
        setError('Failed to load bus stops');
        setStops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusStops();
  }, []);

  // Format display label: "Name – (shortened address)"
  const formatStopLabel = (stop: BusStop) => {
    if (stop.address) {
      // Shorten address if too long (take first part before comma or limit to 30 chars)
      const shortAddress = stop.address.split(',')[0].trim();
      const displayAddress = shortAddress.length > 30 
        ? shortAddress.substring(0, 30) + '...' 
        : shortAddress;
      return `${stop.name} – ${displayAddress}`;
    }
    return stop.name;
  };

  return (
    <div className="w-full">
      <label
        htmlFor="bus-stop-select"
        className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Select Bus Stop</span>
      </label>
      <div className="relative">
        <select
          id="bus-stop-select"
          value={selectedStopId || ''}
          onChange={(e) => onStopSelect(e.target.value)}
          disabled={loading}
          className="w-full px-5 py-4 pr-12 border-2 border-[var(--primary)]/20 rounded-xl bg-gradient-to-br from-white to-[var(--primary-soft-2)] text-gray-900 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 appearance-none cursor-pointer"
        >
          <option value="">
            {loading 
              ? 'Loading bus stops...' 
              : error 
                ? 'Failed to load bus stops' 
                : 'Choose a bus stop...'}
          </option>
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {formatStopLabel(stop)}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {/* Loading spinner overlay */}
        {loading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {error && !loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}. Using fallback data.</span>
        </div>
      )}
    </div>
  );
}
