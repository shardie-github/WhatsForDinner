/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@nomad/config',
    '@nomad/data',
    '@nomad/adapters',
    '@nomad/ui',
    '@nomad/i18n',
    '@nomad/analytics',
  ],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
