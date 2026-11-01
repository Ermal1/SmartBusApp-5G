'use client';

import { useState } from 'react';
import { Bus, BusStop } from '@/types';
import { getBusLineById, getUpcomingDepartures } from '@/data/routes';
import { haversineDistanceKm } from '@/lib/geo';

interface MobileBusDetailTabsProps {
  selectedBus: Bus | null;
  station?: BusStop; // Optional
  allBusStops: BusStop[];
  onClose?: () => void;
}

type TabType = 'route' | 'schedule';

export default function MobileBusDetailTabs({
  selectedBus,
  station,
  allBusStops,
  onClose,
}: MobileBusDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('route');

  if (!selectedBus) {
    return null;
  }
  // Station is optional - can show route without it

  const busLine = getBusLineById(selectedBus.lineId);
  if (!busLine) {
    return null;
  }

  // Llogarit distancën dhe ETA për çdo stacion në rrugë
  const routeStopsWithInfo = busLine.stops.map((stopId, index) => {
    const stop = allBusStops.find((s) => s.id === stopId);
    if (!stop) return null;

    // Llogarit distancën nga autobusi aktual në këtë stacion
    const distanceKm = haversineDistanceKm(
      selectedBus.currentLat,
      selectedBus.currentLng,
      stop.location.lat,
      stop.location.lng
    );

    // ETA e përafërt (nëse autobusi është në rrugë drejt këtij stacioni)
    // Përdor shpejtësinë aktuale ose mesatare
    const averageSpeed = selectedBus.speedKmh || 35; // km/h
    const etaMinutes = Math.max(0, Math.round((distanceKm / averageSpeed) * 60));

    // Kontrollo nëse ky është stacioni aktual (nextStopId ose më i afërt)
    const isCurrentStop = selectedBus.nextStopId === stopId || distanceKm < 0.3;

    return {
      stop,
      distanceKm,
      etaMinutes,
      isCurrentStop,
      isNextStop: false, // Do të përditësohet më poshtë
      index,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  // Gjej stacionin aktual dhe stacionin e radhës
  const currentStopIndex = routeStopsWithInfo.findIndex((item) => item.isCurrentStop);
  const nextStop = currentStopIndex >= 0 && currentStopIndex < routeStopsWithInfo.length - 1
    ? routeStopsWithInfo[currentStopIndex + 1]
    : routeStopsWithInfo.find((item) => !item.isCurrentStop && item.index > 0);

  // Mark next stop në routeStopsWithInfo
  if (nextStop) {
    const nextStopIndex = routeStopsWithInfo.findIndex((item) => item.stop.id === nextStop.stop.id);
    if (nextStopIndex >= 0) {
      routeStopsWithInfo[nextStopIndex].isNextStop = true;
    }
  }

  // Merr oraret për stacionin aktual (nëse ka stacion të zgjedhur)
  const schedule = station ? getUpcomingDepartures(busLine.id, station.id, 10) : [];

  return (
    <div className="lg:hidden bg-white rounded-t-2xl shadow-lg border-t border-gray-200">
      {/* Header me informacion të autobusit */}
      <div 
        className="p-4 rounded-t-2xl text-white"
        style={{ backgroundColor: busLine.color }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
              {selectedBus.routeNumber}
            </div>
            <div>
              <div className="font-bold text-lg">{busLine.name}</div>
              <div className="text-sm opacity-90">{selectedBus.destination}</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* ETA dhe Status */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{selectedBus.eta} min</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            selectedBus.delayMinutes <= 1 
              ? 'bg-green-500/30' 
              : selectedBus.delayMinutes <= 5 
                ? 'bg-yellow-500/30' 
                : 'bg-red-500/30'
          }`}>
            {selectedBus.delayMinutes <= 1 ? 'Në kohë' : `+${selectedBus.delayMinutes.toFixed(1)} min`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'route'
              ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Rruga</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'schedule'
              ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Schedule</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {activeTab === 'route' && (
          <div className="p-4">
            {/* Next Stop Highlight */}
            {nextStop && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-700 uppercase">Next Stop</span>
                </div>
                <div className="font-bold text-lg text-gray-900">{nextStop.stop.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {nextStop.etaMinutes} minutes • {nextStop.distanceKm.toFixed(1)} km
                </div>
              </div>
            )}

            {/* Route Stops List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">All stops on route</h3>
              {routeStopsWithInfo.map((item, idx) => {
                const isPassed = item.index < (routeStopsWithInfo.find((i) => i.isCurrentStop)?.index || 0);
                return (
                  <div
                    key={item.stop.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.isCurrentStop
                        ? 'bg-[var(--primary-soft)] border-[var(--primary)]/30'
                        : item.isNextStop
                          ? 'bg-green-50 border-green-300'
                          : isPassed
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Stop Number/Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      item.isCurrentStop
                        ? 'bg-[var(--primary)] text-white'
                        : item.isNextStop
                          ? 'bg-green-600 text-white'
                          : isPassed
                            ? 'bg-gray-400 text-white'
                            : 'bg-gray-300 text-gray-700'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{item.stop.name}</div>
                      {item.stop.address && (
                        <div className="text-xs text-gray-600 truncate">{item.stop.address}</div>
                      )}
                      {!isPassed && (
                        <div className="text-xs text-gray-500 mt-1">
                          ~{item.etaMinutes} min • {item.distanceKm.toFixed(1)} km
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {item.isCurrentStop && (
                      <div className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                        Current
                      </div>
                    )}
                    {item.isNextStop && (
                      <div className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                        Next
                      </div>
                    )}
                    {isPassed && (
                      <div className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded">
                        Passed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Schedule for {station?.name || 'Selected Stop'}
            </h3>
            
            {schedule.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {schedule.map((time, idx) => {
                  // Llogarit nëse kjo orë është e kaluar
                  const now = new Date();
                  const [hours, minutes] = time.split(':').map(Number);
                  const scheduleTime = new Date();
                  scheduleTime.setHours(hours, minutes, 0, 0);
                  const isPast = scheduleTime < now;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-center border ${
                        isPast
                          ? 'bg-gray-50 border-gray-200 text-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{time}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No schedule available for this stop</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
