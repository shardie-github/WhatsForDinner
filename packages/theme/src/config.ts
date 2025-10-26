import { colors, spacing, borderRadius, typography, shadows, breakpoints, zIndex, animation, layout } from './tokens';

export const themeConfig = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
  zIndex,
  animation,
  layout,
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
        brand: colors.brand,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        food: colors.food,
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
      zIndex,
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
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
        brand: colors.brand,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        food: colors.food,
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