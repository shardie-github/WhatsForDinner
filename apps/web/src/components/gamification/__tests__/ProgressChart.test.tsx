import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ProgressChart from '../ProgressChart.tsx';

describe('ProgressChart', () => {
  it('renders without crashing', () => {
    render(<ProgressChart />);
    expect(screen.getByRole('main') || screen.getByTestId('progresschart')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ProgressChart {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('progresschart')).toBeDefined();
  });
});
