import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection.tsx';

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />);
    expect(screen.getByRole('main') || screen.getByTestId('herosection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<HeroSection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('herosection')).toBeDefined();
  });
});
