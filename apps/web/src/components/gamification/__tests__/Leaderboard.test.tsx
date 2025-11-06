import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Leaderboard from '../Leaderboard.tsx';

describe('Leaderboard', () => {
  it('renders without crashing', () => {
    render(<Leaderboard />);
    expect(screen.getByRole('main') || screen.getByTestId('leaderboard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Leaderboard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('leaderboard')).toBeDefined();
  });
});
