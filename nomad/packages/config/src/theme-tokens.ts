export type ThemeMode = 'light' | 'dark';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | null;

export interface ColorPalette {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
}

export interface ThemeTokens {
  colors: ColorPalette;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
}

const baseSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

const baseBorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

const baseTypography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const lightTheme: ThemeTokens = {
  colors: {
    primary: '#10B981',
    primaryDark: '#059669',
    secondary: '#6366F1',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    divider: '#E5E7EB',
  },
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
  typography: baseTypography,
};

export const darkTheme: ThemeTokens = {
  colors: {
    primary: '#10B981',
    primaryDark: '#059669',
    secondary: '#818CF8',
    background: '#111827',
    surface: '#1F2937',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    divider: '#374151',
  },
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
  typography: baseTypography,
};

const seasonalAccents: Record<
  Season,
  { primary: string; secondary: string } | null
> = {
  spring: { primary: '#EC4899', secondary: '#F472B6' },
  summer: { primary: '#10B981', secondary: '#34D399' },
  fall: { primary: '#F59E0B', secondary: '#FBBF24' },
  winter: { primary: '#3B82F6', secondary: '#60A5FA' },
  null: null,
};

export function getSeasonalTheme(
  base: ThemeTokens,
  season: Season
): ThemeTokens {
  if (!season || !seasonalAccents[season]) {
    return base;
  }

  const accents = seasonalAccents[season]!;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: accents.primary,
      secondary: accents.secondary,
    },
  };
}

export function getThemeTokens(
  mode: ThemeMode,
  season: Season = null
): ThemeTokens {
  const base = mode === 'dark' ? darkTheme : lightTheme;
  return getSeasonalTheme(base, season);
}

// React Native color format (no #)
export function toRNColors(palette: ColorPalette): Record<string, string> {
  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [
      key,
      value.startsWith('#') ? value.slice(1) : value,
    ])
  );
}

// Web/Tailwind format
export function toWebColors(palette: ColorPalette): Record<string, string> {
  return palette;
}
