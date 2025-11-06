import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import GDPRConsent from '../GDPRConsent.tsx';

describe('GDPRConsent', () => {
  it('renders without crashing', () => {
    render(<GDPRConsent />);
    expect(screen.getByRole('main') || screen.getByTestId('gdprconsent')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<GDPRConsent {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('gdprconsent')).toBeDefined();
  });
});
