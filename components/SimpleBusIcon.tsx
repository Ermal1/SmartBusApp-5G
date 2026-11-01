'use client';

interface SimpleBusIconProps {
  className?: string;
}

export default function SimpleBusIcon({ className = '' }: SimpleBusIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bus Body - Yellow */}
      <rect x="20" y="40" width="160" height="80" rx="8" fill="#FFC107" stroke="#FFB300" strokeWidth="2" />
      
      {/* Windows Row 1 */}
      <rect x="30" y="50" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="60" y="50" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="90" y="50" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="120" y="50" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      
      {/* Windows Row 2 */}
      <rect x="30" y="75" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="60" y="75" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="90" y="75" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      <rect x="120" y="75" width="25" height="20" rx="3" fill="#DBEAFE" opacity="0.9" />
      
      {/* Front Windshield */}
      <rect x="20" y="40" width="15" height="80" rx="8 0 0 8" fill="rgba(255,255,255,0.3)" />
      
      {/* Door */}
      <rect x="165" y="55" width="15" height="50" rx="2" fill="rgba(0,0,0,0.2)" />
      <line x1="172.5" y1="55" x2="172.5" y2="105" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      
      {/* Wheels */}
      <circle cx="50" cy="125" r="12" fill="#1F2937" />
      <circle cx="50" cy="125" r="8" fill="#374151" />
      <circle cx="150" cy="125" r="12" fill="#1F2937" />
      <circle cx="150" cy="125" r="8" fill="#374151" />
      
      {/* Side Stripe */}
      <rect x="25" y="105" width="140" height="8" rx="4" fill="#FFB300" />
      
      {/* 5G Badge */}
      <circle cx="100" cy="25" r="18" fill="#3B82F6" />
      <circle cx="100" cy="25" r="15" fill="#2563EB" />
      <text x="100" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui, sans-serif">5G</text>
    </svg>
  );
}
