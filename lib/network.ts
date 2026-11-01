import { NetworkInfo } from '@/types/performance';

/**
 * Get network information from browser APIs
 * Detects type (wifi/cellular), effectiveType (4g/3g/2g), downlink, and rtt
 */
export interface DetailedNetworkInfo extends NetworkInfo {
  type?: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
}

export function getNetworkInfo(): DetailedNetworkInfo {
  // Ensure we're on the client side
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      networkTag: 'Unknown',
      type: 'unknown',
    };
  }

  // Try to use Network Information API (available in Chrome/Edge, not iOS Safari)
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const type = connection.type; // 'wifi', 'cellular', 'ethernet', 'none', etc.
    const effectiveType = connection.effectiveType; // '4g', '3g', 'slow-2g', etc.
    const downlink = connection.downlink; // Mbps
    const rtt = connection.rtt; // ms
    
    // Determine network type label
    let networkTag: NetworkInfo['networkTag'] = 'Unknown';
    
    if (type === 'wifi' || type === 'ethernet') {
      networkTag = 'Wi-Fi';
    } else if (type === 'cellular') {
      if (effectiveType === '4g' && downlink && downlink > 10) {
        networkTag = '5G'; // Likely 5G if very high downlink
      } else if (effectiveType === '4g') {
        networkTag = '4G';
      } else if (effectiveType === '3g' || effectiveType === '2g' || effectiveType === 'slow-2g') {
        networkTag = '4G'; // Treat older networks as 4G category
      } else {
        networkTag = '4G'; // Default for cellular
      }
    } else {
      // Try to infer from effectiveType if type is not available
      if (effectiveType === '4g' && downlink && downlink > 10) {
        networkTag = '5G';
      } else if (effectiveType === '4g') {
        networkTag = '4G';
      } else {
        networkTag = '4G'; // Default
      }
    }
    
    return {
      networkTag,
      type: type as any,
      effectiveType,
      downlink,
      rtt,
    };
  }
  
  // Fallback: try to detect Wi-Fi from user agent or other hints
  // This is limited but better than nothing
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isLikelyWifi = userAgent.includes('wifi') || (!userAgent.includes('mobile') && !userAgent.includes('android'));
  
  return {
    networkTag: isLikelyWifi ? 'Wi-Fi' : 'Unknown',
    type: 'unknown',
  };
}

/**
 * Store manually selected network tag in localStorage
 */
export function setManualNetworkTag(tag: NetworkInfo['networkTag']): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('networkTag', tag);
  }
}

/**
 * Get manually selected network tag from localStorage
 */
export function getManualNetworkTag(): NetworkInfo['networkTag'] | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('networkTag');
    if (stored && ['5G', '4G', 'Wi-Fi', 'Unknown'].includes(stored)) {
      return stored as NetworkInfo['networkTag'];
    }
  }
  return null;
}

/**
 * Get network info with manual override support
 */
export function getNetworkInfoWithOverride(): NetworkInfo {
  const manualTag = getManualNetworkTag();
  if (manualTag) {
    return {
      networkTag: manualTag,
    };
  }
  
  const detected = getNetworkInfo();
  
  // If detected as Unknown, check if we're on Wi-Fi
  if (detected.networkTag === 'Unknown') {
    // Simple heuristic: if on Wi-Fi, connection.type might be 'wifi' (not standard)
    // For now, return Unknown and let UI handle it
    return detected;
  }
  
  return detected;
}
