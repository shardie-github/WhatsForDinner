import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle.tsx';

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('main') || screen.getByTestId('themetoggle')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ThemeToggle {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('themetoggle')).toBeDefined();
  });
});
