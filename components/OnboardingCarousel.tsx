'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import MiniFeatureCard from './MiniFeatureCard';

interface OnboardingFeature {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface OnboardingScreen {
  image: string;
  title: string;
  description: string;
  features?: OnboardingFeature[];
}

interface OnboardingCarouselProps {
  screens: OnboardingScreen[];
  onComplete: () => void;
}

export default function OnboardingCarousel({ screens, onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100; // Minimum swipe distance
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < screens.length - 1) {
        // Swipe left - go to next
        setCurrentIndex(currentIndex + 1);
      }
    }
    setTranslateX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < screens.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleSkip = () => {
    onComplete();
  };

  const handleGetStarted = () => {
    onComplete();
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const baseTranslate = -currentIndex * 100;
  const totalTranslate = baseTranslate + (translateX / (carouselRef.current?.offsetWidth || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--muted)] via-[var(--brand-bg)] to-[var(--secondary)]/30 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Skip button - top right (text only, no background/border) */}
      {currentIndex < screens.length - 1 && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-50 px-4 py-2 text-sm font-medium text-[var(--primary)]/70 hover:text-[var(--primary)] hover:underline transition-all"
        >
          Skip
        </button>
      )}

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${totalTranslate}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {screens.map((screen, index) => (
            <div
              key={index}
              className="min-w-full h-full flex flex-col items-center justify-center px-6 py-8"
            >
              {/* Image - transparent background */}
              <div className="flex-shrink-0 mb-8 w-full max-w-sm px-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={screen.image}
                    alt={screen.title}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl w-full px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4" style={{ color: '#1F2937' }}>
                  {screen.title}
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
                  {screen.description}
                </p>
                
                {/* Mini Feature Cards - Centered, mobile-first layout */}
                {screen.features && screen.features.length > 0 && (
                  <div className="w-full flex flex-col md:flex-row gap-4 justify-center items-center">
                    {screen.features.map((feature, featureIndex) => (
                      <MiniFeatureCard
                        key={featureIndex}
                        icon={feature.icon}
                        title={feature.title}
                        subtitle={feature.subtitle}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 pb-8 px-6">
        {screens.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-[var(--primary)] w-8'
                : 'bg-[var(--primary)]/30 hover:bg-[var(--primary)]/50 w-2'
            }`}
            aria-label={`Go to screen ${index + 1}`}
          />
        ))}
      </div>

      {/* Get Started Button (only on last screen) */}
      {currentIndex === screens.length - 1 && (
        <div className="pb-8 px-6 flex justify-center" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleGetStarted}
            className="w-full max-w-sm md:max-w-md px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2"
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}
