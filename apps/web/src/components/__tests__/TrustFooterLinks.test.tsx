import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import TrustFooterLinks from '../TrustFooterLinks.tsx';

describe('TrustFooterLinks', () => {
  it('renders without crashing', () => {
    render(<TrustFooterLinks />);
    expect(screen.getByRole('main') || screen.getByTestId('trustfooterlinks')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<TrustFooterLinks {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('trustfooterlinks')).toBeDefined();
  });
});
