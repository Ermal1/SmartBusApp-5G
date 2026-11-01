import { NextResponse } from 'next/server';
import { fetchWeeklyHeatmapStats } from '@/lib/weeklyStats';

// Simulate 5G network latency (ultra-low latency: 1-5ms)
function simulate5GLatency() {
  const latency = 1 + Math.random() * 4; // 1-5ms
  return new Promise((resolve) => setTimeout(resolve, latency));
}

export async function GET() {
  // Simulate 5G network latency
  await simulate5GLatency();

  // Fetch weekly stats from external API
  // This is a public demo API used for the student project demonstration.
  // Returns null if the API is unavailable, and the frontend will hide the widget.
  const stats = await fetchWeeklyHeatmapStats();

  return NextResponse.json({
    stats,
    timestamp: new Date().toISOString(),
    networkType: '5G',
    latency: '1-5ms',
  });
}
