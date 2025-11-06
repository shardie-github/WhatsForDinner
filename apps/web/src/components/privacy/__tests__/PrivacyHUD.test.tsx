import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PrivacyHUD from '../PrivacyHUD.tsx';

describe('PrivacyHUD', () => {
  it('renders without crashing', () => {
    render(<PrivacyHUD />);
    expect(screen.getByRole('main') || screen.getByTestId('privacyhud')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PrivacyHUD {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('privacyhud')).toBeDefined();
  });
});
