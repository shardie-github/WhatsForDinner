import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BadgeCollection from '../BadgeCollection.tsx';

describe('BadgeCollection', () => {
  it('renders without crashing', () => {
    render(<BadgeCollection />);
    expect(screen.getByRole('main') || screen.getByTestId('badgecollection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<BadgeCollection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('badgecollection')).toBeDefined();
  });
});
