import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import CoreWebVitals from '../CoreWebVitals.tsx';

describe('CoreWebVitals', () => {
  it('renders without crashing', () => {
    render(<CoreWebVitals />);
    expect(screen.getByRole('main') || screen.getByTestId('corewebvitals')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<CoreWebVitals {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('corewebvitals')).toBeDefined();
  });
});
