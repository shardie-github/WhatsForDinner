/**
 * Theme Management for What's for Dinner
 *
 * This module provides dark mode functionality and theme management
 * with system preference detection and persistent storage.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware CSS variables
export const themeVariables = {
  light: {
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--primary': '222.2 47.4% 11.2%',
    '--primary-foreground': '210 40% 98%',
    '--secondary': '210 40% 96%',
    '--secondary-foreground': '222.2 47.4% 11.2%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '210 40% 96%',
    '--accent-foreground': '222.2 47.4% 11.2%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '222.2 84% 4.9%',
    '--radius': '0.5rem',
  },
  dark: {
    '--background': '222.2 84% 4.9%',
    '--foreground': '210 40% 98%',
    '--card': '222.2 84% 4.9%',
    '--card-foreground': '210 40% 98%',
    '--popover': '222.2 84% 4.9%',
    '--popover-foreground': '210 40% 98%',
    '--primary': '210 40% 98%',
    '--primary-foreground': '222.2 47.4% 11.2%',
    '--secondary': '217.2 32.6% 17.5%',
    '--secondary-foreground': '210 40% 98%',
    '--muted': '217.2 32.6% 17.5%',
    '--muted-foreground': '215 20.2% 65.1%',
    '--accent': '217.2 32.6% 17.5%',
    '--accent-foreground': '210 40% 98%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '217.2 32.6% 17.5%',
    '--input': '217.2 32.6% 17.5%',
    '--ring': '212.7 26.8% 83.9%',
    '--radius': '0.5rem',
  },
};

// Apply theme variables to document
export function applyThemeVariables(theme: 'light' | 'dark') {
  const root = document.documentElement;
  const variables = themeVariables[theme];

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700"
        role="switch"
        aria-checked={resolvedTheme === 'dark'}
        aria-label="Toggle dark mode"
      >
        <span
          className={`${
            resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}

// Theme selector component
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Theme</label>
      <select
        value={theme}
        onChange={e => setTheme(e.target.value as Theme)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

// Dark mode detection hook
export function useDarkMode() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark';
}

// Theme-aware class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Dark mode utilities
export const darkModeClasses = {
  background: 'bg-white dark:bg-gray-900',
  foreground: 'text-gray-900 dark:text-gray-100',
  card: 'bg-white dark:bg-gray-800',
  border: 'border-gray-200 dark:border-gray-700',
  input: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
  button: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  primary: 'bg-blue-600 dark:bg-blue-500 text-white',
  secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
};

// Export theme configuration
export const themeConfig = {
  light: {
    name: 'Light',
    description: 'Light theme with bright colors',
    colors: themeVariables.light,
  },
  dark: {
    name: 'Dark',
    description: 'Dark theme with muted colors',
    colors: themeVariables.dark,
  },
  system: {
    name: 'System',
    description: 'Follow system preference',
    colors: null,
  },
};
