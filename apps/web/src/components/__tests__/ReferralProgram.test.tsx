import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ReferralProgram from '../ReferralProgram.tsx';

describe('ReferralProgram', () => {
  it('renders without crashing', () => {
    render(<ReferralProgram />);
    expect(screen.getByRole('main') || screen.getByTestId('referralprogram')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ReferralProgram {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('referralprogram')).toBeDefined();
  });
});
