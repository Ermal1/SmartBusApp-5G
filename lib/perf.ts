import { PerformanceMeasurement, NetworkInfo } from '@/types/performance';

/**
 * Measure fetch performance with timing information
 */
export async function measureFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; timings: { start: number; end: number; durationMs: number } }> {
  const start = performance.now();
  
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    
    const data = await response.json();
    
    return {
      data,
      timings: {
        start,
        end,
        durationMs: end - start,
      },
    };
  } catch (error) {
    const end = performance.now();
    throw {
      error,
      timings: {
        start,
        end,
        durationMs: end - start,
      },
    };
  }
}

/**
 * Convert performance measurements to CSV format
 */
export function toCSV(measurements: PerformanceMeasurement[]): string {
  if (measurements.length === 0) {
    return '';
  }
  
  // CSV Header
  const headers = [
    'timestamp',
    'sessionTag',
    'networkTag',
    'effectiveType',
    'downlink',
    'rtt',
    'clientDurationMs',
    'serverTotalMs',
    'networkLatencyMs', // New: pure network latency
    'throughputMbps', // New: calculated throughput
    'externalFetchMs',
    'computeMs',
    'responseSizeBytes',
    'busesCount',
    'renderMs',
    'errorsCount',
    'timeoutOccurred',
    'fallbackUsed',
    'stopId',
    'userAgent',
  ];
  
  // CSV Rows
  const rows = measurements.map((m) => {
    // Calculate network latency (clientDurationMs - serverTotalMs)
    const networkLatency = m.serverTotalMs !== undefined && m.serverTotalMs > 0
      ? (m.clientDurationMs - m.serverTotalMs).toString()
      : '';
    
    // Calculate throughput (Mbps)
    const throughput = m.clientDurationMs > 0 && m.responseSizeBytes > 0
      ? ((m.responseSizeBytes * 8) / (m.clientDurationMs / 1000)).toFixed(2)
      : '';
    
    return [
      m.timestamp,
      m.sessionTag || '',
      m.networkTag,
      m.effectiveType || '',
      m.downlink?.toString() || '',
      m.rtt?.toString() || '',
      m.clientDurationMs.toString(),
      m.serverTotalMs?.toString() || '',
      networkLatency, // New: pure network latency
      throughput, // New: calculated throughput
      m.externalFetchMs?.toString() || '',
      m.computeMs?.toString() || '',
      m.responseSizeBytes.toString(),
      m.busesCount.toString(),
      m.renderMs?.toString() || '',
      m.errorsCount.toString(),
      m.timeoutOccurred ? 'true' : 'false',
      m.fallbackUsed ? 'true' : 'false',
      m.stopId || '',
      m.userAgent || '',
    ];
  });
  
  // Combine header and rows
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  
  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(measurements: PerformanceMeasurement[], filename: string = 'performance-test.csv'): void {
  const csv = toCSV(measurements);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download JSON file
 */
export function downloadJSON(measurements: PerformanceMeasurement[], filename: string = 'performance-test.json'): void {
  const json = JSON.stringify(measurements, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Estimate response size in bytes
 */
export function estimateResponseSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}
