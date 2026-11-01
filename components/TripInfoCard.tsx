'use client';

import { BusStop, Bus } from '@/types';
import { haversineDistanceKm } from '@/lib/geo';

interface TripInfoCardProps {
  station?: BusStop; // Optional
  selectedBus: Bus | null;
  nearestBus: Bus | null;
}

export default function TripInfoCard({
  station,
  selectedBus,
  nearestBus,
}: TripInfoCardProps) {
  const displayBus = selectedBus || nearestBus;

  if (!displayBus || !station) {
    return null;
  }

  const distanceKm = haversineDistanceKm(
    station.location.lat,
    station.location.lng,
    displayBus.currentLat,
    displayBus.currentLng
  );

  return (
    <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
      <div className="space-y-2">
        {/* Route name */}
        <div className="text-base font-semibold text-gray-900">
          {displayBus.destination}
        </div>
        {/* Trip info */}
        <div className="text-sm text-gray-600 leading-relaxed">
          Bus {displayBus.routeNumber} – {distanceKm.toFixed(1)} km away, {displayBus.eta} min to arrival
        </div>
      </div>
    </div>
  );
}
