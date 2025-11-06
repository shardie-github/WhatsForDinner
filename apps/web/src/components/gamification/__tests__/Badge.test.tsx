import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge.tsx';

describe('Badge', () => {
  it('renders without crashing', () => {
    render(<Badge />);
    expect(screen.getByRole('main') || screen.getByTestId('badge')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Badge {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('badge')).toBeDefined();
  });
});
