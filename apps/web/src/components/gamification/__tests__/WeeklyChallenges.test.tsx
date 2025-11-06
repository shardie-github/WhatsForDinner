import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import WeeklyChallenges from '../WeeklyChallenges.tsx';

describe('WeeklyChallenges', () => {
  it('renders without crashing', () => {
    render(<WeeklyChallenges />);
    expect(screen.getByRole('main') || screen.getByTestId('weeklychallenges')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<WeeklyChallenges {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('weeklychallenges')).toBeDefined();
  });
});
