import { PerformanceMeasurement } from '@/types/performance';

/**
 * Calculate percentile from sorted array
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calculate summary statistics for a set of measurements
 */
export interface SessionStats {
  sessionTag: '4G' | '5G';
  totalSamples: number;
  clientDurationMs: {
    avg: number;
    median: number;
    p90: number;
    p95: number;
  };
  serverTotalMs: {
    avg: number;
    p95: number;
  };
  renderMs: {
    avg: number;
  };
  errorRate: number;
  busesCount: {
    avg: number;
  };
  responseSizeBytes: {
    avg: number;
  };
  // New metrics for better 4G vs 5G comparison
  networkLatencyMs: {
    avg: number;
    median: number;
    p95: number;
  };
  throughputMbps: {
    avg: number;
    max: number;
  };
  jitterMs: number; // Standard deviation of network latency
}

export function calculateSessionStats(
  measurements: PerformanceMeasurement[],
  sessionTag: '4G' | '5G'
): SessionStats {
  const sessionMeasurements = measurements.filter((m) => m.sessionTag === sessionTag);

  if (sessionMeasurements.length === 0) {
    return {
      sessionTag,
      totalSamples: 0,
      clientDurationMs: { avg: 0, median: 0, p90: 0, p95: 0 },
      serverTotalMs: { avg: 0, p95: 0 },
      renderMs: { avg: 0 },
      errorRate: 0,
      busesCount: { avg: 0 },
      responseSizeBytes: { avg: 0 },
      networkLatencyMs: { avg: 0, median: 0, p95: 0 },
      throughputMbps: { avg: 0, max: 0 },
      jitterMs: 0,
    };
  }

  // Client duration stats
  const clientDurations = sessionMeasurements
    .map((m) => m.clientDurationMs)
    .filter((d) => d > 0)
    .sort((a, b) => a - b);
  const clientDurationAvg = clientDurations.reduce((sum, d) => sum + d, 0) / clientDurations.length;
  const clientDurationMedian = percentile(clientDurations, 50);
  const clientDurationP90 = percentile(clientDurations, 90);
  const clientDurationP95 = percentile(clientDurations, 95);

  // Server total time stats (only for measurements that have it)
  const serverTimes = sessionMeasurements
    .map((m) => m.serverTotalMs)
    .filter((t): t is number => t !== undefined && t > 0)
    .sort((a, b) => a - b);
  const serverTimeAvg = serverTimes.length > 0 ? serverTimes.reduce((sum, t) => sum + t, 0) / serverTimes.length : 0;
  const serverTimeP95 = percentile(serverTimes, 95);

  // Render time stats
  const renderTimes = sessionMeasurements
    .map((m) => m.renderMs)
    .filter((t): t is number => t !== undefined && t > 0);
  const renderTimeAvg = renderTimes.length > 0 ? renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length : 0;

  // Error rate
  const totalErrors = sessionMeasurements.reduce((sum, m) => sum + m.errorsCount, 0);
  const errorRate = (totalErrors / sessionMeasurements.length) * 100;

  // Average buses count
  const busesCountAvg =
    sessionMeasurements.length > 0
      ? sessionMeasurements.reduce((sum, m) => sum + m.busesCount, 0) / sessionMeasurements.length
      : 0;

  // Average response size
  const responseSizeAvg =
    sessionMeasurements.length > 0
      ? sessionMeasurements.reduce((sum, m) => sum + m.responseSizeBytes, 0) / sessionMeasurements.length
      : 0;

  // Network Latency (clientDurationMs - serverTotalMs) - pure network latency
  const networkLatencies = sessionMeasurements
    .map((m) => {
      if (m.serverTotalMs !== undefined && m.serverTotalMs > 0) {
        return m.clientDurationMs - m.serverTotalMs;
      }
      return null;
    })
    .filter((latency): latency is number => latency !== null && latency > 0)
    .sort((a, b) => a - b);
  
  const networkLatencyAvg = networkLatencies.length > 0 
    ? networkLatencies.reduce((sum, l) => sum + l, 0) / networkLatencies.length 
    : 0;
  const networkLatencyMedian = percentile(networkLatencies, 50);
  const networkLatencyP95 = percentile(networkLatencies, 95);

  // Throughput (Mbps) = (responseSizeBytes * 8) / (clientDurationMs / 1000)
  const throughputs = sessionMeasurements
    .map((m) => {
      if (m.clientDurationMs > 0 && m.responseSizeBytes > 0) {
        return (m.responseSizeBytes * 8) / (m.clientDurationMs / 1000); // Convert to Mbps
      }
      return null;
    })
    .filter((t): t is number => t !== null && t > 0);
  
  const throughputAvg = throughputs.length > 0 
    ? throughputs.reduce((sum, t) => sum + t, 0) / throughputs.length 
    : 0;
  const throughputMax = throughputs.length > 0 ? Math.max(...throughputs) : 0;

  // Jitter (standard deviation of network latency)
  const jitter = networkLatencies.length > 1
    ? Math.sqrt(
        networkLatencies.reduce((sum, l) => {
          const diff = l - networkLatencyAvg;
          return sum + diff * diff;
        }, 0) / networkLatencies.length
      )
    : 0;

  return {
    sessionTag,
    totalSamples: sessionMeasurements.length,
    clientDurationMs: {
      avg: Math.round(clientDurationAvg),
      median: Math.round(clientDurationMedian),
      p90: Math.round(clientDurationP90),
      p95: Math.round(clientDurationP95),
    },
    serverTotalMs: {
      avg: Math.round(serverTimeAvg),
      p95: Math.round(serverTimeP95),
    },
    renderMs: {
      avg: Math.round(renderTimeAvg),
    },
    errorRate: Math.round(errorRate * 100) / 100,
    busesCount: {
      avg: Math.round(busesCountAvg),
    },
    responseSizeBytes: {
      avg: Math.round(responseSizeAvg),
    },
    networkLatencyMs: {
      avg: Math.round(networkLatencyAvg),
      median: Math.round(networkLatencyMedian),
      p95: Math.round(networkLatencyP95),
    },
    throughputMbps: {
      avg: Math.round(throughputAvg * 100) / 100, // Round to 2 decimals
      max: Math.round(throughputMax * 100) / 100,
    },
    jitterMs: Math.round(jitter * 100) / 100,
  };
}

