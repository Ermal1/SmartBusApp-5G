'use client';

import { useEffect } from 'react';
import { Bus } from '@/types';

interface BusBottomSheetProps {
  bus: Bus | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusBottomSheet({ bus, isOpen, onClose }: BusBottomSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!bus || !isOpen) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On time';
      case 'delayed':
        return 'Delayed';
      case 'traffic-jam':
        return 'In traffic jam';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'traffic-jam':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[997] lg:hidden transition-opacity"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-[998] lg:hidden transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '70vh',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Route {bus.routeNumber}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(70vh - 100px)' }}>
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(bus.status)}`}>
              {getStatusLabel(bus.status)}
            </span>
          </div>

          {/* Destination */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Destination</div>
            <div className="text-base font-semibold text-gray-900">{bus.destination}</div>
          </div>

          {/* ETA */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Estimated Arrival</div>
            <div className="text-2xl font-bold text-gray-900">{bus.eta} min</div>
          </div>

          {/* Delay */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Delay</div>
            <div className={`text-lg font-semibold ${bus.delayMinutes > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
              {bus.delayMinutes <= 1 ? 'On time' : `+${bus.delayMinutes.toFixed(1)} min`}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {/* Occupancy */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Occupancy</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {bus.occupancy}
              </span>
            </div>

            {/* Plate Number */}
            {bus.plate && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Plate Number</span>
                <span className="text-sm font-semibold text-gray-900">
                  {bus.plate}
                </span>
              </div>
            )}

            {/* Speed */}
            {bus.speedKmh !== undefined && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Speed</span>
                <span className="text-sm font-semibold text-gray-900">
                  {bus.speedKmh.toFixed(1)} km/h
                </span>
              </div>
            )}

            {/* Current Address */}
            {bus.address && (
              <div className="py-2">
                <div className="text-xs text-gray-500 mb-1">Current Location</div>
                <div className="text-sm text-gray-900">{bus.address}</div>
              </div>
            )}

            {/* Vehicle Status */}
            {bus.derivedStatus && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Vehicle Status</span>
                <span className={`text-sm font-semibold ${
                  bus.derivedStatus === 'moving' ? 'text-green-700' :
                  bus.derivedStatus === 'offline' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {bus.derivedStatus.charAt(0).toUpperCase() + bus.derivedStatus.slice(1)}
                </span>
              </div>
            )}

            {/* Last Updated */}
            {(bus.lastUpdated || bus.lastUpdate) && (
              <div className="py-2 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Last updated: {(() => {
                    const updatedDate = new Date(bus.lastUpdated || bus.lastUpdate);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60));
                    return diffMinutes < 1 
                      ? 'Just now' 
                      : diffMinutes < 60 
                        ? `${diffMinutes}m ago`
                        : updatedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
