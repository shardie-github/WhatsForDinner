import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import LoadingState from '../LoadingState.tsx';

describe('LoadingState', () => {
  it('renders without crashing', () => {
    render(<LoadingState />);
    expect(screen.getByRole('main') || screen.getByTestId('loadingstate')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<LoadingState {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('loadingstate')).toBeDefined();
  });
});
