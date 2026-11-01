'use client';

import { useState, useEffect } from 'react';
import SharedPageLayout from '@/components/SharedPageLayout';
import ScheduleTab from '@/components/tabs/ScheduleTab';

export default function SchedulePage() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [allBusStops, setAllBusStops] = useState<any[]>([]);

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
        }
      } catch (error) {
        console.warn('Failed to fetch bus stops:', error);
      }
    };

    fetchBusStops();
  }, []);

  return (
    <SharedPageLayout>
      <ScheduleTab
        selectedStopId={selectedStopId}
        allBusStops={allBusStops}
      />
    </SharedPageLayout>
  );
}
