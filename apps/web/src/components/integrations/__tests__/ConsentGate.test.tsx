import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ConsentGate from '../ConsentGate.tsx';

describe('ConsentGate', () => {
  it('renders without crashing', () => {
    render(<ConsentGate />);
    expect(screen.getByRole('main') || screen.getByTestId('consentgate')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ConsentGate {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('consentgate')).toBeDefined();
  });
});
