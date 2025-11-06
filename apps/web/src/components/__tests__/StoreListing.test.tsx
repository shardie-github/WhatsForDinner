import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StoreListing from '../StoreListing.tsx';

describe('StoreListing', () => {
  it('renders without crashing', () => {
    render(<StoreListing />);
    expect(screen.getByRole('main') || screen.getByTestId('storelisting')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StoreListing {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('storelisting')).toBeDefined();
  });
});
