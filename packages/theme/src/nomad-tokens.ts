// Nomad Design Tokens - Extended Design System
// Customizable meal planner + health tracker + cooking inspiration + family communication

export const nomadColors = {
  // Primary Brand - Nomad (adventurous, warm, mobile)
  brand: {
    50: '#fef9ed',
    100: '#fef3db',
    200: '#fce5b7',
    300: '#facd82',
    400: '#f7b14c',
    500: '#f59e0b', // Primary - warm orange (adventure)
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  // Secondary - Earth tones (grounded, natural)
  secondary: {
    50: '#f6f5f3',
    100: '#ebe8e3',
    200: '#d6d1c7',
    300: '#b8b1a1',
    400: '#958b77',
    500: '#7a6e5a',
    600: '#655b4a',
    700: '#534b3e',
    800: '#463f35',
    900: '#3c352d',
    950: '#1f1b16',
  },
  // Accent - Fresh green (health, growth)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#0a2e18',
  },
  // Health/Wellness - Soft blues (calm, wellness)
  health: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Cooking/Food - Warm reds and pinks (appetite, energy)
  food: {
    tomato: '#ef4444',
    carrot: '#f97316',
    lemon: '#eab308',
    avocado: '#84cc16',
    berry: '#ec4899',
    eggplant: '#a855f7',
    beet: '#be185d',
    pepper: '#dc2626',
  },
  // Premium - Gold gradient (luxury, exclusivity)
  premium: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Partner - Professional blues (trust, enterprise)
  partner: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

export const nomadTypography = {
  // Display fonts for headings
  display: {
    fontFamily: ['Poppins', 'system-ui', 'sans-serif'],
    sizes: {
      '4xl': { fontSize: '72px', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' },
      '3xl': { fontSize: '48px', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.01em' },
      '2xl': { fontSize: '36px', lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.01em' },
      xl: { fontSize: '30px', lineHeight: 1.25, fontWeight: 600 },
      lg: { fontSize: '24px', lineHeight: 1.3, fontWeight: 600 },
      md: { fontSize: '20px', lineHeight: 1.35, fontWeight: 500 },
    },
  },
  // Body text
  body: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'],
    sizes: {
      lg: { fontSize: '18px', lineHeight: 1.6, fontWeight: 400 },
      base: { fontSize: '16px', lineHeight: 1.6, fontWeight: 400 },
      sm: { fontSize: '14px', lineHeight: 1.5, fontWeight: 400 },
      xs: { fontSize: '12px', lineHeight: 1.4, fontWeight: 400 },
    },
  },
  // Accent text (recipes, highlights)
  accent: {
    fontFamily: ['Playfair Display', 'Georgia', 'serif'],
    sizes: {
      lg: { fontSize: '24px', lineHeight: 1.4, fontWeight: 400, fontStyle: 'italic' },
      base: { fontSize: '20px', lineHeight: 1.4, fontWeight: 400 },
      sm: { fontSize: '16px', lineHeight: 1.4, fontWeight: 400 },
    },
  },
} as const;

export const nomadSpacing = {
  // Base spacing scale (4px increments)
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
  '6xl': '192px',
} as const;

export const nomadBorderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const nomadElevation = {
  // Box shadows with elevation levels
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Card-specific elevations
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const nomadMotion = {
  // Animation durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  // Transition presets
  transitions: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const nomadBreakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

export const nomadZIndex = {
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Theme variants for Light, Dark, and Seasonal (Premium)
export const nomadThemes = {
  light: {
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceElevated: '#ffffff',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    brand: nomadColors.brand[500],
    accent: nomadColors.accent[500],
    health: nomadColors.health[500],
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    border: '#475569',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#111827',
    },
    brand: nomadColors.brand[400],
    accent: nomadColors.accent[400],
    health: nomadColors.health[400],
  },
  seasonal: {
    // Premium seasonal themes (Spring, Summer, Fall, Winter)
    spring: {
      background: '#fefdf8',
      surface: '#faf9f0',
      surfaceElevated: '#f7f5e8',
      border: '#e8e5d3',
      text: {
        primary: '#1a1a14',
        secondary: '#5a584f',
        tertiary: '#8a8879',
        inverse: '#ffffff',
      },
      brand: '#84cc16', // Fresh green
      accent: '#22c55e',
      health: '#3b82f6',
    },
    summer: {
      background: '#fffef9',
      surface: '#fff9e6',
      surfaceElevated: '#fff5cc',
      border: '#ffe6b3',
      text: {
        primary: '#1a1500',
        secondary: '#5a4f00',
        tertiary: '#8a7700',
        inverse: '#ffffff',
      },
      brand: '#f59e0b', // Warm orange
      accent: '#f97316',
      health: '#06b6d4',
    },
    fall: {
      background: '#fffbf5',
      surface: '#fff5e6',
      surfaceElevated: '#ffeecc',
      border: '#ffd9b3',
      text: {
        primary: '#1a1400',
        secondary: '#5a4f00',
        tertiary: '#8a7700',
        inverse: '#ffffff',
      },
      brand: '#d97706', // Autumn orange
      accent: '#f59e0b',
      health: '#22c55e',
    },
    winter: {
      background: '#f8fafc',
      surface: '#f1f5f9',
      surfaceElevated: '#e2e8f0',
      border: '#cbd5e1',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        inverse: '#ffffff',
      },
      brand: '#3b82f6', // Cool blue
      accent: '#60a5fa',
      health: '#06b6d4',
    },
  },
} as const;

// Icon system - Material + Custom Emoji
export const nomadIcons = {
  // Material icons (via lucide-react)
  meal: 'Utensils',
  health: 'Heart',
  grocery: 'ShoppingCart',
  recipe: 'ChefHat',
  family: 'Users',
  calendar: 'Calendar',
  settings: 'Settings',
  premium: 'Crown',
  partner: 'Building2',
  
  // Custom emoji set for Nomad
  emoji: {
    breakfast: '??',
    lunch: '??',
    dinner: '???',
    snack: '??',
    water: '??',
    exercise: '??',
    sleep: '??',
    heart: '??',
    fire: '??', // Streaks
    trophy: '??',
    star: '?',
    share: '??',
    scan: '??',
    add: '?',
    check: '?',
    family: '???????????',
    cooking: '?????',
    adventure: '???',
  },
} as const;

// Ad placement specifications (Free Edition)
export const nomadAdPlacements = {
  feedTile: {
    frequency: 5, // Every 5th tile
    size: {
      mobile: { width: '100%', height: '250px' },
      tablet: { width: '100%', height: '280px' },
      desktop: { width: '728px', height: '90px' },
    },
    position: 'between-content',
  },
  banner: {
    position: 'below-dashboard-widgets',
    size: {
      mobile: { width: '100%', height: '100px' },
      tablet: { width: '100%', height: '120px' },
      desktop: { width: '970px', height: '250px' },
    },
    sticky: false,
  },
  interstitial: {
    trigger: 'recipe-view', // Between recipe views
    size: {
      mobile: { width: '100%', height: '100vh' },
      tablet: { width: '100%', height: '100vh' },
      desktop: { width: '100%', height: '100vh' },
    },
    dismissible: true,
    cooldown: '5min', // Max once per 5 minutes
  },
  sponsored: {
    type: 'opt-in-ingredients',
    position: 'grocery-list-top',
    style: 'native', // Matches app design
  },
} as const;

// Component-specific tokens
export const nomadComponents = {
  card: {
    padding: nomadSpacing.md,
    borderRadius: nomadBorderRadius.lg,
    elevation: nomadElevation.card,
    hoverElevation: nomadElevation.cardHover,
  },
  button: {
    padding: {
      sm: `${nomadSpacing.sm} ${nomadSpacing.md}`,
      md: `${nomadSpacing.md} ${nomadSpacing.lg}`,
      lg: `${nomadSpacing.lg} ${nomadSpacing.xl}`,
    },
    borderRadius: nomadBorderRadius.md,
    minHeight: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
  },
  input: {
    padding: `${nomadSpacing.sm} ${nomadSpacing.md}`,
    borderRadius: nomadBorderRadius.md,
    borderWidth: '1px',
  },
  modal: {
    padding: nomadSpacing.xl,
    borderRadius: nomadBorderRadius.xl,
    maxWidth: {
      sm: '100%',
      md: '512px',
      lg: '768px',
      xl: '1024px',
    },
    elevation: nomadElevation.modal,
  },
} as const;

export type NomadTheme = keyof typeof nomadThemes;
export type SeasonalTheme = keyof typeof nomadThemes.seasonal;
