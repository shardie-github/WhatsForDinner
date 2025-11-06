import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Paywall from '../Paywall.tsx';

describe('Paywall', () => {
  it('renders without crashing', () => {
    render(<Paywall />);
    expect(screen.getByRole('main') || screen.getByTestId('paywall')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Paywall {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('paywall')).toBeDefined();
  });
});
