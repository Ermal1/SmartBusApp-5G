/**
 * Fetch weekly heatmap stats from external API
 * This is a public demo API used for the student project demonstration.
 * Returns null if the API is unavailable or fails.
 */
interface HeatmapSnapshot {
  hour: number;
  count: number;
  _id?: string;
}

interface WeeklyStatsResponse {
  snapshots?: HeatmapSnapshot[];
  total?: number;
  [key: string]: any;
}

export interface WeeklyStats {
  busiestHour: number; // 0-23
  busiestHourCount: number;
  topHours: Array<{ hour: number; count: number }>;
  totalSnapshots: number;
}

/**
 * Fetch and parse weekly heatmap statistics
 * @returns WeeklyStats object or null if fetch fails
 */
export async function fetchWeeklyHeatmapStats(): Promise<WeeklyStats | null> {
  const statsUrl = process.env.NEXT_PUBLIC_EXTERNAL_STATS_URL ||
    'https://arvento-buses.onrender.com/api/snapshots/heatmap/hourly?range=week';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(statsUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Weekly stats API returned status ${response.status}`);
      return null;
    }

    const data: WeeklyStatsResponse = await response.json();

    // Handle different possible response structures
    let snapshots: HeatmapSnapshot[] = [];
    let totalSnapshots = 0;

    if (Array.isArray(data)) {
      // Response is directly an array
      snapshots = data;
      totalSnapshots = data.reduce((sum, item) => sum + (item.count || 0), 0);
    } else if (data.snapshots && Array.isArray(data.snapshots)) {
      // Response has snapshots property
      snapshots = data.snapshots;
      totalSnapshots = data.total || snapshots.reduce((sum, item) => sum + (item.count || 0), 0);
    } else {
      console.warn('Weekly stats API returned unexpected structure');
      return null;
    }

    if (snapshots.length === 0) {
      return null;
    }

    // Find busiest hour
    const busiestHourData = snapshots.reduce((max, item) => 
      (item.count || 0) > (max.count || 0) ? item : max
    , snapshots[0]);

    // Get top 3 hours
    const topHours = [...snapshots]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 3)
      .map((item) => ({
        hour: item.hour || 0,
        count: item.count || 0,
      }));

    return {
      busiestHour: busiestHourData.hour || 0,
      busiestHourCount: busiestHourData.count || 0,
      topHours,
      totalSnapshots,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Weekly stats API request timed out');
    } else {
      console.warn('Failed to fetch weekly stats:', error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }
}
