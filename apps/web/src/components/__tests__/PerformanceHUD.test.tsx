import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PerformanceHUD from '../PerformanceHUD.tsx';

describe('PerformanceHUD', () => {
  it('renders without crashing', () => {
    render(<PerformanceHUD />);
    expect(screen.getByRole('main') || screen.getByTestId('performancehud')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PerformanceHUD {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('performancehud')).toBeDefined();
  });
});
