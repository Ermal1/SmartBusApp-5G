'use client';

import { useState, useMemo } from 'react';
import { busLines, schedules } from '@/data/routes';
import { BusStop } from '@/types';

interface ScheduleTabProps {
  selectedStopId: string | null;
  allBusStops: BusStop[];
}

// Generate static schedule based on interval (e.g., every 5 minutes, every 10 minutes)
// From 06:00 to 00:00 (midnight, which means until 24:00)
function generateStaticSchedule(startTime: string, endTime: string, intervalMinutes: number): string[] {
  const [startHour, startMin] = startTime.split(':').map(Number);
  let [endHour, endMin] = endTime.split(':').map(Number);
  
  // Handle midnight (00:00) as 24:00 for calculation
  if (endHour === 0 && endMin === 0) {
    endHour = 24;
  }
  
  const times: string[] = [];
  let currentHour = startHour;
  let currentMin = startMin;
  
  // Generate times from start to end (inclusive)
  while (true) {
    // Format time for display (00:00 instead of 24:00)
    const displayHour = currentHour >= 24 ? 0 : currentHour;
    const timeStr = `${displayHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    times.push(timeStr);
    
    // Check if we've reached or passed end time
    if (currentHour > endHour || (currentHour === endHour && currentMin >= endMin)) {
      break;
    }
    
    // Add interval
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }
  
  return times;
}

// Default intervals for each line - ALWAYS generate static schedules
// Based on real Prishtina bus line frequencies
const defaultIntervals: Record<string, number> = {
  'line-1': 15,   // Every 15 minutes - Prishtinë → Fushkosovë
  'line-1a': 20,  // Every 20 minutes - Stacioni i Autobusëve → Aeroport
  'line-3': 10,   // Every 10 minutes - Mati → Bardhosh
  'line-3a': 12,  // Every 12 minutes - 27 Nëntori → Lagjja e Spitalit
  'line-3b': 15,  // Every 15 minutes - Mat → Bernice
  'line-3c': 15,  // Every 15 minutes - Breku i Diellit → Sinidoll
  'line-4': 5,    // Every 5 minutes - Mat → Germi (as requested)
  'line-6': 15,   // Every 15 minutes - Arbëria → Arkivi i Kosovës
  'line-6a': 20,  // Every 20 minutes - Arbëri te Varrezat → Tregu e Shumicë
  'line-7': 18,   // Every 18 minutes - Kolovice e Jetër → Kosova Tex
  'line-7a': 20,  // Every 20 minutes - Lagjja Vershtat → Arkivi i Kosovës
  'line-8': 25,   // Every 25 minutes - Grashticë → Prishtinë
  'line-10': 20,  // Every 20 minutes - Hajvali → Prishtinë
  'line-10a': 25, // Every 25 minutes - Parku i Ariut → Prishtinë
  'line-11': 30,  // Every 30 minutes - Barilevë → Prishtinë
  'line-12': 20,  // Every 20 minutes - Lagjja e Llumnicëve → Prishtinë
};

export default function ScheduleTab({
  selectedStopId,
  allBusStops,
}: ScheduleTabProps) {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Get schedules for all stops for each line
  // ALWAYS generate static schedules - don't depend on allBusStops matching
  const lineSchedules = useMemo(() => {
    const result: Array<{
      line: typeof busLines[0];
      schedule: string[]; // Single schedule for the line (same for all stops)
    }> = [];

    const filteredLines = selectedLineId
      ? busLines.filter((line) => line.id === selectedLineId)
      : busLines;

    // Sort lines by number (handle numeric and alphanumeric like "1", "1a", "3", "3a")
    const sortedLines = [...filteredLines].sort((a, b) => {
      // Extract numeric part and letter part
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      if (numA !== numB) {
        return numA - numB;
      }
      // If numbers are equal, sort by letter (e.g., "1" before "1a")
      const letterA = a.number.replace(/^\d+/, '') || '';
      const letterB = b.number.replace(/^\d+/, '') || '';
      return letterA.localeCompare(letterB);
    });

    sortedLines.forEach((line) => {
      // ALWAYS generate static schedule based on interval
      // From 06:00 to 00:00 (midnight)
      const interval = defaultIntervals[line.id] || 30;
      const scheduleTimes = generateStaticSchedule('06:00', '00:00', interval);

      if (scheduleTimes.length > 0) {
        result.push({
          line,
          schedule: scheduleTimes,
        });
      }
    });

    return result;
  }, [selectedLineId]);

  return (
    <div className="space-y-6">
      {/* Filter by Line */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-700 mb-3">
          Filter by Line
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLineId(null)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
              selectedLineId === null
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[...busLines]
            .sort((a, b) => {
              // Sort by number (handle numeric and alphanumeric like "1", "1a", "3", "3a")
              const numA = parseInt(a.number) || 0;
              const numB = parseInt(b.number) || 0;
              if (numA !== numB) {
                return numA - numB;
              }
              // If numbers are equal, sort by letter (e.g., "1" before "1a")
              const letterA = a.number.replace(/^\d+/, '') || '';
              const letterB = b.number.replace(/^\d+/, '') || '';
              return letterA.localeCompare(letterB);
            })
            .map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLineId(line.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                  selectedLineId === line.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedLineId === line.id ? line.color : undefined,
                }}
              >
                Line {line.number}
              </button>
            ))}
        </div>
      </div>

      {/* Schedules List - Show for all lines */}
      {lineSchedules.length > 0 ? (
        <div className="space-y-6">
          {lineSchedules.map(({ line, schedule }) => (
            <div
              key={line.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              {/* Line Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md"
                  style={{ backgroundColor: line.color }}
                >
                  {line.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{line.name}</h3>
                  <p className="text-sm text-gray-600">
                    Schedule: every {defaultIntervals[line.id] || 30} minutes (06:00 - 00:00)
                  </p>
                </div>
              </div>

              {/* Schedule Times */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {schedule.map((time, idx) => {
                    const now = new Date();
                    let [hours, minutes] = time.split(':').map(Number);
                    
                    // Handle 00:00 as 24:00 for comparison
                    if (hours === 0 && minutes === 0) {
                      hours = 24;
                    }
                    
                    const scheduleTime = new Date();
                    scheduleTime.setHours(hours, minutes, 0, 0);
                    const isPast = scheduleTime < now;
                    const isNext = !isPast && idx === schedule.findIndex((t: string) => {
                      let [h, m] = t.split(':').map(Number);
                      if (h === 0 && m === 0) h = 24;
                      const st = new Date();
                      st.setHours(h, m, 0, 0);
                      return st >= now;
                    });

                    // Display time (show 00:00 as 00:00, not 24:00)
                    const displayTime = time === '24:00' ? '00:00' : time;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg text-center border transition-all ${
                          isPast
                            ? 'bg-gray-50 border-gray-200 text-gray-400'
                            : isNext
                            ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                            : 'bg-white border-gray-200 text-gray-900 hover:border-[var(--primary)]/30 hover:bg-[var(--primary-soft-2)]'
                        }`}
                      >
                        <div className="font-semibold text-xs">{displayTime}</div>
                            {isNext && (
                              <div className="text-[10px] text-[var(--primary)] mt-1">Next</div>
                            )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600">
            No schedules found for the selected lines.
          </p>
        </div>
      )}
    </div>
  );
}
