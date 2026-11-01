'use client';

import { useRouter } from 'next/navigation';

interface MobilePillHeaderProps {
  title: string;
  isHome?: boolean;
}

export default function MobilePillHeader({ title, isHome = false }: MobilePillHeaderProps) {
  const router = useRouter();

  return (
    <div 
      className="md:hidden sticky top-0 z-50 bg-[#FFF8E8] px-4 shadow-sm relative"
      style={{
        borderRadius: '0 0 28px 28px',
        paddingTop: `calc(1.5rem + env(safe-area-inset-top))`,
        paddingBottom: '1.5rem',
        minHeight: '80px',
      }}
    >
      <div className="flex items-center relative">
        {/* Left: Clickable Bus Icon */}
        <div className="flex-shrink-0 w-10 h-10 z-10">
          <button
            onClick={() => router.push('/')}
            className="w-full h-full flex items-center justify-center"
            aria-label="Go to Home"
          >
            <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="10" rx="2" fill="currentColor" opacity="0.1"/>
                <rect x="3" y="8" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <rect x="9" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <rect x="13" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
                <circle cx="7" cy="20" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="17" cy="20" r="2" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
          </button>
        </div>
        
        {/* Center: Title - Absolutely positioned for true centering */}
        <div className="absolute left-1/2 -translate-x-1/2 z-0 flex items-center gap-1.5 whitespace-nowrap">
          {!isHome ? (
            <>
              <span className="text-gray-800 leading-tight whitespace-nowrap font-semibold" style={{ fontSize: '16px' }}>
                SmartBus
              </span>
              <span className="text-gray-600 opacity-60" style={{ fontSize: '16px' }}>
                /
              </span>
              <span className="text-gray-800 leading-tight whitespace-nowrap font-semibold" style={{ fontSize: '16px' }}>
                {title}
              </span>
            </>
          ) : (
            <h1 className="text-gray-800 leading-tight whitespace-nowrap font-semibold" style={{ fontSize: '16px' }}>
              {title}
            </h1>
          )}
        </div>
        
        {/* Right: Empty spacer matching left width */}
        <div className="flex-shrink-0 w-10 h-10 z-10"></div>
      </div>
    </div>
  );
}
