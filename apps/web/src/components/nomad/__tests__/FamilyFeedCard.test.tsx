import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FamilyFeedCard from '../FamilyFeedCard.tsx';

describe('FamilyFeedCard', () => {
  it('renders without crashing', () => {
    render(<FamilyFeedCard />);
    expect(screen.getByRole('main') || screen.getByTestId('familyfeedcard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<FamilyFeedCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('familyfeedcard')).toBeDefined();
  });
});
