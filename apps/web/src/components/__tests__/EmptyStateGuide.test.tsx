import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import EmptyStateGuide from '../EmptyStateGuide.tsx';

describe('EmptyStateGuide', () => {
  it('renders without crashing', () => {
    render(<EmptyStateGuide />);
    expect(screen.getByRole('main') || screen.getByTestId('emptystateguide')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<EmptyStateGuide {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('emptystateguide')).toBeDefined();
  });
});
