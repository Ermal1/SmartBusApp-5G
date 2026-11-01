export interface NetworkInfo {
  networkTag: '5G' | '4G' | 'Wi-Fi' | 'Unknown';
  effectiveType?: string; // '4g', '3g', 'slow-2g', etc.
  downlink?: number; // Mbps
  rtt?: number; // ms
}

export interface PerformanceMeasurement {
  timestamp: string;
  networkTag: string;
  sessionTag?: '4G' | '5G'; // Added for 4G vs 5G comparison
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  
  // API metrics
  clientStart: number;
  clientEnd: number;
  clientDurationMs: number;
  responseSizeBytes: number;
  busesCount: number;
  
  // Render metrics
  renderMs?: number;
  
  // Error counters
  errorsCount: number;
  timeoutOccurred: boolean;
  fallbackUsed: boolean; // external API vs mock
  
  // Backend metrics (from API response)
  serverTotalMs?: number;
  externalFetchMs?: number;
  computeMs?: number;
  
  stopId?: string;
  userAgent?: string; // Added for reproducibility
}

export interface PerformanceTestConfig {
  durationMinutes: number;
  intervalSeconds: number;
  stopId: string | null;
}
