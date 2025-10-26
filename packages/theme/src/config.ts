import { colors, spacing, borderRadius, typography, shadows, breakpoints } from './tokens';

export const themeConfig = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
} as const;

// Tailwind config for web
export const tailwindConfig = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/mobile/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
      },
      spacing,
      borderRadius,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      screens: breakpoints,
    },
  },
  plugins: [],
} as const;

// NativeWind config for mobile
export const nativeWindConfig = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../apps/mobile/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
      },
      spacing,
      borderRadius,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
    },
  },
  plugins: [],
} as const;