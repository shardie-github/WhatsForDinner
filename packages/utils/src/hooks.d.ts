export declare function useDeviceInfo(): {
    isOnline: boolean;
    isWeb: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    platform: string;
};
export declare function useResponsiveValue<T>(mobile: T, tablet?: T, desktop?: T): T;
export declare function usePlatformStyles(): {
    safeAreaTop: number;
    safeAreaBottom: number;
    statusBarHeight: number;
    isWeb: boolean;
    isMobile: boolean;
};
export declare function usePantry(): {
    items: string[];
    addItem: (item: string) => void;
    removeItem: (index: number) => void;
    clearItems: () => void;
};
export type ThemeMode = 'light' | 'dark' | 'system';
export declare function useTheme(): {
    theme: ThemeMode;
    resolvedTheme: "light" | "dark";
    setTheme: import("react").Dispatch<import("react").SetStateAction<ThemeMode>>;
    toggleTheme: () => void;
    isDark: boolean;
    isLight: boolean;
};
export declare function useThemeSync(): void;
export declare function useThemeColors(): {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
};
//# sourceMappingURL=hooks.d.ts.map