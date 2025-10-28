// Next.js Cache Configuration
const nextConfig = {
  // Enable static optimization
  trailingSlash: false,
  
  // Enforce Prisma engine type
  env: {
    PRISMA_CLIENT_ENGINE_TYPE: 'wasm',
  },
  
  // Image optimization
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // Compression
  compress: true,
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@whats-for-dinner/ui'],
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    runtime: 'edge',
  },
  
  // Bundle optimization
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