/**
 * Generate observations comparing 4G and 5G sessions
 */
export function generateObservations(
  stats4G: SessionStats,
  stats5G: SessionStats
): string[] {
  const observations: string[] = [];

  if (stats4G.totalSamples === 0 || stats5G.totalSamples === 0) {
    observations.push('Insufficient data for comparison. Please collect samples for both 4G and 5G sessions.');
    return observations;
  }

  // Compare Network Latency (pure network latency, excluding server time)
  if (stats4G.networkLatencyMs.median > 0 && stats5G.networkLatencyMs.median > 0) {
    const networkLatencyDiff = stats4G.networkLatencyMs.median - stats5G.networkLatencyMs.median;
    if (networkLatencyDiff > 0) {
      const improvementPercent = Math.round((networkLatencyDiff / stats4G.networkLatencyMs.median) * 100);
      observations.push(
        `5G showed ${improvementPercent}% lower network latency (${stats5G.networkLatencyMs.median}ms vs ${stats4G.networkLatencyMs.median}ms in 4G), a reduction of ${Math.round(networkLatencyDiff)}ms. This is the pure network latency excluding server processing time.`
      );
    } else if (networkLatencyDiff < -5) {
      observations.push(
        `4G showed lower network latency (${stats4G.networkLatencyMs.median}ms vs ${stats5G.networkLatencyMs.median}ms in 5G), though this may be due to network conditions during testing.`
      );
    }
  }

  // Compare client duration (total latency including server time)
  const latencyDiff = stats4G.clientDurationMs.median - stats5G.clientDurationMs.median;
  if (latencyDiff > 0) {
    observations.push(
      `In 5G we observed lower total latency (${stats5G.clientDurationMs.median}ms vs ${stats4G.clientDurationMs.median}ms in 4G), a reduction of ${Math.round(latencyDiff)}ms (${Math.round((latencyDiff / stats4G.clientDurationMs.median) * 100)}%).`
    );
  } else if (latencyDiff < 0) {
    observations.push(
      `4G showed lower total latency (${stats4G.clientDurationMs.median}ms vs ${stats5G.clientDurationMs.median}ms in 5G), though this may be due to network conditions during testing.`
    );
  }

  // Compare p95 latency
  const p95Diff = stats4G.clientDurationMs.p95 - stats5G.clientDurationMs.p95;
  if (p95Diff > 10) {
    observations.push(
      `5G demonstrated significantly lower p95 latency (${stats5G.clientDurationMs.p95}ms vs ${stats4G.clientDurationMs.p95}ms in 4G), indicating more consistent performance under load.`
    );
  }

  // Compare variance
  const variance4G = stats4G.clientDurationMs.p95 - stats4G.clientDurationMs.median;
  const variance5G = stats5G.clientDurationMs.p95 - stats5G.clientDurationMs.median;
  if (variance4G > variance5G * 1.2) {
    observations.push(`4G had higher latency variance (${Math.round(variance4G)}ms p95-median spread vs ${Math.round(variance5G)}ms in 5G), showing less consistent performance.`);
  }

  // Compare error rates
  if (stats4G.errorRate > stats5G.errorRate * 1.1) {
    observations.push(
      `5G showed lower error rate (${stats5G.errorRate.toFixed(2)}% vs ${stats4G.errorRate.toFixed(2)}% in 4G), indicating more reliable connections.`
    );
  }

  // Compare server response times
  if (stats4G.serverTotalMs.avg > 0 && stats5G.serverTotalMs.avg > 0) {
    const serverDiff = stats4G.serverTotalMs.avg - stats5G.serverTotalMs.avg;
    if (Math.abs(serverDiff) > 5) {
      if (serverDiff > 0) {
        observations.push(
          `Backend processing times were slightly faster during 5G sessions (${stats5G.serverTotalMs.avg}ms avg vs ${stats4G.serverTotalMs.avg}ms in 4G), though this is likely due to server load variations rather than network type.`
        );
      }
    }
  }

  // Compare render times
  if (stats4G.renderMs.avg > 0 && stats5G.renderMs.avg > 0) {
    const renderDiff = stats4G.renderMs.avg - stats5G.renderMs.avg;
    if (Math.abs(renderDiff) > 1) {
      observations.push(
        `Client-side rendering times were similar (${stats5G.renderMs.avg}ms avg in 5G vs ${stats4G.renderMs.avg}ms in 4G), as expected since rendering is independent of network type.`
      );
    }
  }

  // Compare Throughput
  if (stats4G.throughputMbps.avg > 0 && stats5G.throughputMbps.avg > 0) {
    const throughputDiff = stats5G.throughputMbps.avg - stats4G.throughputMbps.avg;
    if (throughputDiff > 0.5) {
      const improvementPercent = Math.round((throughputDiff / stats4G.throughputMbps.avg) * 100);
      observations.push(
        `5G achieved ${improvementPercent}% higher throughput (${stats5G.throughputMbps.avg.toFixed(2)} Mbps avg vs ${stats4G.throughputMbps.avg.toFixed(2)} Mbps in 4G), indicating faster data transfer rates.`
      );
    } else if (throughputDiff < -0.5) {
      observations.push(
        `4G showed higher throughput (${stats4G.throughputMbps.avg.toFixed(2)} Mbps vs ${stats5G.throughputMbps.avg.toFixed(2)} Mbps in 5G), though this may be due to network conditions during testing.`
      );
    }
  }

  // Compare Jitter (consistency)
  if (stats4G.jitterMs > 0 && stats5G.jitterMs > 0) {
    const jitterDiff = stats4G.jitterMs - stats5G.jitterMs;
    if (jitterDiff > 2) {
      const improvementPercent = Math.round((jitterDiff / stats4G.jitterMs) * 100);
      observations.push(
        `5G showed ${improvementPercent}% lower jitter (${stats5G.jitterMs.toFixed(2)}ms vs ${stats4G.jitterMs.toFixed(2)}ms in 4G), indicating more consistent and predictable network performance.`
      );
    } else if (jitterDiff < -2) {
      observations.push(
        `4G showed lower jitter (${stats4G.jitterMs.toFixed(2)}ms vs ${stats5G.jitterMs.toFixed(2)}ms in 5G), though this may be due to network conditions during testing.`
      );
    }
  }

  // Overall summary
  if (observations.length === 0) {
    observations.push('Both 4G and 5G sessions showed similar performance metrics. Consider collecting more samples or testing under different network conditions.');
  } else {
    // Add summary at the end
    const networkLatencyImprovement = stats4G.networkLatencyMs.median > 0 && stats5G.networkLatencyMs.median > 0
      ? Math.round(((stats4G.networkLatencyMs.median - stats5G.networkLatencyMs.median) / stats4G.networkLatencyMs.median) * 100)
      : 0;
    
    if (networkLatencyImprovement > 0) {
      observations.push(
        `Overall, 5G demonstrated ${networkLatencyImprovement}% improvement in network latency compared to 4G, making it more suitable for real-time applications.`
      );
    }
  }

  return observations;
}
