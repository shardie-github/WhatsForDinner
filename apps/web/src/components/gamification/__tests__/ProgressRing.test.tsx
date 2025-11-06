import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ProgressRing from '../ProgressRing.tsx';

describe('ProgressRing', () => {
  it('renders without crashing', () => {
    render(<ProgressRing />);
    expect(screen.getByRole('main') || screen.getByTestId('progressring')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ProgressRing {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('progressring')).toBeDefined();
  });
});
