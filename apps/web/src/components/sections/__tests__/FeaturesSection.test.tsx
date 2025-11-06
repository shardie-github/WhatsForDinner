import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FeaturesSection from '../FeaturesSection.tsx';

describe('FeaturesSection', () => {
  it('renders without crashing', () => {
    render(<FeaturesSection />);
    expect(screen.getByRole('main') || screen.getByTestId('featuressection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<FeaturesSection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('featuressection')).toBeDefined();
  });
});
