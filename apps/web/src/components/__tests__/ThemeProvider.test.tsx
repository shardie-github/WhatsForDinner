import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ThemeProvider from '../ThemeProvider.tsx';

describe('ThemeProvider', () => {
  it('renders without crashing', () => {
    render(<ThemeProvider />);
    expect(screen.getByRole('main') || screen.getByTestId('themeprovider')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ThemeProvider {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('themeprovider')).toBeDefined();
  });
});
