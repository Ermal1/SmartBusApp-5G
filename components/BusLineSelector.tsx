'use client';

import { busLines } from '@/data/routes';

interface BusLineSelectorProps {
  selectedLineId: string | null;
  onLineSelect: (lineId: string | null) => void;
}

export default function BusLineSelector({
  selectedLineId,
  onLineSelect,
}: BusLineSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Filter by Line</span>
      </label>
      
      <div className="flex flex-wrap gap-2">
        {/* "All" Button */}
        <button
          onClick={() => onLineSelect(null)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            selectedLineId === null
              ? 'bg-[var(--primary)] text-white shadow-md ring-2 ring-[var(--primary)]/40'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {/* Buttons for each line */}
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
          const isSelected = selectedLineId === line.id;
          return (
            <button
              key={line.id}
              onClick={() => onLineSelect(isSelected ? null : line.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'text-white shadow-md ring-2 ring-opacity-50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: isSelected ? line.color : undefined,
                ...(isSelected && line.color ? { '--tw-ring-color': line.color } : {}),
              } as React.CSSProperties}
            >
              <span className="font-bold">Line {line.number}</span>
              <span className="text-xs opacity-90">({line.name})</span>
            </button>
          );
        })}
      </div>
      
      {selectedLineId && (
        <div className="mt-3 text-xs text-gray-600">
          <span>Showing only buses for the selected line</span>
        </div>
      )}
    </div>
  );
}
