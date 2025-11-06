import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import AdMobIntegration from '../AdMobIntegration.tsx';

describe('AdMobIntegration', () => {
  it('renders without crashing', () => {
    render(<AdMobIntegration />);
    expect(screen.getByRole('main') || screen.getByTestId('admobintegration')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<AdMobIntegration {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('admobintegration')).toBeDefined();
  });
});
