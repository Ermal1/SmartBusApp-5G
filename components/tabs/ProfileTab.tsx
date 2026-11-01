'use client';

import Link from 'next/link';
import NetworkInfo from '@/components/NetworkInfo';

interface ProfileTabProps {
  networkMode?: never; // No longer used, kept for backward compatibility
  onNetworkModeChange?: never; // No longer used, kept for backward compatibility
}

export default function ProfileTab({}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Network Mode */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--primary-soft)] rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Network Information
          </h3>
        </div>
        <NetworkInfo />
        <p className="text-sm text-gray-600 mt-3">
          Network information is detected automatically. You can manually override the network tag by clicking on it. This tag is used for performance measurement logging only and does not modify data.
        </p>
      </div>

      {/* About Link */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            More Information
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Learn more about 5G technology and how the SmartBus application works.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-sm"
        >
          <span>Read more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Project Info - Enhanced */}
      <div className="bg-[var(--muted)] rounded-xl border-2 border-[var(--primary)]/20 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--primary-foreground)]">
            Course Project
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="bg-white/60 rounded-lg p-3 border border-[var(--primary)]/20">
            <p className="font-semibold text-gray-900 mb-1">Course</p>
            <p className="text-gray-700">Advanced 5G Technologies</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-[var(--primary)]/20">
            <p className="font-semibold text-gray-900 mb-1">Authors</p>
            <p className="text-gray-700">Vesa Ademi & Natyra Arifi</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-[var(--primary)]/20">
            <p className="font-semibold text-gray-900 mb-1">Topic</p>
            <p className="text-gray-700">Development of a 5G network application to assist bus passengers in Prishtina</p>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-500">
          SmartBus 5G Prishtina v1.0.0
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Powered by Next.js 14 & Google Maps API
        </p>
      </div>
    </div>
  );
}
