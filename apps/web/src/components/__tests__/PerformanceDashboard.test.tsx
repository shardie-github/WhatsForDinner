import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PerformanceDashboard from '../PerformanceDashboard.tsx';

describe('PerformanceDashboard', () => {
  it('renders without crashing', () => {
    render(<PerformanceDashboard />);
    expect(screen.getByRole('main') || screen.getByTestId('performancedashboard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PerformanceDashboard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('performancedashboard')).toBeDefined();
  });
});
