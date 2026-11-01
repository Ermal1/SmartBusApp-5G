'use client';

export type NetworkMode = '4G' | '5G';

interface NetworkModeToggleProps {
  mode: NetworkMode;
  onModeChange: (mode: NetworkMode) => void;
}

export default function NetworkModeToggle({
  mode,
  onModeChange,
}: NetworkModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 font-medium">Network Mode:</span>
      <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
        <button
          onClick={() => onModeChange('4G')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            mode === '4G'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          4G
        </button>
        <button
          onClick={() => onModeChange('5G')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            mode === '5G'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          5G
        </button>
      </div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
          mode === '5G'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            mode === '5G' ? 'bg-green-500' : 'bg-orange-500'
          } ${mode === '5G' ? 'animate-pulse' : ''}`}
        ></div>
        <span>{mode} Active</span>
      </div>
    </div>
  );
}
