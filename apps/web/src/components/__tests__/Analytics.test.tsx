import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Analytics from '../Analytics.tsx';

describe('Analytics', () => {
  it('renders without crashing', () => {
    render(<Analytics />);
    expect(screen.getByRole('main') || screen.getByTestId('analytics')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Analytics {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('analytics')).toBeDefined();
  });
});
