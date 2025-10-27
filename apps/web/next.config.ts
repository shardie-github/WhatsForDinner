import type { NextConfig } from 'next';

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

export default nextConfig;
