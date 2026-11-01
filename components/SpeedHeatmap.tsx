'use client';

import { useState, useEffect } from 'react';
import { fetchSpeedHeatmap, SpeedHeatmapData } from '@/lib/speedHeatmap';

interface SpeedHeatmapProps {
  className?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23
const INITIAL_HOURS_COUNT = 6; // Shfaq vetëm 6 orët e para by default

export default function SpeedHeatmap({ className = '' }: SpeedHeatmapProps) {
  const [selectedWeek, setSelectedWeek] = useState<'week' | 'lastWeek' | 'twoWeeksAgo' | 'threeWeeksAgo'>('week');
  const [heatmapData, setHeatmapData] = useState<SpeedHeatmapData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataSource, setDataSource] = useState<'real' | 'mock' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const range = selectedWeek === 'week' ? 'week' :
                   selectedWeek === 'lastWeek' ? 'lastWeek' :
                   selectedWeek === 'twoWeeksAgo' ? 'twoWeeksAgo' : 'threeWeeksAgo';
      
      const data = await fetchSpeedHeatmap(range);
      if (data && data.length > 0) {
        setHeatmapData(data);
        setDataSource('real'); // Nëse API kthen të dhëna, janë reale
      } else {
        setHeatmapData(null);
        setDataSource('mock'); // Nëse API nuk kthen të dhëna, përdoret mock (ose nuk shfaqet)
      }
      setLoading(false);
    };

    loadData();
  }, [selectedWeek]);

  // Create a map for quick lookup: [hour][day] => speed
  const speedMap = new Map<string, number>();
  if (heatmapData) {
    heatmapData.forEach((item) => {
      const key = `${item.hour}-${item.day}`;
      speedMap.set(key, item.speed || 0);
    });
  }

  // Get speed for a specific hour and day
  const getSpeed = (hour: number, day: number): number => {
    const key = `${hour}-${day}`;
    return speedMap.get(key) || 0;
  };

  // Get color based on speed - ngjyra më të buta
  const getSpeedColor = (speed: number): string => {
    if (speed === 0) return 'bg-purple-100'; 
    if (speed < 10) return 'bg-purple-200';
    if (speed < 15) return 'bg-purple-300';
    if (speed < 20) return 'bg-blue-300';
    if (speed < 25) return 'bg-blue-400';
    if (speed < 30) return 'bg-green-400';
    if (speed < 35) return 'bg-green-500';
    if (speed < 40) return 'bg-yellow-400';
    return 'bg-yellow-300'; // Highest speeds
  };

  // Get text color based on background - më e butë
  const getTextColor = (speed: number): string => {
    if (speed === 0) return 'text-gray-600';
    if (speed < 20) return 'text-gray-700';
    return 'text-gray-900';
  };

  const weekLabels = {
    week: 'THIS WEEK',
    lastWeek: 'LAST WEEK',
    twoWeeksAgo: '2 WEEKS AGO',
    threeWeeksAgo: '3 WEEKS AGO',
  };

  // Determine which hours to display
  const displayedHours = isExpanded ? HOURS : HOURS.slice(0, INITIAL_HOURS_COUNT);

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/80 shadow-lg backdrop-blur-sm p-6 ${className}`}>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Bus Speed Overview
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4 ml-3">
          Compare how fast the network moves across recent weeks.
        </p>
        
        {/* Week selector buttons - sleek design */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(weekLabels) as Array<keyof typeof weekLabels>).map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedWeek === week
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
              }`}
            >
              {weekLabels[week]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-r-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      ) : !heatmapData || heatmapData.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">No speed data available for this week.</p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <h4 className="text-sm font-bold text-gray-800">Weekly Speed Heatmap</h4>
            </div>
            <div className="flex items-center gap-2">
              {/* Data Source Badge */}
              {dataSource && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  dataSource === 'real'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-orange-100 text-orange-700 border border-orange-300'
                }`}>
                  {dataSource === 'real' ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Real Data</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Mock Data</span>
                    </>
                  )}
                </div>
              )}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner bg-gray-50/30">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <th className="bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 text-left sticky left-0 z-10 shadow-sm">
                      Hour
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-r border-gray-200 last:border-r-0 px-3 py-2.5 text-xs font-bold text-gray-700 text-center min-w-[80px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedHours.map((hour) => (
                    <tr key={hour} className="border-b border-gray-100 last:border-b-0 hover:bg-white/60 transition-all duration-150 group">
                      <td className="bg-gradient-to-r from-gray-50 to-white border-r border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 sticky left-0 z-10 shadow-sm group-hover:shadow-md transition-shadow">
                        {hour.toString().padStart(2, '0')}:00
                      </td>
                      {DAYS.map((_, dayIndex) => {
                        const speed = getSpeed(hour, dayIndex);
                        return (
                          <td
                            key={dayIndex}
                            className={`border-r border-gray-100/50 last:border-r-0 px-2 py-2.5 text-center text-xs font-semibold ${getSpeedColor(speed)} ${getTextColor(speed)} transition-all duration-200 hover:scale-105 hover:shadow-md hover:z-20 relative`}
                          >
                            <span className="relative z-10">{speed.toFixed(0)}</span>
                            <span className="text-[10px] opacity-70 ml-0.5">km/h</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* See More/Less Button - sleek design */}
          {HOURS.length > INITIAL_HOURS_COUNT && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 w-full text-xs text-gray-600 hover:text-gray-900 font-semibold flex items-center justify-center gap-2 transition-all duration-200 py-2.5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>See more ({HOURS.length - INITIAL_HOURS_COUNT} more hours)</span>
                  <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

