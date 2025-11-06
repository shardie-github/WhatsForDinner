import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import OnboardingFlow from '../OnboardingFlow.tsx';

describe('OnboardingFlow', () => {
  it('renders without crashing', () => {
    render(<OnboardingFlow />);
    expect(screen.getByRole('main') || screen.getByTestId('onboardingflow')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<OnboardingFlow {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('onboardingflow')).toBeDefined();
  });
});
