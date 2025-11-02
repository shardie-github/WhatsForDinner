import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ["@whats-for-dinner/ui", "@whats-for-dinner/utils", "@whats-for-dinner/theme", "@whats-for-dinner/config"],
  experimental: {
    optimizePackageImports: ["@whats-for-dinner/ui"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  trailingSlash: true,
  distDir: 'dist',
  turbopack: {},
  // Mobile performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

// Wrap with Sentry if DSN is configured
const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;

export default configWithSentry;
