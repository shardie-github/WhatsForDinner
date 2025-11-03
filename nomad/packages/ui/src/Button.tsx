import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  testID,
  accessibilityLabel,
  className,
  style,
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s',
  };

  const variantStyles: Record<ButtonProps['variant'], React.CSSProperties> = {
    primary: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#6366f1',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#10b981',
      border: '1px solid #10b981',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
    },
  };

  const sizeStyles: Record<ButtonProps['size'], React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '10px 20px', fontSize: '16px' },
    lg: { padding: '14px 28px', fontSize: '18px' },
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      data-testid={testID}
      aria-label={accessibilityLabel}
      className={className}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
