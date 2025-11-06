import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import InViewReveal from '../InViewReveal.tsx';

describe('InViewReveal', () => {
  it('renders without crashing', () => {
    render(<InViewReveal />);
    expect(screen.getByRole('main') || screen.getByTestId('inviewreveal')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<InViewReveal {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('inviewreveal')).toBeDefined();
  });
});
