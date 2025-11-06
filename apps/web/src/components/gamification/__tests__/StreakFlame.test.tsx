import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StreakFlame from '../StreakFlame.tsx';

describe('StreakFlame', () => {
  it('renders without crashing', () => {
    render(<StreakFlame />);
    expect(screen.getByRole('main') || screen.getByTestId('streakflame')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StreakFlame {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('streakflame')).toBeDefined();
  });
});
