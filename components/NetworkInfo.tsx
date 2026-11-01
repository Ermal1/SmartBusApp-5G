'use client';

import { useState, useEffect } from 'react';
import { NetworkInfo as NetworkInfoType } from '@/types/performance';
import { getNetworkInfoWithOverride, setManualNetworkTag, getManualNetworkTag, getNetworkInfo, DetailedNetworkInfo } from '@/lib/network';

interface NetworkInfoProps {
  // This component is now read-only - just displays network info
  // No callback needed since it doesn't modify app behavior
}

export default function NetworkInfo({}: NetworkInfoProps) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoType>({ networkTag: 'Unknown' });
  const [detectedInfo, setDetectedInfo] = useState<DetailedNetworkInfo>({ networkTag: 'Unknown' });
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateNetworkInfo = () => {
      const detected = getNetworkInfo();
      const info = getNetworkInfoWithOverride();
      setDetectedInfo(detected);
      setNetworkInfo(info);
      
      // Show warning if manual override differs from detected Wi-Fi
      const manualTag = getManualNetworkTag();
      if (manualTag && detected.type === 'wifi' && manualTag !== 'Wi-Fi') {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };
    
    updateNetworkInfo();
    
    // Update periodically (network info can change)
    const interval = setInterval(updateNetworkInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTagChange = (tag: NetworkInfoType['networkTag']) => {
    setManualNetworkTag(tag);
    setNetworkInfo({ ...networkInfo, networkTag: tag });
    setIsEditing(false);
    
    // Check if warning should be shown
    if (detectedInfo.type === 'wifi' && tag !== 'Wi-Fi') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  // Format detected network label
  const getDetectedLabel = () => {
    if (detectedInfo.type === 'wifi') {
      return 'Wi-Fi';
    } else if (detectedInfo.type === 'cellular') {
      return `Cellular${detectedInfo.effectiveType ? ` (${detectedInfo.effectiveType})` : ''}`;
    } else if (detectedInfo.effectiveType) {
      return detectedInfo.effectiveType;
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Network label (auto-detected):</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">
            {getDetectedLabel()}
          </span>
          {detectedInfo.downlink && (
            <span className="text-xs text-gray-700">
              {detectedInfo.downlink.toFixed(1)}Mbps
            </span>
          )}
          {detectedInfo.rtt && (
            <span className="text-xs text-gray-700">
              RTT: {detectedInfo.rtt}ms
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Optional override:</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <select
              value={networkInfo.networkTag}
              onChange={(e) => handleTagChange(e.target.value as NetworkInfoType['networkTag'])}
              onBlur={() => setIsEditing(false)}
              className="px-2 py-1 text-xs font-semibold rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
              autoFocus
            >
              <option value="5G">5G</option>
              <option value="4G">4G</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Unknown">Unknown</option>
            </select>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                networkInfo.networkTag === '5G'
                  ? 'bg-green-100 text-green-800'
                  : networkInfo.networkTag === '4G'
                  ? 'bg-orange-100 text-orange-800'
                  : networkInfo.networkTag === 'Wi-Fi'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setIsEditing(true)}
              title="Click to manually override network label (for logging only)"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  networkInfo.networkTag === '5G' ? 'bg-green-500' : 
                  networkInfo.networkTag === '4G' ? 'bg-orange-500' :
                  networkInfo.networkTag === 'Wi-Fi' ? 'bg-blue-500' : 'bg-gray-500'
                }`}
              ></div>
              <span>{networkInfo.networkTag}</span>
            </div>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
          This does not change your network connection. Switch network in phone settings.
        </div>
      )}
    </div>
  );
}
