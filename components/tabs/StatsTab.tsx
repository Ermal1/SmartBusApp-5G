'use client';

import AnalyticsSummary from '@/components/AnalyticsSummary';
import WeeklyStatsCard from '@/components/WeeklyStatsCard';
import SpeedHeatmap from '@/components/SpeedHeatmap';
import AlertsPanel from '@/components/AlertsPanel';
import { Bus } from '@/types';
import { WeeklyStats } from '@/lib/weeklyStats';
import { mockAlerts } from '@/data/routes';

interface StatsTabProps {
  buses: Bus[];
  weeklyStats: WeeklyStats | null;
}

export default function StatsTab({ buses, weeklyStats }: StatsTabProps) {
  return (
    <div className="space-y-6">
      {/* Alerts Panel - Show all alerts (accidents, delays, etc.) */}
      <AlertsPanel allAlerts={mockAlerts} />

      {/* Analytics Summary */}
      <AnalyticsSummary buses={buses} />
      
      {/* Weekly Stats Card */}
      <WeeklyStatsCard stats={weeklyStats} />
      
      {/* Speed Heatmap */}
      <SpeedHeatmap />
    </div>
  );
}
