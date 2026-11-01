'use client';

import { Bus } from '@/types';

interface AnalyticsSummaryProps {
  buses: Bus[];
}

export default function AnalyticsSummary({ buses }: AnalyticsSummaryProps) {
  if (buses.length === 0) {
    return null;
  }

  // Calculate average delay
  const averageDelay =
    buses.reduce((sum, bus) => sum + bus.delayMinutes, 0) / buses.length;

  // Group buses by route number and calculate average delay per route
  const routeDelays = buses.reduce((acc, bus) => {
    if (!acc[bus.routeNumber]) {
      acc[bus.routeNumber] = [];
    }
    acc[bus.routeNumber].push(bus.delayMinutes);
    return acc;
  }, {} as Record<string, number[]>);

  // Calculate average delay per route
  const routeAverages = Object.entries(routeDelays).map(([route, delays]) => ({
    route,
    avgDelay: delays.reduce((sum, d) => sum + d, 0) / delays.length,
  }));

  // Find most and least delayed routes
  const mostDelayed = routeAverages.reduce((max, current) =>
    current.avgDelay > max.avgDelay ? current : max
  );
  const leastDelayed = routeAverages.reduce((min, current) =>
    current.avgDelay < min.avgDelay ? current : min
  );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900">
          Performance Summary
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">Average Delay</div>
          <div className="text-lg font-bold text-gray-900">
            {averageDelay.toFixed(1)} min
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-red-100">
          <div className="text-xs text-gray-600 mb-1">Most Delayed Line</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-700">
              Route {mostDelayed.route}
            </span>
            <span className="text-xs text-gray-500">
              ({mostDelayed.avgDelay.toFixed(1)} min)
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <div className="text-xs text-gray-600 mb-1">Least Delayed Line</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-700">
              Route {leastDelayed.route}
            </span>
            <span className="text-xs text-gray-500">
              ({leastDelayed.avgDelay.toFixed(1)} min)
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        * KPIs improve with 5G's real-time data updates and lower latency
      </p>
    </div>
  );
}
