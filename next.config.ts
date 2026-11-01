import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression për responses më të shpejta
  compress: true,
  
  // Fshi ikonën e Next.js
  poweredByHeader: false,
  
  // Optimizime për 5G
  experimental: {
    // Enable HTTP/3 support
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Headers për caching dhe compression
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
