import { Button } from '../Button';
import { useTheme } from '@whats-for-dinner/utils';

export interface ThemeToggleProps {
  className?: string | undefined;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const getIcon = () => {
    if (theme === 'system') return '🌓';
    return isDark ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    return isDark ? 'Dark' : 'Light';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={toggleTheme}
      className={className}
    >
      <span className="mr-2">{getIcon()}</span>
      {getLabel()}
    </Button>
  );
}
