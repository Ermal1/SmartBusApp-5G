'use client';

import { BusLine, BusStop } from '@/types';
import { getUpcomingDepartures } from '@/data/routes';

interface SchedulePanelProps {
  line: BusLine;
  stop: BusStop;
  delayMinutes?: number; // Delay for the next bus
}

export default function SchedulePanel({ line, stop, delayMinutes = 0 }: SchedulePanelProps) {
  // Get upcoming departures from this stop
  const upcoming = getUpcomingDepartures(line.id, stop.id, 3);

  // Calculate actual arrival times considering delay
  const getActualTime = (scheduledTime: string): string => {
    if (delayMinutes <= 0) return scheduledTime;
    
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    const delayedDate = new Date(scheduledDate.getTime() + delayMinutes * 60 * 1000);
    return `${delayedDate.getHours().toString().padStart(2, '0')}:${delayedDate.getMinutes().toString().padStart(2, '0')}`;
  };

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule</h3>
        <p className="text-xs text-gray-500">No schedule available for this stop.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Schedule</h3>
        <span className="text-xs text-gray-500">Line {line.number}</span>
      </div>
      
      <div className="space-y-2">
        {upcoming.map((scheduledTime, idx) => {
          const isNext = idx === 0;
          const actualTime = isNext ? getActualTime(scheduledTime) : scheduledTime;
          const isDelayed = isNext && delayMinutes > 1;
          
          return (
            <div
              key={scheduledTime}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isNext ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-blue-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900">{actualTime}</span>
                {isDelayed && (
                  <span className="text-xs text-yellow-600 font-medium">
                    (+{delayMinutes.toFixed(0)}m delay)
                  </span>
                )}
              </div>
              <span className={`text-xs ${isNext ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
                {isNext ? 'Next' : scheduledTime}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Ticket Price:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{line.price.toFixed(2)} €</span>
            {line.studentPrice && (
              <span className="text-gray-500">({line.studentPrice.toFixed(2)} € student)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
