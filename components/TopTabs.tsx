'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export type TabType = 'home' | 'map' | 'stats' | 'schedule' | 'profile';

interface TopTabsProps {
  activeTab?: TabType | null;
  onTabChange?: (tab: TabType) => void;
}

export default function TopTabs({ activeTab: propActiveTab, onTabChange }: TopTabsProps) {
  const pathname = usePathname();
  
  // Use pathname if propActiveTab is not provided
  const getActiveTab = (): TabType | null => {
    if (propActiveTab !== undefined && propActiveTab !== null) {
      return propActiveTab;
    }
    if (pathname === '/') return 'home';
    if (pathname === '/map') return 'map';
    if (pathname === '/stats') return 'stats';
    if (pathname === '/schedule') return 'schedule';
    if (pathname === '/about') return 'profile';
    return null;
  };
  
  const activeTab = getActiveTab();
  const tabs: { id: TabType | 'performance'; label: string; icon: ReactElement; href?: string }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'map',
      label: 'Map',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'About App',
      href: '/about',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'performance' as TabType,
      label: 'Performance Test',
      href: '/performance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="hidden lg:flex bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const href = tab.href || (tab.id === 'home' ? '/' : `/${tab.id}`);
            
            return (
              <Link
                key={tab.id}
                href={href}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${
                  isActive
                    ? 'text-[var(--brand-yellow-700)] border-[var(--brand-yellow)] bg-[var(--brand-yellow-50)]'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
