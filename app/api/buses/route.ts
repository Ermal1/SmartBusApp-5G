import { NextRequest, NextResponse } from 'next/server';
import { generateBusesForStop, busStops } from '@/data/mockData';
import { fetchExternalBuses } from '@/lib/externalBuses';
import { Bus } from '@/types';

/**
 * Internal function to get buses for a stop
 * Handles both external API and mock data generation with position continuity
 */
async function getBusesForStop(
  stopId: string,
  existingBuses: Bus[] | null
): Promise<{ buses: Bus[]; dataSource: string; computationMethod: string; externalFetchMs?: number; computeMs?: number }> {
  // Parse existing buses if provided (for position continuity)
  let existingBusesMap: Map<string, Bus> | undefined;
  if (existingBuses && Array.isArray(existingBuses)) {
    // Safety limit: ignore if too many buses (prevent memory issues)
    if (existingBuses.length > 500) {
      console.warn('existingBuses array too large, ignoring for continuity');
      existingBusesMap = undefined;
    } else {
      existingBusesMap = new Map(existingBuses.map((bus) => [bus.id, bus]));
    }
  }

  let buses: Bus[] = [];
  let dataSource = 'mock';
  let computationMethod = 'geo-based';
  let externalFetchMs: number | undefined;
  let computeMs: number | undefined;

  // Try to fetch from external API first
  // This is a public demo API (arvento-buses.onrender.com) used for the student project.
  // We have a fallback to local mock data if this API is unavailable.
  const externalFetchStart = performance.now();
  try {
    const externalBuses = await fetchExternalBuses(stopId);
    externalFetchMs = performance.now() - externalFetchStart;

    if (externalBuses && externalBuses.length > 0) {
      // Use external buses - they already have ETA, delay, etc. computed
      // Note: External buses use real-time positions, so we don't need existingBuses continuity
      buses = externalBuses;
      dataSource = 'external';
      computationMethod = 'external-api-with-geo-processing';
      computeMs = 0; // External API handles computation
    } else {
      // Fallback to mock data generation
      const computeStart = performance.now();
      buses = generateBusesForStop(stopId, existingBusesMap);
      computeMs = performance.now() - computeStart;
      dataSource = 'mock';
      computationMethod = 'geo-based';
    }
  } catch (error) {
    // If external fetch fails, use mock data
    externalFetchMs = performance.now() - externalFetchStart;
    const computeStart = performance.now();
    console.warn('External API fetch failed, using mock data:', error);
    buses = generateBusesForStop(stopId, existingBusesMap);
    computeMs = performance.now() - computeStart;
    dataSource = 'mock';
    computationMethod = 'geo-based';
  }

  // Ensure buses is always an array
  if (!Array.isArray(buses)) {
    buses = [];
  }

  return { buses, dataSource, computationMethod, externalFetchMs, computeMs };
}

/**
 * POST handler - preferred method to avoid 431 Request Header Fields Too Large
 * Accepts stopId and existingBuses in JSON body
 */
export async function POST(request: NextRequest) {
  const handlerStart = performance.now();
  
  try {
    const body = await request.json();
    const stopId = body.stopId as string | undefined;
    const existingBuses = Array.isArray(body.existingBuses)
      ? body.existingBuses
      : null;

    // Allow fetching all buses if stopId is 'all' or empty
    // If stopId is missing, fetch all buses in Prishtina
    if (!stopId || stopId === 'all') {
      const allBusesStart = performance.now();
      // Fetch all buses from external API (no specific stop)
      try {
        const externalBuses = await fetchExternalBuses('all');
        const allBusesEnd = performance.now();
        
        if (externalBuses && externalBuses.length > 0) {
          const handlerEnd = performance.now();
          return NextResponse.json({
            stopId: 'all',
            buses: externalBuses,
            timestamp: new Date().toISOString(),
            dataSource: 'external',
            computationMethod: 'external-api-all-buses',
            meta: {
              performance: {
                totalMs: handlerEnd - handlerStart,
                externalFetchMs: allBusesEnd - allBusesStart,
                computeMs: 0,
              },
            },
          });
        }
        // Fallback: generate mock buses for all stops
        const computeStart = performance.now();
        const allBuses: Bus[] = [];
        const allStops = ['1', '2', '3', '4', '5', '6', '7', '8'];
        for (const stopId of allStops) {
          const stopBuses = generateBusesForStop(stopId);
          allBuses.push(...stopBuses);
        }
        const computeEnd = performance.now();
        const handlerEnd = performance.now();
        
        return NextResponse.json({
          stopId: 'all',
          buses: allBuses,
          timestamp: new Date().toISOString(),
          dataSource: 'mock',
          computationMethod: 'mock-all-buses',
          meta: {
            performance: {
              totalMs: handlerEnd - handlerStart,
              externalFetchMs: allBusesEnd - allBusesStart,
              computeMs: computeEnd - computeStart,
            },
          },
        });
      } catch (error) {
        console.error('Error fetching all buses:', error);
        return NextResponse.json(
          { error: 'Failed to fetch buses' },
          { status: 500 }
        );
      }
    }

    const { buses, dataSource, computationMethod, externalFetchMs, computeMs } = await getBusesForStop(
      stopId,
      existingBuses
    );

    const handlerEnd = performance.now();

    // Console log për të treguar burimin e të dhënave
    if (dataSource === 'external') {
      console.log('✅ [API] Të dhëna REALE nga external API -', buses.length, 'autobusë');
    } else {
      console.log('⚠️ [API] Të dhëna MOCK (fallback) -', buses.length, 'autobusë');
    }

    return NextResponse.json({
      stopId,
      buses,
      timestamp: new Date().toISOString(),
      computationMethod,
      dataSource, // Indicate whether data came from external API or mock
      meta: {
        performance: {
          totalMs: handlerEnd - handlerStart,
          externalFetchMs: externalFetchMs || 0,
          computeMs: computeMs || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error in /api/buses POST:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch buses',
        message: error instanceof Error ? error.message : 'Unknown error',
        buses: [], // Always return an array
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - simple fallback for compatibility (no existingBuses support)
 * Use POST for position continuity
 */
export async function GET(request: NextRequest) {
  const handlerStart = performance.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const stopId = searchParams.get('stopId');

    if (!stopId) {
      return NextResponse.json(
        { error: 'stopId parameter is required' },
        { status: 400 }
      );
    }

    // GET doesn't support existingBuses (use POST for position continuity)
    const { buses, dataSource, computationMethod, externalFetchMs, computeMs } = await getBusesForStop(
      stopId,
      null
    );

    const handlerEnd = performance.now();

    // Console log për të treguar burimin e të dhënave
    if (dataSource === 'external') {
      console.log('✅ [API] Të dhëna REALE nga external API -', buses.length, 'autobusë');
    } else {
      console.log('⚠️ [API] Të dhëna MOCK (fallback) -', buses.length, 'autobusë');
    }

    return NextResponse.json({
      stopId,
      buses,
      timestamp: new Date().toISOString(),
      computationMethod,
      dataSource, // Indicate whether data came from external API or mock
      meta: {
        performance: {
          totalMs: handlerEnd - handlerStart,
          externalFetchMs: externalFetchMs || 0,
          computeMs: computeMs || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error in /api/buses GET:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        buses: [], // Always return an array
      },
      { status: 500 }
    );
  }
}
