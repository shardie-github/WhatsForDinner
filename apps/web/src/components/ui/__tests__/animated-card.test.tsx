import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import animated-card from '../animated-card.tsx';

describe('animated-card', () => {
  it('renders without crashing', () => {
    render(<animated-card />);
    expect(screen.getByRole('main') || screen.getByTestId('animated-card')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<animated-card {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('animated-card')).toBeDefined();
  });
});
