import type { NextConfig } from 'next';
// @ts-ignore
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: [
    '@whats-for-dinner/ui',
    '@whats-for-dinner/utils',
    '@whats-for-dinner/theme',
    '@whats-for-dinner/config',
  ],
  experimental: {
    optimizePackageImports: ['@whats-for-dinner/ui'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true,
  distDir: 'dist',
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
