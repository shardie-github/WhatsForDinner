import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import LiveCookingFeed from '../LiveCookingFeed.tsx';

describe('LiveCookingFeed', () => {
  it('renders without crashing', () => {
    render(<LiveCookingFeed />);
    expect(screen.getByRole('main') || screen.getByTestId('livecookingfeed')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<LiveCookingFeed {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('livecookingfeed')).toBeDefined();
  });
});
