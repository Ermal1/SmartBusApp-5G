'use client';

import AppHeader from '@/components/AppHeader';
import BottomNavigation from '@/components/BottomNavigation';
import TopTabs from '@/components/TopTabs';

export default function About() {
  return (
    <>
      <AppHeader />
      <TopTabs />
      <div className="min-h-screen bg-[var(--brand-bg)] pb-20 md:pb-8">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="space-y-6">
            {/* How ETA and Delay Calculation Works */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                How ETA and Delay Calculation Works
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm md:text-base leading-relaxed">
                  SmartBus 5G Prishtina calculates Estimated Time of Arrival (ETA) and delays based on real-time bus GPS positions received from the bus data source.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2 text-base">
                    GPS Position Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                    <li>
                      Bus GPS positions (latitude/longitude) are received from the real-time data feed
                    </li>
                    <li>
                      Positions are updated continuously as buses move along their routes
                    </li>
                    <li>
                      The distance between the bus and the destination stop is calculated using the{' '}
                      <strong>Haversine formula</strong>, which computes the great-circle distance
                      between two points on Earth
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-semibold text-green-900 mb-2 text-base">
                    ETA Calculation
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    <li>
                      ETA is computed based on the distance to the selected stop and the bus's current speed
                    </li>
                    <li>
                      Formula: <code className="bg-white/60 px-1 rounded">ETA (minutes) = Distance (km) / Speed (km/h) × 60</code>
                    </li>
                    <li>
                      Speed is derived from GPS position updates or provided by the bus data source
                    </li>
                    <li>
                      ETAs are updated in real-time as bus positions change
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <h3 className="font-semibold text-amber-900 mb-2 text-base">
                    Delay Calculation
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                    <li>
                      Delay is computed as the deviation from the scheduled/expected arrival time
                    </li>
                    <li>
                      The system compares the calculated ETA with the planned schedule to determine if a bus is on time, slightly delayed, or heavily delayed
                    </li>
                    <li>
                      Delay status is displayed in real-time on bus cards and the map
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Network Detection & Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Network Detection & Performance Testing
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm md:text-base leading-relaxed">
                  The application uses real network conditions from your device connection (Wi-Fi, 4G, or 5G when available) and measures performance through the Performance Test page.
                </p>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                  <h3 className="font-semibold text-indigo-900 mb-2 text-base">
                    Auto-Detected Network
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-indigo-800">
                    <li>
                      When supported by your browser, the app automatically detects your network type (Wi-Fi, 4G, 5G)
                    </li>
                    <li>
                      Network information is gathered using the{' '}
                      <code className="bg-white/60 px-1 rounded">navigator.connection</code> API
                    </li>
                    <li>
                      Detected network type, effective type, downlink speed, and RTT (round-trip time) are displayed when available
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h3 className="font-semibold text-purple-900 mb-2 text-base">
                    Network Tag (Manual Override)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                    <li>
                      You can manually override the network label for logging and performance testing purposes
                    </li>
                    <li>
                      <strong>Important:</strong> This override only changes the label used for logging and performance measurements. It does not change your actual network connection.
                    </li>
                    <li>
                      To switch between Wi-Fi, 4G, or 5G, you must change your network connection in your device settings
                    </li>
                    <li>
                      The manual tag is useful for comparing performance between different network types during testing
                    </li>
                  </ul>
                </div>

                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                  <h3 className="font-semibold text-teal-900 mb-2 text-base">
                    Performance Testing
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-teal-800">
                    <li>
                      Use the Performance Test page to measure and compare network performance
                    </li>
                    <li>
                      Test sessions can be tagged as "4G" or "5G" for comparison
                    </li>
                    <li>
                      Metrics include client fetch duration, backend processing time, response size, and render time
                    </li>
                    <li>
                      Results can be exported as CSV or JSON for analysis
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Google Maps Integration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Google Maps Integration
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm md:text-base leading-relaxed">
                  The application uses the Google Maps JavaScript API to visualize bus routes, stops, and positions in real-time.
                </p>

                <div className="bg-slate-50 border border-gray-200 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2 text-base">
                    Map Features
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>Route Visualization:</strong> When a bus is selected, the full route is displayed as a colored polyline connecting all stops in order
                    </li>
                    <li>
                      <strong>Stop Markers:</strong> Bus stops are shown as markers along routes, with the next stop highlighted
                    </li>
                    <li>
                      <strong>Bus Icons:</strong> Custom bus icons with route numbers rotate toward their destination
                    </li>
                    <li>
                      <strong>Real-Time Updates:</strong> Bus positions update continuously as GPS data is received
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Mapping */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Delay Status Mapping
              </h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-28 font-semibold text-sm">On Time:</span>
                  <span className="text-sm">Delay ≤ 1 minute</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block w-28 font-semibold text-sm">Slight Delay:</span>
                  <span className="text-sm">Delay 1-5 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block w-28 font-semibold text-sm">Heavy Delay:</span>
                  <span className="text-sm">Delay &gt; 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="bg-white/60 rounded-xl border border-gray-200/50 p-6 text-center">
              <p className="text-xs text-gray-600 mb-2">
                Advanced 5G Technologies Course Project
              </p>
              <p className="text-xs text-gray-600">
                Developed by Vesa Ademi & Natyra Arifi
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNavigation />
    </>
  );
}
