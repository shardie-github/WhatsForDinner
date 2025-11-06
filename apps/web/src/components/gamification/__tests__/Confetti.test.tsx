import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Confetti from '../Confetti.tsx';

describe('Confetti', () => {
  it('renders without crashing', () => {
    render(<Confetti />);
    expect(screen.getByRole('main') || screen.getByTestId('confetti')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Confetti {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('confetti')).toBeDefined();
  });
});
