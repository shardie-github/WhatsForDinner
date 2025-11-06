import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import CapacitorInit from '../CapacitorInit.tsx';

describe('CapacitorInit', () => {
  it('renders without crashing', () => {
    render(<CapacitorInit />);
    expect(screen.getByRole('main') || screen.getByTestId('capacitorinit')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<CapacitorInit {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('capacitorinit')).toBeDefined();
  });
});
