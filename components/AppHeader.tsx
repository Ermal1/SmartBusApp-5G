'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getNetworkInfo, getNetworkInfoWithOverride } from '@/lib/network';
import MobilePillHeader from '@/components/MobilePillHeader';

export default function AppHeader() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [networkLabel, setNetworkLabel] = useState<string>('Unknown');
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkInfo>>({
    networkTag: 'Unknown',
  });

  // Format network label for display (use detected, not manual override)
  const formatNetworkLabel = (detected: ReturnType<typeof getNetworkInfo>): string => {
    // First check networkTag (this is what getNetworkInfo() calculates)
    if (detected.networkTag === '5G' || detected.networkTag === '4G') {
      return detected.networkTag;
    } else if (detected.networkTag === 'Wi-Fi') {
      return 'Wi-Fi';
    }
    
    // Then check type for fallback
    if (detected.type === 'wifi' || detected.type === 'ethernet') {
      return 'Wi-Fi';
    } else if (detected.type === 'cellular') {
      if (detected.effectiveType === '4g' && detected.downlink && detected.downlink > 10) {
        return '5G';
      } else if (detected.effectiveType) {
        return detected.effectiveType.toUpperCase();
      }
      return 'Cellular';
    }
    
    // Final fallback
    return detected.networkTag !== 'Unknown' ? detected.networkTag : 'Unknown';
  };

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update network info (use detected, not manual override for header)
    const updateNetworkInfo = () => {
      const detected = getNetworkInfo();
      setNetworkInfo(detected);
      setNetworkLabel(formatNetworkLabel(detected));
    };
    
    updateNetworkInfo();
    const interval = setInterval(updateNetworkInfo, 5000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Get mobile header title based on route
  const getMobileHeaderTitle = () => {
    const route = pathname || '';
    
    // Home: show full app name
    if (route === '/' || route === '') {
      return 'SmartBus 5G Prishtina';
    }
    
    // Map route to display title (Option A: simple tab names)
    if (route === '/map') {
      return 'Map';
    } else if (route === '/stats') {
      return 'Statistics';
    } else if (route === '/schedule') {
      return 'Schedule';
    } else if (route === '/about') {
      return 'About';
    } else if (route === '/performance') {
      return 'Performance';
    }
    
    // Fallback: extract route name
    const routeName = route.split('/').pop() || '';
    return routeName.charAt(0).toUpperCase() + routeName.slice(1);
  };

  const isHomePage = pathname === '/' || pathname === '';

  return (
    <header className="md:bg-white md:border-b md:border-[var(--primary)]/15">
      {/* Warm accent line at bottom - Desktop only */}
      <div className="hidden md:block h-0.5 bg-gradient-to-r from-[#FFF8E8] via-[var(--primary)]/30 to-[#FFF8E8]"></div>
      
      {/* Mobile: Reusable Pill Header */}
      <MobilePillHeader title={getMobileHeaderTitle()} isHome={isHomePage} />

      {/* Desktop: Standard header layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: App Icon + Title */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Bus Icon - More subtle */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF8E8] rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="10" rx="2" fill="currentColor" opacity="0.1"/>
                <rect x="3" y="8" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <rect x="9" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <rect x="13" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <circle cx="7" cy="20" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="17" cy="20" r="2" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            
            {/* App Title - Softer typography */}
            <div>
              <h1 className="text-sm md:text-lg lg:text-xl font-bold text-gray-800 leading-tight">
                SmartBus 5G Prishtina
              </h1>
              {pathname && pathname !== '/' && (
                <p className="text-xs md:text-sm text-gray-600 font-medium hidden md:block mt-0.5">
                  {pathname === '/stats' ? 'Statistics & Analytics' :
                   pathname === '/schedule' ? 'Schedule' :
                   pathname === '/about' ? 'About App' :
                   pathname === '/map' ? 'Map' :
                   pathname === '/performance' ? 'Performance Test' :
                   (() => {
                     const lastSegment = pathname.split('/').pop();
                     return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : '';
                   })()}
                </p>
              )}
            </div>
          </div>

          {/* Right: Connected Pill - Softer green */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border transition-all ${
                isOnline
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                } ${isOnline ? 'animate-pulse' : ''}`}
              ></div>
              <span className={`text-xs font-semibold ${
                isOnline ? 'text-green-700' : 'text-red-700'
              }`}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
              <span className={`text-[10px] font-medium hidden sm:inline ${
                isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {networkLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
