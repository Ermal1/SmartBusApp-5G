'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import BusLineSelector from '@/components/BusLineSelector';
import BusList from '@/components/BusList';
import AnimatedBus from '@/components/AnimatedBus';
// Removed NetworkModeToggle - no longer using network mode toggle
import AnalyticsSummary from '@/components/AnalyticsSummary';
import AlertsPanel from '@/components/AlertsPanel';
import WeeklyStatsCard from '@/components/WeeklyStatsCard';
import SpeedHeatmap from '@/components/SpeedHeatmap';
import SchedulePanel from '@/components/SchedulePanel';
import { Bus, BusStop } from '@/types';
import { getBusLineById, mockAlerts } from '@/data/routes';
import { WeeklyStats } from '@/lib/weeklyStats';

interface HomeTabProps {
  selectedStopId: string | null;
  selectedLineId: string | null;
  onStopSelect: (stopId: string | null) => void;
  onLineSelect: (lineId: string | null) => void;
  buses: Bus[];
  filteredBuses: Bus[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus | null) => void;
  loading: boolean;
  lastUpdate: Date | null;
  weeklyStats: WeeklyStats | null;
  dataSource: 'external' | 'mock' | null;
  selectedStop: BusStop | undefined;
}

export default function HomeTab({
  selectedStopId,
  selectedLineId,
  onLineSelect,
  buses,
  filteredBuses,
  selectedBus,
  onBusSelect,
  loading,
  // Removed networkMode and onNetworkModeChange props
  lastUpdate,
  weeklyStats,
  dataSource,
  selectedStop,
}: HomeTabProps) {
  const router = useRouter();
  
  // HomeTab should always show the welcome/empty state
  // Users should go to MapTab to select a bus stop
  return (
    <div className="space-y-6">
      {/* Hero Section with Yellow Theme */}
      <div className="pt-4 pb-6 md:pt-6 md:pb-8">
        {/* Main Hero Card - Yellow Theme */}
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 shadow-lg border-2 border-[var(--brand-yellow-100)] overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Left: Text Content */}
            <div className="flex-1 text-left md:text-left">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 leading-tight text-[var(--brand-black)]">
                Track Buses
                <br />
                <span className="text-[var(--brand-yellow-600)]">In Real-Time</span>
              </h1>

              {/* Description */}
              <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
                Get live updates on bus locations and ETAs across Prishtina powered by 5G technology.
              </p>

              {/* CTA Button */}
              <button 
                onClick={() => router.push('/map')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-yellow)] text-white rounded-xl font-bold text-sm md:text-base hover:bg-[var(--brand-yellow-600)] transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View Map
              </button>
            </div>

            {/* Right: Bus Illustration */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <div className="relative w-full md:w-64 lg:w-80 h-52 md:h-60 lg:h-64">
                {/* Animated Bus with Road */}
                <AnimatedBus className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {/* Yellow - Ultra-low Latency */}
          <div className="bg-[rgba(244,176,0,0.12)] border border-[rgba(244,176,0,0.25)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(244,176,0,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(244,176,0,0.3)]">
                <svg className="w-5 h-5 text-[#F4B000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#F4B000] mb-1">1-5ms</div>
            <div className="text-xs md:text-sm text-slate-600 font-medium">Ultra-low Latency</div>
          </div>
          
          {/* Green - Active Bus Lines */}
          <div className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(34,197,94,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(34,197,94,0.3)]">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#22C55E] mb-1">16</div>
            <div className="text-xs md:text-sm text-slate-600 font-medium">Active Bus Lines</div>
          </div>
          
          {/* Purple - Live Tracking */}
          <div className="bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(168,85,247,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(168,85,247,0.3)]">
                <svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#A855F7] mb-1">24/7</div>
            <div className="text-xs md:text-sm text-slate-600 font-medium">Live Tracking</div>
          </div>
          
          {/* Orange - Real Time Updates */}
          <div className="bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.25)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(249,115,22,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(249,115,22,0.3)]">
                <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#F97316] mb-1">Real</div>
            <div className="text-xs md:text-sm text-slate-600 font-medium">Time Updates</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      {/* 
        Visual refresh: Premium soft-tint cards with subtle borders and shadows.
        Color approach: Each card uses a very light tint (10-14% opacity) for background,
        slightly stronger border (20-30% opacity), and soft icon container with ring.
        Tune opacity values in className to adjust visual weight if needed.
      */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Yellow/Orange - Ultra-low Latency */}
          <div className="bg-[rgba(244,176,0,0.12)] border border-[rgba(244,176,0,0.25)] rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[rgba(244,176,0,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(244,176,0,0.3)]">
                <svg className="w-6 h-6 text-[#F4B000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Ultra-low Latency</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-none">1-5ms data updates for instant information delivery powered by 5G networks</p>
              </div>
            </div>
          </div>

          {/* Green - Real-time IoT Data */}
          <div className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[rgba(34,197,94,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(34,197,94,0.3)]">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Real-time IoT Data</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-none">Live sensor data streaming from buses via 5G networks with instant updates</p>
              </div>
            </div>
          </div>

          {/* Purple - GPS Tracking */}
          <div className="bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[rgba(168,85,247,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(168,85,247,0.3)]">
                <svg className="w-6 h-6 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1">GPS Tracking</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-none">Precise location tracking and real-time passenger counting for accurate ETAs</p>
              </div>
            </div>
          </div>

          {/* Orange - Instant Updates */}
          <div className="bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.25)] rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[rgba(249,115,22,0.2)] rounded-xl flex items-center justify-center ring-1 ring-[rgba(249,115,22,0.3)]">
                <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Instant Updates</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-none">Real-time status alerts and delay notifications to keep you informed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About / Credits Section */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-6">
        <div className="bg-white/60 rounded-xl border border-gray-200/50 p-4 text-center">
          <p className="text-xs text-gray-600 mb-2">
            Advanced 5G Technologies Course Project · Developed by Vesa Ademi & Natyra Arifi
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-xs text-[var(--brand-yellow-600)] hover:text-[var(--brand-yellow-700)] font-medium transition-colors"
          >
            <span>Learn more about how ETA and delays are calculated</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
