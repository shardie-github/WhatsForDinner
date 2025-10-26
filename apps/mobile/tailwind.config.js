const { nativeWindConfig } = require('@whats-for-dinner/theme');

module.exports = {
  ...nativeWindConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};