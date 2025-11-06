import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import GamificationProvider from '../GamificationProvider.tsx';

describe('GamificationProvider', () => {
  it('renders without crashing', () => {
    render(<GamificationProvider />);
    expect(screen.getByRole('main') || screen.getByTestId('gamificationprovider')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<GamificationProvider {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('gamificationprovider')).toBeDefined();
  });
});
