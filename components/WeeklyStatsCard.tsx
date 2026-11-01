'use client';

import { WeeklyStats } from '@/lib/weeklyStats';

interface WeeklyStatsCardProps {
  stats: WeeklyStats | null;
}

export default function WeeklyStatsCard({ stats }: WeeklyStatsCardProps) {
  if (!stats) {
    return null;
  }

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Network Stats</h3>
        <span className="text-xs text-gray-500 bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
          Weekly
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Busiest Hour */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Busiest Hour</div>
              <div className="text-lg font-bold text-blue-700">{formatHour(stats.busiestHour)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Activity</div>
              <div className="text-sm font-semibold text-blue-700">{stats.busiestHourCount} snapshots</div>
            </div>
          </div>
        </div>

        {/* Top Hours */}
        {stats.topHours.length > 0 && (
          <div>
            <div className="text-xs text-gray-600 mb-2 font-medium">Top Active Hours</div>
            <div className="space-y-1.5">
              {stats.topHours.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-medium">{formatHour(item.hour)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(item.count / stats.busiestHourCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-600 w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Snapshots */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Total Activity (Week):</span>
            <span className="font-semibold text-gray-900">{stats.totalSnapshots.toLocaleString()} snapshots</span>
          </div>
        </div>
      </div>
    </div>
  );
}
