import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import OnboardingChecklist from '../OnboardingChecklist.tsx';

describe('OnboardingChecklist', () => {
  it('renders without crashing', () => {
    render(<OnboardingChecklist />);
    expect(screen.getByRole('main') || screen.getByTestId('onboardingchecklist')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<OnboardingChecklist {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('onboardingchecklist')).toBeDefined();
  });
});
