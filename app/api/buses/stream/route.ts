import { NextRequest } from 'next/server';
import { generateBusesForStop } from '@/data/mockData';
import { fetchExternalBuses } from '@/lib/externalBuses';
import { Bus } from '@/types';
import { moveBusTowardsDestination } from '@/data/mockData';

// Removed latency simulation - now measuring real performance

/**
 * Internal function to get buses for a stop (same as regular API)
 * Returns buses array and dataSource
 */
async function getBusesForStop(
  stopId: string,
  existingBuses: Bus[] | null
): Promise<{ buses: Bus[]; dataSource: string }> {
  let existingBusesMap: Map<string, Bus> | undefined;
  if (existingBuses && Array.isArray(existingBuses)) {
    if (existingBuses.length > 500) {
      existingBusesMap = undefined;
    } else {
      existingBusesMap = new Map(existingBuses.map((bus) => [bus.id, bus]));
    }
  }

  let buses: Bus[] = [];
  let dataSource = 'mock';

  try {
    const externalBuses = await fetchExternalBuses(stopId);
    if (externalBuses && externalBuses.length > 0) {
      buses = externalBuses;
      dataSource = 'external';
    } else {
      buses = generateBusesForStop(stopId, existingBusesMap);
      dataSource = 'mock';
    }
  } catch (error) {
    buses = generateBusesForStop(stopId, existingBusesMap);
    dataSource = 'mock';
  }

  return {
    buses: Array.isArray(buses) ? buses : [],
    dataSource,
  };
}

/**
 * SSE endpoint for real-time bus updates
 * Streams bus data every few seconds instead of polling
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stopId = searchParams.get('stopId');
  const networkMode = searchParams.get('networkMode') || '5G';

  if (!stopId) {
    return new Response('Missing stopId parameter', { status: 400 });
  }

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();
  let existingBuses: Bus[] | null = null;
  let intervalId: NodeJS.Timeout | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendMessage = (data: any) => {
        if (isClosed) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Initial data fetch
      try {
        const { buses, dataSource } = await getBusesForStop(stopId, existingBuses);
        existingBuses = buses;
        // Dërgo mesazh gjithmonë për fetch-in fillestar (edhe nëse array është bosh)
        // Frontend do të trajtojë array bosh siç duhet
        sendMessage({
          type: 'update',
          buses,
          dataSource,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        sendMessage({
          type: 'error',
          message: 'Failed to fetch initial data',
        });
      }

      // Update interval (same for all network types now - no simulation)
      const updateInterval = 2500; // 2.5 seconds

      // Set up periodic updates
      intervalId = setInterval(async () => {
        if (isClosed) return;
        try {
          // Fetch fresh data periodically
          const { buses, dataSource } = await getBusesForStop(stopId, existingBuses);
          
          // Dërgo mesazh vetëm nëse ka ndryshim në numrin e autobusëve
          // Kjo redukton mesazhet e panevojshme kur array është bosh
          const hadBuses = existingBuses && existingBuses.length > 0;
          const hasBuses = buses.length > 0;
          
          // Dërgo mesazh nëse:
          // 1. Ka autobusë (të reja ose ekzistuese)
          // 2. Ose ka pasur autobusë më parë dhe tani nuk ka (ndryshim)
          if (hasBuses || hadBuses) {
            existingBuses = buses;
            sendMessage({
              type: 'update',
              buses,
              dataSource,
              timestamp: new Date().toISOString(),
            });
          }
          // Nëse nuk ka autobusë dhe nuk ka pasur më parë, mos dërgo mesazh (evito spam)
        } catch (error) {
          sendMessage({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, updateInterval);

      // Keep connection alive with heartbeat
      heartbeatInterval = setInterval(() => {
        if (!isClosed) {
          sendMessage({ type: 'heartbeat', timestamp: new Date().toISOString() });
        }
      }, 30000); // Every 30 seconds

      // Handle abort signal
      if (request.signal) {
        request.signal.addEventListener('abort', () => {
          isClosed = true;
          if (intervalId) clearInterval(intervalId);
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          try {
            controller.close();
          } catch (error) {
            // Ignore errors on close
          }
        });
      }
    },
    cancel() {
      isClosed = true;
      if (intervalId) clearInterval(intervalId);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

