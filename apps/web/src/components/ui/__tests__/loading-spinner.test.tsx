import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import loading-spinner from '../loading-spinner.tsx';

describe('loading-spinner', () => {
  it('renders without crashing', () => {
    render(<loading-spinner />);
    expect(screen.getByRole('main') || screen.getByTestId('loading-spinner')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<loading-spinner {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('loading-spinner')).toBeDefined();
  });
});
