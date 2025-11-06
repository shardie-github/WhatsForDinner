import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StreaksBadgesCard from '../StreaksBadgesCard.tsx';

describe('StreaksBadgesCard', () => {
  it('renders without crashing', () => {
    render(<StreaksBadgesCard />);
    expect(screen.getByRole('main') || screen.getByTestId('streaksbadgescard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StreaksBadgesCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('streaksbadgescard')).toBeDefined();
  });
});
