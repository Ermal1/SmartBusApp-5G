'use client';

import { ReactNode } from 'react';
import AppHeader from '@/components/AppHeader';
import BottomNavigation from '@/components/BottomNavigation';
import TopTabs from '@/components/TopTabs';

interface SharedPageLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function SharedPageLayout({ children, showFooter = true }: SharedPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] pb-16 lg:pb-0">
      <AppHeader />
      <TopTabs />
      
      <main className="max-w-7xl mx-auto px-4 md:px-2 pt-4 md:pt-6 pb-8 md:pb-8 lg:pb-8">
        {children}
      </main>

      <BottomNavigation />

      {showFooter && (
        <footer className="mt-6 md:mt-8 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm text-gray-600 text-center">
              Advanced 5G Technologies Course Project · Developed by Vesa Ademi & Natyra Arifi
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              SmartBus 5G Prishtina is a demonstration app for real-time bus tracking and ETA updates. Performance can be tested on real networks (4G/5G) and exported for analysis.{' '}
              <a href="/about" className="text-blue-600 hover:underline">
                Learn more about how ETA and delays are calculated.
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
