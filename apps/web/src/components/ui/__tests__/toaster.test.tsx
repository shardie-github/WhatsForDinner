import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import toaster from '../toaster.tsx';

describe('toaster', () => {
  it('renders without crashing', () => {
    render(<toaster />);
    expect(screen.getByRole('main') || screen.getByTestId('toaster')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<toaster {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('toaster')).toBeDefined();
  });
});
