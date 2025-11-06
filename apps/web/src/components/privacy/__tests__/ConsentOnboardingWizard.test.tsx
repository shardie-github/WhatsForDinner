import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ConsentOnboardingWizard from '../ConsentOnboardingWizard.tsx';

describe('ConsentOnboardingWizard', () => {
  it('renders without crashing', () => {
    render(<ConsentOnboardingWizard />);
    expect(screen.getByRole('main') || screen.getByTestId('consentonboardingwizard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ConsentOnboardingWizard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('consentonboardingwizard')).toBeDefined();
  });
});
