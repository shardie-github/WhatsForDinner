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
  },
  trailingSlash: true,
  distDir: 'dist',
  turbopack: {},
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
