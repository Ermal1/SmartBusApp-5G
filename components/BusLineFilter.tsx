'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { busLines } from '@/data/routes';
import { BusLine } from '@/types';

// Constants for mobile layout heights
const MOBILE_HEADER_H = 80; // minHeight from MobilePillHeader
const BOTTOM_NAV_H = 64; // h-16 = 64px from BottomNavigation

interface BusLineFilterProps {
  selectedLines: Set<string>;
  onToggleLine: (lineId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function BusLineFilter({
  selectedLines,
  onToggleLine,
  onSelectAll,
  onDeselectAll,
}: BusLineFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on client side before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const allSelected = selectedLines.size === busLines.length;
  const someSelected = selectedLines.size > 0 && selectedLines.size < busLines.length;

  return (
    <>
      {/* Mobile: Sidebar */}
      <div className="lg:hidden">
        {/* Toggle Button - Floating pill action button for Map tab */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#F4B740] rounded-full text-white shadow-md px-4 py-2 transition-all active:scale-[0.98] flex items-center gap-2"
          aria-label="Filter bus lines"
        >
          {/* Bus Icon - White for yellow background */}
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Simple bus icon */}
            <rect x="4" y="6" width="16" height="10" rx="2" strokeWidth="2" />
            <line x1="6" y1="10" x2="6" y2="16" strokeWidth="2" />
            <line x1="18" y1="10" x2="18" y2="16" strokeWidth="2" />
            <circle cx="8" cy="18" r="2" strokeWidth="2" />
            <circle cx="16" cy="18" r="2" strokeWidth="2" />
            <line x1="8" y1="10" x2="16" y2="10" strokeWidth="2" />
          </svg>
          <span className="text-sm font-semibold text-white">
            Lines
          </span>
          {selectedLines.size < busLines.length && (
            <span className="bg-white/30 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center backdrop-blur-sm">
              {selectedLines.size}
            </span>
          )}
        </button>

        {/* Mobile Drawer - Rendered via Portal to avoid stacking context issues */}
        {mounted && isOpen && typeof document !== 'undefined' && document.body && createPortal(
          <>
            {/* Dark Overlay - covers entire screen, below drawer */}
            <div
              className="fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 ease-out"
              onClick={() => setIsOpen(false)}
              style={{
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            />
            {/* Left Drawer - slides in from left, above overlay and header/nav */}
            <div 
              className="fixed left-0 bg-white shadow-2xl z-[2001] transition-transform duration-300 ease-out flex flex-col"
              style={{
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                // Full height drawer
                top: 0,
                bottom: 0,
                height: '100%',
                // Drawer width - responsive with max constraint
                width: '85vw',
                maxWidth: '320px',
                // Rounded corners only on right side (proper drawer style)
                borderTopRightRadius: '1rem', // rounded-r-2xl
                borderBottomRightRadius: '1rem',
                // No rounded corners on left (touches edge)
                borderTopLeftRadius: '0',
                borderBottomLeftRadius: '0',
                // Ensure solid background
                backgroundColor: '#ffffff',
                // Internal scrolling
                overflow: 'hidden',
              }}
            >
              <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-[var(--muted)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[var(--primary-foreground)]">Bus Lines</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onSelectAll}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={onDeselectAll}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {[...busLines]
                    .sort((a, b) => {
                      // Sort by number (handle numeric and alphanumeric like "1", "1a", "3", "3a")
                      const numA = parseInt(a.number) || 0;
                      const numB = parseInt(b.number) || 0;
                      if (numA !== numB) {
                        return numA - numB;
                      }
                      // If numbers are equal, sort by letter (e.g., "1" before "1a")
                      const letterA = a.number.replace(/^\d+/, '') || '';
                      const letterB = b.number.replace(/^\d+/, '') || '';
                      return letterA.localeCompare(letterB);
                    })
                    .map((line) => {
                    const isSelected = selectedLines.has(line.id);
                    return (
                      <button
                        key={line.id}
                        onClick={() => onToggleLine(line.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-gray-300/40 focus:ring-offset-2 ${
                          isSelected
                            ? 'border-[rgba(0,0,0,0.06)] bg-[#FDF2D8] text-gray-700'
                            : 'border-[rgba(0,0,0,0.06)] bg-[#FFF8E8] text-gray-700 hover:bg-[#F5DEE0]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-gray-400 bg-gray-400'
                              : 'border-gray-300 bg-transparent'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: line.color }}
                        >
                          {line.number}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm text-gray-900">{line.name}</div>
                          <div className="text-xs text-gray-500">Line {line.number}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>

      {/* Desktop: Horizontal Filter Bar */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Filter by Lines</h3>
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="px-3 py-1 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
              All
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...busLines]
            .sort((a, b) => {
              // Sort by number (handle numeric and alphanumeric like "1", "1a", "3", "3a")
              const numA = parseInt(a.number) || 0;
              const numB = parseInt(b.number) || 0;
              if (numA !== numB) {
                return numA - numB;
              }
              // If numbers are equal, sort by letter (e.g., "1" before "1a")
              const letterA = a.number.replace(/^\d+/, '') || '';
              const letterB = b.number.replace(/^\d+/, '') || '';
              return letterA.localeCompare(letterB);
            })
            .map((line) => {
            const isSelected = selectedLines.has(line.id);
            return (
              <button
                key={line.id}
                onClick={() => onToggleLine(line.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-gray-300/40 focus:ring-offset-2 ${
                  isSelected
                    ? 'border-[rgba(0,0,0,0.06)] bg-[#FDF2D8] text-gray-700'
                    : 'border-[rgba(0,0,0,0.06)] bg-[#FFF8E8] text-gray-700 hover:bg-[#F5DEE0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-gray-400 bg-gray-400'
                      : 'border-gray-300 bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: line.color }}
                >
                  {line.number}
                </div>
                <span className="text-sm font-medium text-gray-700">{line.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
