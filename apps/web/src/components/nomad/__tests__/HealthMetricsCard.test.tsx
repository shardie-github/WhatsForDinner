import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import HealthMetricsCard from '../HealthMetricsCard.tsx';

describe('HealthMetricsCard', () => {
  it('renders without crashing', () => {
    render(<HealthMetricsCard />);
    expect(screen.getByRole('main') || screen.getByTestId('healthmetricscard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<HealthMetricsCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('healthmetricscard')).toBeDefined();
  });
});
