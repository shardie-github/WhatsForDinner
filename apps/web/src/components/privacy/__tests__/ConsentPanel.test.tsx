import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ConsentPanel from '../ConsentPanel.tsx';

describe('ConsentPanel', () => {
  it('renders without crashing', () => {
    render(<ConsentPanel />);
    expect(screen.getByRole('main') || screen.getByTestId('consentpanel')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ConsentPanel {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('consentpanel')).toBeDefined();
  });
});
