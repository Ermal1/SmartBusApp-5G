'use client';

import { useState, useEffect } from 'react';
import { Bus } from '@/types';
import { WeeklyStats } from '@/lib/weeklyStats';
import SharedPageLayout from '@/components/SharedPageLayout';
import StatsTab from '@/components/tabs/StatsTab';

export default function StatsPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  // Fetch weekly stats on mount and periodically
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch('/api/stats/weekly');
        const data = await response.json();
        if (data.stats) {
          setWeeklyStats(data.stats);
        }
      } catch (error) {
        console.warn('Failed to fetch weekly stats:', error);
      }
    };

    fetchWeeklyStats();
    const interval = setInterval(fetchWeeklyStats, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // For stats, we don't need to fetch buses (StatsTab uses filteredBuses prop but can work with empty array)
  // If you need buses for stats, you could fetch them here

  return (
    <SharedPageLayout>
      <StatsTab buses={buses} weeklyStats={weeklyStats} />
    </SharedPageLayout>
  );
}
