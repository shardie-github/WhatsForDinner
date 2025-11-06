import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PWAInstaller from '../PWAInstaller.tsx';

describe('PWAInstaller', () => {
  it('renders without crashing', () => {
    render(<PWAInstaller />);
    expect(screen.getByRole('main') || screen.getByTestId('pwainstaller')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PWAInstaller {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('pwainstaller')).toBeDefined();
  });
});
