'use client';

import { useState, useEffect } from 'react';

interface PerformanceDebugProps {
  lastApiResponse?: any;
}

export default function PerformanceDebug({ lastApiResponse }: PerformanceDebugProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<any>(lastApiResponse);

  useEffect(() => {
    setResponse(lastApiResponse);
  }, [lastApiResponse]);

  if (!response?.meta?.performance) {
    return null;
  }

  const perf = response.meta.performance;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-gray-700">
          Debug: Last API Performance Metrics
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600">Total Time:</span>
              <span className="ml-2 font-semibold text-gray-900">{perf.totalMs?.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="text-gray-600">External Fetch:</span>
              <span className="ml-2 font-semibold text-gray-900">{perf.externalFetchMs?.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Compute Time:</span>
              <span className="ml-2 font-semibold text-gray-900">{perf.computeMs?.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Data Source:</span>
              <span className="ml-2 font-semibold text-gray-900">{response.dataSource || 'N/A'}</span>
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
              Full Response Meta
            </summary>
            <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-auto max-h-40 text-xs">
              {JSON.stringify(response.meta, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
