import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import progress-bar from '../progress-bar.tsx';

describe('progress-bar', () => {
  it('renders without crashing', () => {
    render(<progress-bar />);
    expect(screen.getByRole('main') || screen.getByTestId('progress-bar')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<progress-bar {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('progress-bar')).toBeDefined();
  });
});
