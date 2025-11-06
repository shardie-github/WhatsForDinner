import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ReferralSection from '../ReferralSection.tsx';

describe('ReferralSection', () => {
  it('renders without crashing', () => {
    render(<ReferralSection />);
    expect(screen.getByRole('main') || screen.getByTestId('referralsection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ReferralSection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('referralsection')).toBeDefined();
  });
});
