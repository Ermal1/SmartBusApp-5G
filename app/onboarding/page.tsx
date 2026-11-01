'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingCarousel from '@/components/OnboardingCarousel';

const onboardingScreens = [
  {
    image: '/2d329b557853b93fd54472e593922671-Photoroom.png',
    title: 'Welcome to SmartBus 5G',
    description: 'Track buses in real-time across Prishtina with ultra-low latency updates powered by 5G technology.',
    features: [
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        title: 'Live Tracking',
        subtitle: 'Real-time bus locations',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Accurate ETA',
        subtitle: 'Precise arrival times',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        title: 'Smart Routes',
        subtitle: 'Optimized paths',
      },
    ],
  },
  {
    image: '/3bc30695291a96fa500e310da97b5f1b-Photoroom.png',
    title: 'Real-Time Tracking',
    description: 'Get live updates on bus locations, ETAs, and routes. Never miss your bus again.',
    features: [
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: 'Real-Time Updates',
        subtitle: 'Instant notifications',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        title: 'GPS Tracking',
        subtitle: 'Precise location data',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        title: 'Instant Alerts',
        subtitle: 'Stay informed',
      },
    ],
  },
  {
    image: '/cfb055d72157d6eb6b47006199e8e332 (1)-Photoroom.png',
    title: 'Start Your Journey',
    description: 'Explore routes, check schedules, and find the nearest bus stop to you.',
    features: [
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        title: 'Multiple Routes',
        subtitle: '16 active lines',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        title: 'Easy Navigation',
        subtitle: 'Simple interface',
      },
      {
        icon: (
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: '5G Powered',
        subtitle: 'Ultra-fast connectivity',
      },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingSeen', 'true');
    }
    router.push('/');
  };

  return <OnboardingCarousel screens={onboardingScreens} onComplete={handleComplete} />;
}
