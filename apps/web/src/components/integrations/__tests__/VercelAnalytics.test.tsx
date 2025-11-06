import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import VercelAnalytics from '../VercelAnalytics.tsx';

describe('VercelAnalytics', () => {
  it('renders without crashing', () => {
    render(<VercelAnalytics />);
    expect(screen.getByRole('main') || screen.getByTestId('vercelanalytics')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<VercelAnalytics {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('vercelanalytics')).toBeDefined();
  });
});
