import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import HCaptcha from '../HCaptcha.tsx';

describe('HCaptcha', () => {
  it('renders without crashing', () => {
    render(<HCaptcha />);
    expect(screen.getByRole('main') || screen.getByTestId('hcaptcha')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<HCaptcha {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('hcaptcha')).toBeDefined();
  });
});
