'use client';

import Image from 'next/image';

interface AnimatedBusProps {
  className?: string;
}

export default function AnimatedBus({ className = '' }: AnimatedBusProps) {
  return (
    <div className={`relative ${className} w-full h-full`}>
      {/* Road element - full width, positioned at bottom, fixed */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full h-10 md:h-12 rounded-t-full z-0"
        style={{
          background: 'rgba(107, 114, 128, 0.08)',
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(107, 114, 128, 0.12) 24px, rgba(107, 114, 128, 0.12) 28px)',
        }}
        aria-hidden="true"
      />

      {/* Bus Image with horizontal movement animation - positioned to sit on road */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 animate-bus-drive w-full max-w-[280px] md:max-w-[320px]">
        <Image
          src="/original-aa2c70de67e797463c4d3af668a9d156-Photoroom.png"
          alt="SmartBus 5G"
          width={320}
          height={240}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* Subtle speed lines - very faint */}
      <div 
        className="absolute inset-0 opacity-0 animate-speed-lines pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-2/3 w-12 h-0.5 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent transform -translate-y-1/2 -rotate-12"></div>
        <div className="absolute right-1/4 top-2/3 w-10 h-0.5 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent transform -translate-y-1/2 rotate-12"></div>
      </div>
    </div>
  );
}
