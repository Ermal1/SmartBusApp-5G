'use client';

import { ReactNode } from 'react';

interface MiniFeatureCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export default function MiniFeatureCard({ icon, title, subtitle }: MiniFeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl bg-[#F5DEE0] py-4 px-5 w-[100%] shadow-sm">
      {/* Horizontal layout: icon on left, text on right, left-aligned */}
      <div className="flex items-start gap-3 w-full text-left">
        {/* Icon - Left side, slightly top-aligned with text */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="flex items-center justify-center text-[var(--primary)]/70">
            {icon}
          </div>
        </div>

        {/* Text content - Right side, left-aligned */}
        <div className="flex-1 min-w-0">
          {/* Title - bold, single-line */}
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-0.5 truncate">
            {title}
          </h3>

          {/* Subtitle - smaller, lighter (lower opacity), max 1 line */}
          {subtitle && (
            <p className="text-xs text-gray-600 opacity-70 leading-snug line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
