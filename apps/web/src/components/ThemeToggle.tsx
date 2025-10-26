'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    if (theme === 'system') return '🌓';
    return isDark ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    return isDark ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium">{getLabel()}</span>
    </button>
  );
}
