'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMeasurement, PerformanceTestConfig, NetworkInfo as NetworkInfoType } from '@/types/performance';
import { getNetworkInfoWithOverride, setManualNetworkTag, getManualNetworkTag } from '@/lib/network';
import { measureFetch, downloadCSV, downloadJSON, estimateResponseSize } from '@/lib/perf';
import { calculateSessionStats, generateObservations, SessionStats } from '@/lib/perfStats';
import NetworkInfo from '@/components/NetworkInfo';
import AppHeader from '@/components/AppHeader';
import BottomNavigation from '@/components/BottomNavigation';
import TopTabs from '@/components/TopTabs';

export default function PerformanceTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<PerformanceTestConfig>({
    durationMinutes: 3,
    intervalSeconds: 10,
    stopId: null,
  });
  const [sessionTag, setSessionTag] = useState<'4G' | '5G' | null>(null);
  const [measurements, setMeasurements] = useState<PerformanceMeasurement[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoType>({ networkTag: 'Unknown' });
  const [allBusStops, setAllBusStops] = useState<Array<{ id: string; name: string }>>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const renderStartRef = useRef<number | null>(null);

  // Load measurements from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('performanceMeasurements');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMeasurements(parsed);
        } catch (e) {
          console.error('Failed to parse stored measurements:', e);
        }
      }
    }

    // Load bus stops
    fetch('/api/bus-stops')
      .then((res) => res.json())
      .then((data) => {
        if (data.stops) {
          setAllBusStops(data.stops.map((s: any) => ({ id: s.id, name: s.name })));
        }
      })
      .catch((err) => console.error('Failed to fetch bus stops:', err));

    // Initialize network info
    const info = getNetworkInfoWithOverride();
    setNetworkInfo(info);
  }, []);

  // Save measurements to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && measurements.length > 0) {
      localStorage.setItem('performanceMeasurements', JSON.stringify(measurements));
    }
  }, [measurements]);

  const startTest = useCallback(() => {
    if (!sessionTag) {
      alert('Please select a session tag (4G or 5G) before starting the test.');
      return;
    }
    setIsRunning(true);
    startTimeRef.current = Date.now();
    const endTime = startTimeRef.current + config.durationMinutes * 60 * 1000;

    const runMeasurement = async () => {
      if (!startTimeRef.current || Date.now() >= endTime) {
        stopTest();
        return;
      }

      const networkInfoCurrent = getNetworkInfoWithOverride();
      setNetworkInfo(networkInfoCurrent);

      const clientStart = performance.now();
      renderStartRef.current = clientStart;

      let errorOccurred = false;
      let timeoutOccurred = false;
      let fallbackUsed = false;
      let responseSize = 0;
      let busesCount = 0;
      let serverTotalMs: number | undefined;
      let externalFetchMs: number | undefined;
      let computeMs: number | undefined;
      let clientEnd = clientStart;
      let renderMs: number | undefined;

      try {
        const stopId = config.stopId || 'all';
        const { data, timings } = await measureFetch('/api/buses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stopId, existingBuses: null }),
        });

        clientEnd = timings.end;

        // Measure render time (simulate marker rendering)
        const renderStart = performance.now();
        // Simulate render operation
        await new Promise((resolve) => setTimeout(resolve, 0));
        renderMs = performance.now() - renderStart;

        responseSize = estimateResponseSize(data);
        busesCount = Array.isArray(data.buses) ? data.buses.length : 0;
        fallbackUsed = data.dataSource === 'mock';

        // Extract backend performance metrics
        if (data.meta?.performance) {
          serverTotalMs = data.meta.performance.totalMs;
          externalFetchMs = data.meta.performance.externalFetchMs;
          computeMs = data.meta.performance.computeMs;
        }
      } catch (err: any) {
        errorOccurred = true;
        if (err?.error?.name === 'AbortError' || err?.error?.message?.includes('timeout')) {
          timeoutOccurred = true;
        }
        clientEnd = err?.timings?.end || performance.now();
      }

      const measurement: PerformanceMeasurement = {
        timestamp: new Date().toISOString(),
        networkTag: networkInfoCurrent.networkTag,
        sessionTag: sessionTag || undefined,
        effectiveType: networkInfoCurrent.effectiveType,
        downlink: networkInfoCurrent.downlink,
        rtt: networkInfoCurrent.rtt,
        clientStart,
        clientEnd,
        clientDurationMs: clientEnd - clientStart,
        responseSizeBytes: responseSize,
        busesCount,
        renderMs,
        errorsCount: errorOccurred ? 1 : 0,
        timeoutOccurred,
        fallbackUsed,
        serverTotalMs,
        externalFetchMs,
        computeMs,
        stopId: config.stopId || undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      };

      setMeasurements((prev) => {
        const updated = [...prev, measurement];
        // Keep only last 1000 measurements to prevent memory issues
        return updated.slice(-1000);
      });
    };

    // Run first measurement immediately
    runMeasurement();

    // Then run at intervals
    intervalRef.current = setInterval(runMeasurement, config.intervalSeconds * 1000);
  }, [config, sessionTag]);

  const stopTest = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const clearResults = useCallback(() => {
    setMeasurements([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('performanceMeasurements');
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    downloadCSV(measurements, `performance-test-${new Date().toISOString().split('T')[0]}.csv`);
  }, [measurements]);

  const handleExportJSON = useCallback(() => {
    downloadJSON(measurements, `performance-test-${new Date().toISOString().split('T')[0]}.json`);
  }, [measurements]);

  // NetworkInfo component handles tag changes internally

  // Display latest 50 measurements
  const displayMeasurements = measurements.slice(-50).reverse();

  return (
    <>
      <AppHeader />
      <TopTabs />
      <div className="min-h-screen bg-[var(--brand-bg)] pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Performance Test</h1>
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">Measure and export real network performance metrics</p>

        {/* Test Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.durationMinutes}
                onChange={(e) => setConfig({ ...config, durationMinutes: parseInt(e.target.value) || 3 })}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={config.intervalSeconds}
                onChange={(e) => setConfig({ ...config, intervalSeconds: parseInt(e.target.value) || 10 })}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F4B740]/40 focus:border-[#F4B740] disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Stop (optional)
              </label>
              <select
                value={config.stopId || ''}
                onChange={(e) => setConfig({ ...config, stopId: e.target.value || null })}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All buses</option>
                {allBusStops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Session Tag for 4G vs 5G Experiment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Tag (for 4G vs 5G comparison) *
            </label>
            <select
              value={sessionTag || ''}
              onChange={(e) => setSessionTag(e.target.value === '' ? null : (e.target.value as '4G' | '5G'))}
              disabled={isRunning}
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#F4B740]/40 focus:border-[#F4B740] disabled:bg-gray-50 disabled:text-gray-500 ${
                sessionTag && networkInfo.networkTag && sessionTag !== networkInfo.networkTag && networkInfo.networkTag !== 'Unknown' && networkInfo.networkTag !== 'Wi-Fi'
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select session tag...</option>
              <option value="5G">5G Session</option>
              <option value="4G">4G Session</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Select 4G or 5G to tag this test session for comparison. Required for experiment.
            </p>
            {sessionTag && networkInfo.networkTag && sessionTag !== networkInfo.networkTag && networkInfo.networkTag !== 'Unknown' && networkInfo.networkTag !== 'Wi-Fi' && (
              <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-xs text-orange-800 font-medium">
                  ⚠️ Warning: Session Tag ({sessionTag}) doesn't match detected network ({networkInfo.networkTag}). 
                  Results may be inaccurate. Consider using manual override in Network Info above.
                </p>
              </div>
            )}
          </div>

          {/* Network Info - Improved Labeling */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Network label (auto-detected + optional override)
            </label>
            <NetworkInfo />
            <p className="text-xs text-gray-600 mt-2">
              The network label is used for tag/logging only and does not change your actual network connection.
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isRunning ? (
              <button
                onClick={startTest}
                className="px-6 py-2.5 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: '#6FCF97' }}
              >
                Start Test
              </button>
            ) : (
              <button
                onClick={stopTest}
                className="px-6 py-2.5 bg-red-400 text-white rounded-xl font-semibold hover:bg-red-500 transition-colors shadow-sm"
              >
                Stop Test
              </button>
            )}
            <button
              onClick={clearResults}
              disabled={isRunning || measurements.length === 0}
              className="px-6 py-2.5 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              Clear Results
            </button>
            <button
              onClick={handleExportCSV}
              disabled={measurements.length === 0}
              className="px-6 py-2.5 bg-blue-400 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              disabled={measurements.length === 0}
              className="px-6 py-2.5 bg-violet-400 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              Export JSON
            </button>
          </div>

          {isRunning && startTimeRef.current && (
            <div className="mt-4 text-sm text-gray-700 font-medium">
              Test running... Elapsed: {Math.floor((Date.now() - startTimeRef.current) / 1000)}s / {config.durationMinutes * 60}s
            </div>
          )}
        </div>

        {/* Session Statistics - 4G vs 5G Comparison */}
        {measurements.length > 0 && (() => {
          const stats4G = calculateSessionStats(measurements, '4G');
          const stats5G = calculateSessionStats(measurements, '5G');
          const observations = generateObservations(stats4G, stats5G);
          
          return (
            <>
              {/* Overall Statistics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Overall Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Samples</div>
                    <div className="text-2xl font-bold text-gray-900">{measurements.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Client Duration</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(measurements.reduce((sum, m) => sum + m.clientDurationMs, 0) / measurements.length)}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Server Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        measurements
                          .filter((m) => m.serverTotalMs !== undefined)
                          .reduce((sum, m) => sum + (m.serverTotalMs || 0), 0) /
                        Math.max(1, measurements.filter((m) => m.serverTotalMs !== undefined).length)
                      )}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Errors</div>
                    <div className="text-2xl font-bold text-red-600">
                      {measurements.reduce((sum, m) => sum + m.errorsCount, 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4G vs 5G Comparison */}
              {(stats4G.totalSamples > 0 || stats5G.totalSamples > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-0">4G vs 5G Session Comparison</h2>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 bg-orange-50 rounded">4G: {stats4G.totalSamples} samples</span>
                      <span className="px-2 py-1 bg-green-50 rounded">5G: {stats5G.totalSamples} samples</span>
                    </div>
                  </div>
                  
                  {/* Sample count warning */}
                  {(stats4G.totalSamples < 10 || stats5G.totalSamples < 10) && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        💡 <strong>Tip:</strong> For more reliable results, collect at least 20-30 samples per session. 
                        Current: 4G ({stats4G.totalSamples}), 5G ({stats5G.totalSamples})
                      </p>
                    </div>
                  )}
                  
                  {/* Comparison Table - Mobile Optimized */}
                  {stats4G.totalSamples > 0 && stats5G.totalSamples > 0 && (
                    <div className="mb-6 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                      <table className="min-w-full divide-y divide-gray-200 mb-4">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase">Metric</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-semibold text-gray-700 uppercase bg-orange-50">4G</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-semibold text-gray-700 uppercase bg-green-50">5G</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-semibold text-gray-700 uppercase">Difference</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Network Latency */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                              Network Latency
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats4G.networkLatencyMs.median}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats5G.networkLatencyMs.median}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              {(() => {
                                const diff = stats4G.networkLatencyMs.median - stats5G.networkLatencyMs.median;
                                const percent = stats4G.networkLatencyMs.median > 0 ? Math.round((diff / stats4G.networkLatencyMs.median) * 100) : 0;
                                if (diff > 0) {
                                  return <span className="text-green-600 font-semibold">-{Math.round(diff)}ms ({percent}%)</span>;
                                } else if (diff < 0) {
                                  return <span className="text-orange-600 font-semibold">+{Math.round(Math.abs(diff))}ms ({Math.abs(percent)}%)</span>;
                                }
                                return <span className="text-gray-500">Same</span>;
                              })()}
                            </td>
                          </tr>
                          {/* Throughput */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                              Throughput
                              {(stats4G.throughputMbps.avg > 1000000 || stats5G.throughputMbps.avg > 1000000) && (
                                <span className="ml-1 text-orange-600" title="Extremely high throughput values detected. This may indicate calculation issues or very large response sizes.">
                                  ⚠️
                                </span>
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">
                              {stats4G.throughputMbps.avg > 1000000 ? (
                                <span className="text-orange-600" title="Value seems unusually high">
                                  {stats4G.throughputMbps.avg.toFixed(2)} Mbps
                                </span>
                              ) : (
                                stats4G.throughputMbps.avg.toFixed(2) + ' Mbps'
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">
                              {stats5G.throughputMbps.avg > 1000000 ? (
                                <span className="text-orange-600" title="Value seems unusually high">
                                  {stats5G.throughputMbps.avg.toFixed(2)} Mbps
                                </span>
                              ) : (
                                stats5G.throughputMbps.avg.toFixed(2) + ' Mbps'
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              {(() => {
                                const diff = stats5G.throughputMbps.avg - stats4G.throughputMbps.avg;
                                const percent = stats4G.throughputMbps.avg > 0 ? Math.round((diff / stats4G.throughputMbps.avg) * 100) : 0;
                                if (diff > 0) {
                                  return <span className="text-green-600 font-semibold">+{diff.toFixed(2)} ({percent}%)</span>;
                                } else if (diff < 0) {
                                  return <span className="text-orange-600 font-semibold">{diff.toFixed(2)} ({Math.abs(percent)}%)</span>;
                                }
                                return <span className="text-gray-500">Same</span>;
                              })()}
                            </td>
                          </tr>
                          {/* Jitter */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                              Jitter
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats4G.jitterMs.toFixed(2)}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats5G.jitterMs.toFixed(2)}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              {(() => {
                                const diff = stats4G.jitterMs - stats5G.jitterMs;
                                const percent = stats4G.jitterMs > 0 ? Math.round((diff / stats4G.jitterMs) * 100) : 0;
                                if (diff > 0) {
                                  return <span className="text-green-600 font-semibold">-{diff.toFixed(2)}ms ({percent}%)</span>;
                                } else if (diff < 0) {
                                  return <span className="text-orange-600 font-semibold">+{Math.abs(diff).toFixed(2)}ms ({Math.abs(percent)}%)</span>;
                                }
                                return <span className="text-gray-500">Same</span>;
                              })()}
                            </td>
                          </tr>
                          {/* Total Latency */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                              Total Latency
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats4G.clientDurationMs.median}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats5G.clientDurationMs.median}ms</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              {(() => {
                                const diff = stats4G.clientDurationMs.median - stats5G.clientDurationMs.median;
                                const percent = stats4G.clientDurationMs.median > 0 ? Math.round((diff / stats4G.clientDurationMs.median) * 100) : 0;
                                if (diff > 0) {
                                  return <span className="text-green-600 font-semibold">-{Math.round(diff)}ms ({percent}%)</span>;
                                } else if (diff < 0) {
                                  return <span className="text-orange-600 font-semibold">+{Math.round(Math.abs(diff))}ms ({Math.abs(percent)}%)</span>;
                                }
                                return <span className="text-gray-500">Same</span>;
                              })()}
                            </td>
                          </tr>
                          {/* Error Rate */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                              Error Rate
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats4G.errorRate.toFixed(2)}%</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center text-gray-900">{stats5G.errorRate.toFixed(2)}%</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              {(() => {
                                const diff = stats4G.errorRate - stats5G.errorRate;
                                if (diff > 0) {
                                  return <span className="text-green-600 font-semibold">-{diff.toFixed(2)}%</span>;
                                } else if (diff < 0) {
                                  return <span className="text-orange-600 font-semibold">+{Math.abs(diff).toFixed(2)}%</span>;
                                }
                                return <span className="text-gray-500">Same</span>;
                              })()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* 4G Stats */}
                    {stats4G.totalSamples > 0 && (
                      <div className="border border-[#F4B740]/30 rounded-xl p-3 md:p-4 bg-[#FFF8E8]">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">4G Session Details</h3>
                        <div className="space-y-2 text-xs md:text-sm">
                          <div><span className="font-semibold">Samples:</span> {stats4G.totalSamples}</div>
                          <div className="mt-2 md:mt-3">
                            <div className="font-semibold text-gray-700 mb-1">Network Latency (ms):</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Median: {stats4G.networkLatencyMs.median}</div>
                              <div>P95: {stats4G.networkLatencyMs.p95}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Throughput:</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Avg: {stats4G.throughputMbps.avg.toFixed(2)} Mbps</div>
                              <div>Max: {stats4G.throughputMbps.max.toFixed(2)} Mbps</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Jitter:</div>
                            <div className="ml-2 md:ml-4">{stats4G.jitterMs.toFixed(2)}ms</div>
                          </div>
                          <div className="mt-2 md:mt-3">
                            <div className="font-semibold text-gray-700 mb-1">Client Duration (ms):</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Median: {stats4G.clientDurationMs.median}</div>
                              <div>P95: {stats4G.clientDurationMs.p95}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Server Time (ms):</div>
                            <div className="ml-2 md:ml-4">
                              <div>Avg: {stats4G.serverTotalMs.avg}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Other:</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Error Rate: {stats4G.errorRate.toFixed(2)}%</div>
                              <div>Avg Buses: {stats4G.busesCount.avg}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5G Stats */}
                    {stats5G.totalSamples > 0 && (
                      <div className="border border-[#F4B740]/40 rounded-xl p-3 md:p-4 bg-[#FFF1D1]">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">5G Session Details</h3>
                        <div className="space-y-2 text-xs md:text-sm">
                          <div><span className="font-semibold">Samples:</span> {stats5G.totalSamples}</div>
                          <div className="mt-2 md:mt-3">
                            <div className="font-semibold text-gray-700 mb-1">Network Latency (ms):</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Median: {stats5G.networkLatencyMs.median}</div>
                              <div>P95: {stats5G.networkLatencyMs.p95}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Throughput:</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Avg: {stats5G.throughputMbps.avg.toFixed(2)} Mbps</div>
                              <div>Max: {stats5G.throughputMbps.max.toFixed(2)} Mbps</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Jitter:</div>
                            <div className="ml-2 md:ml-4">{stats5G.jitterMs.toFixed(2)}ms</div>
                          </div>
                          <div className="mt-2 md:mt-3">
                            <div className="font-semibold text-gray-700 mb-1">Client Duration (ms):</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Median: {stats5G.clientDurationMs.median}</div>
                              <div>P95: {stats5G.clientDurationMs.p95}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Server Time (ms):</div>
                            <div className="ml-2 md:ml-4">
                              <div>Avg: {stats5G.serverTotalMs.avg}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Other:</div>
                            <div className="ml-2 md:ml-4 space-y-1">
                              <div>Error Rate: {stats5G.errorRate.toFixed(2)}%</div>
                              <div>Avg Buses: {stats5G.busesCount.avg}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observations */}
                  {observations.length > 0 && (
                    <div className="mt-6 p-4 bg-[#FFF8E8] border border-[#F4B740]/30 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Observations</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {observations.map((obs, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#F4B740] mt-1">•</span>
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {/* Results Table - Mobile-friendly */}
        {displayMeasurements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Latest Results (last 50)</h2>
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Session</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Network</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Server</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Size</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Buses</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Render</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayMeasurements.map((m, idx) => (
                    <tr key={idx} className={m.errorsCount > 0 ? 'bg-red-50' : ''}>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm hidden md:table-cell">
                        {m.sessionTag && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            m.sessionTag === '5G' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {m.sessionTag}
                          </span>
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 hidden sm:table-cell whitespace-nowrap">
                        {m.networkTag}
                        {m.effectiveType && ` (${m.effectiveType})`}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 font-semibold">{Math.round(m.clientDurationMs)}ms</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 hidden md:table-cell">
                        {m.serverTotalMs !== undefined ? `${Math.round(m.serverTotalMs)}ms` : '-'}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 hidden lg:table-cell">
                        {(m.responseSizeBytes / 1024).toFixed(1)}KB
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 hidden lg:table-cell">{m.busesCount}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 hidden lg:table-cell">
                        {m.renderMs !== undefined ? `${Math.round(m.renderMs)}ms` : '-'}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
                        {m.errorsCount > 0 ? (
                          <span className="text-red-600 font-semibold">Error</span>
                        ) : m.fallbackUsed ? (
                          <span className="text-orange-600 hidden sm:inline">Mock</span>
                        ) : (
                          <span className="text-green-600 font-semibold">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3 md:hidden">
              Swipe horizontally to see more columns, or use desktop view for full table.
            </p>
          </div>
        )}

        {measurements.length === 0 && !isRunning && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <p className="text-gray-600">No measurements yet. Start a test to begin collecting data.</p>
          </div>
        )}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
