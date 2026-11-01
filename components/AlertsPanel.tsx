'use client';

import { Alert, BusLine } from '@/types';
import { getAlertsForLine } from '@/data/routes';

interface AlertsPanelProps {
  selectedLineId?: string;
  allAlerts?: Alert[];
}

export default function AlertsPanel({ selectedLineId, allAlerts }: AlertsPanelProps) {
  // Get alerts for selected line or all alerts
  const alerts = selectedLineId
    ? getAlertsForLine(selectedLineId)
    : allAlerts || [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'flood':
        return '🌊';
      case 'accident':
        return '🚨';
      case 'heavy-traffic':
        return '🚦';
      case 'construction':
        return '🚧';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Alerts</h3>
        <p className="text-xs text-gray-500">No active alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Active Alerts</h3>
        <span className="text-xs text-gray-500 bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">{alert.title}</h4>
                  <span className="text-xs opacity-75">{getTimeAgo(alert.timestamp)}</span>
                </div>
                <p className="text-xs leading-relaxed">{alert.message}</p>
                {alert.affectedLineIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {alert.affectedLineIds.map((lineId) => (
                      <span
                        key={lineId}
                        className="text-xs bg-white/50 px-2 py-0.5 rounded font-medium"
                      >
                        Line {lineId.split('-')[1]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
