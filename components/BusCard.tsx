'use client';

import { useState } from 'react';
import { Bus } from '@/types';
import { getBusLineById, getAlertsForLine } from '@/data/routes';

interface BusCardProps {
  bus: Bus;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function BusCard({ bus, isSelected = false, onSelect }: BusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Get bus line info for price
  const busLine = getBusLineById(bus.lineId);
  const alerts = getAlertsForLine(bus.lineId);
  const hasAlerts = alerts.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'traffic-jam':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On Time';
      case 'delayed':
        return 'Delayed';
      case 'traffic-jam':
        return 'In Traffic Jam';
      default:
        return status;
    }
  };

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low':
        return 'bg-[var(--primary-soft)] text-[var(--primary-foreground)]';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyLabel = (occupancy: string) => {
    return occupancy.charAt(0).toUpperCase() + occupancy.slice(1);
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md ring-2 ring-blue-100'
          : 'border-gray-200 hover:shadow-md hover:border-blue-300'
      }`}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0"
            style={{
              backgroundColor: busLine?.color || (isSelected ? '#2563eb' : '#3b82f6'),
            }}
          >
            {bus.routeNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {bus.destination}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-lg font-bold ${
                isSelected ? 'text-blue-700' : 'text-gray-900'
              }`}>{bus.eta}</span>
              <span className="text-xs text-gray-600">min</span>
              {bus.delayMinutes <= 1 ? (
                <div className="flex items-center gap-0.5 text-green-600 ml-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium">On time</span>
                </div>
              ) : (
                <span className={`text-xs font-medium ml-1 ${
                  bus.delayMinutes <= 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  +{bus.delayMinutes.toFixed(1)}min
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(
            bus.status
          )}`}
        >
          {getStatusLabel(bus.status)}
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          {/* Occupancy */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getOccupancyColor(bus.occupancy)}`}>
              {getOccupancyLabel(bus.occupancy)} Occupancy
            </span>
          </div>

          {/* Price */}
          {busLine && (
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-2 border border-green-200">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-700">Ticket Price:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-green-700">{busLine.price.toFixed(2)} €</span>
                {busLine.studentPrice && (
                  <span className="text-xs text-gray-600">({busLine.studentPrice.toFixed(2)} € student)</span>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {hasAlerts && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <span className="text-sm">⚠️</span>
              <span className="text-xs font-medium text-yellow-800">
                {alerts.length} alert{alerts.length > 1 ? 's' : ''} affecting this route
              </span>
            </div>
          )}

          {/* Vehicle Info */}
          {(bus.plate || bus.speedKmh !== undefined || bus.address || bus.lastUpdated || bus.derivedStatus) && (
            <div className="bg-gray-50 rounded-md p-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Live Vehicle Info
              </h4>
              <div className="space-y-1.5 text-xs">
                {bus.plate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plate:</span>
                    <span className="font-medium text-gray-900">{bus.plate}</span>
                  </div>
                )}
                {bus.speedKmh !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium text-gray-900">{bus.speedKmh.toFixed(1)} km/h</span>
                  </div>
                )}
                {bus.address && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-gray-900 text-right flex-1 truncate" title={bus.address}>
                      {bus.address.length > 30 ? `${bus.address.substring(0, 30)}...` : bus.address}
                    </span>
                  </div>
                )}
                {bus.derivedStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      bus.derivedStatus === 'moving' ? 'text-green-700' :
                      bus.derivedStatus === 'offline' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {bus.derivedStatus.charAt(0).toUpperCase() + bus.derivedStatus.slice(1)}
                    </span>
                  </div>
                )}
                {bus.lastUpdated && (() => {
                  const updatedDate = new Date(bus.lastUpdated);
                  const now = new Date();
                  const diffMinutes = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60));
                  const timeStr = diffMinutes < 1 
                    ? 'Just now' 
                    : diffMinutes < 60 
                      ? `${diffMinutes}m ago`
                      : updatedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last updated:</span>
                      <span className="font-medium text-gray-900">{timeStr}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* See More/Less Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="mt-2 w-full text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-1 transition-colors pt-1"
      >
        {isExpanded ? (
          <>
            <span>Show less</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>See more</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
