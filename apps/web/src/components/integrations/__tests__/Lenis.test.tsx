import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Lenis from '../Lenis.tsx';

describe('Lenis', () => {
  it('renders without crashing', () => {
    render(<Lenis />);
    expect(screen.getByRole('main') || screen.getByTestId('lenis')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Lenis {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('lenis')).toBeDefined();
  });
});
