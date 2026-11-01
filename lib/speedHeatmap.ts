/**
 * Fetch speed heatmap data from external API
 * This fetches hourly speed data for each day of the week
 */

export interface SpeedHeatmapData {
  hour: number; // 0-23
  day: number; // 0-6 (Monday=0, Sunday=6)
  speed: number; // km/h
  [key: string]: any;
}

export interface SpeedHeatmapResponse {
  data?: SpeedHeatmapData[];
  speeds?: SpeedHeatmapData[];
  [key: string]: any;
}

/**
 * Fetch speed heatmap for a specific week range
 * @param range - 'week' for this week, 'lastWeek' for last week, etc.
 * @returns Array of SpeedHeatmapData or null if fetch fails
 */
export async function fetchSpeedHeatmap(range: string = 'week'): Promise<SpeedHeatmapData[] | null> {
  const statsUrl = process.env.NEXT_PUBLIC_EXTERNAL_STATS_URL ||
    'https://arvento-buses.onrender.com/api/snapshots/heatmap/hourly';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const url = `${statsUrl}?range=${range}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Speed heatmap API returned status ${response.status}`);
      return null;
    }

    const data: any = await response.json();

    // Handle different possible response structures
    let heatmapData: SpeedHeatmapData[] = [];

    if (Array.isArray(data)) {
      // Response is directly an array
      heatmapData = data.map((item: any) => ({
        hour: item.hour || item.h || 0,
        day: item.day !== undefined ? item.day : (item.d !== undefined ? item.d : 0),
        speed: item.speed || item.s || item.avgSpeed || item.averageSpeed || 0,
      }));
    } else if (data.data && Array.isArray(data.data)) {
      heatmapData = data.data.map((item: any) => ({
        hour: item.hour || item.h || 0,
        day: item.day !== undefined ? item.day : (item.d !== undefined ? item.d : 0),
        speed: item.speed || item.s || item.avgSpeed || item.averageSpeed || 0,
      }));
    } else if (data.speeds && Array.isArray(data.speeds)) {
      heatmapData = data.speeds.map((item: any) => ({
        hour: item.hour || item.h || 0,
        day: item.day !== undefined ? item.day : (item.d !== undefined ? item.d : 0),
        speed: item.speed || item.s || item.avgSpeed || item.averageSpeed || 0,
      }));
    } else if (data.snapshots && Array.isArray(data.snapshots)) {
      // If API returns snapshots with speed data
      heatmapData = data.snapshots.map((item: any) => ({
        hour: item.hour || item.h || 0,
        day: item.day !== undefined ? item.day : (item.d !== undefined ? item.d : 0),
        speed: item.speed || item.s || item.avgSpeed || item.averageSpeed || item.count || 0,
      }));
    } else {
      console.warn('Speed heatmap API returned unexpected structure:', data);
      return null;
    }

    if (heatmapData.length === 0) {
      return null;
    }

    return heatmapData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Speed heatmap API request timed out');
    } else {
      console.warn('Failed to fetch speed heatmap:', error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }
}

