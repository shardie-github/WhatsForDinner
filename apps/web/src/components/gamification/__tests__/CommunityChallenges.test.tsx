import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import CommunityChallenges from '../CommunityChallenges.tsx';

describe('CommunityChallenges', () => {
  it('renders without crashing', () => {
    render(<CommunityChallenges />);
    expect(screen.getByRole('main') || screen.getByTestId('communitychallenges')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<CommunityChallenges {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('communitychallenges')).toBeDefined();
  });
});
