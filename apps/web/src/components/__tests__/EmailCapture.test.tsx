import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import EmailCapture from '../EmailCapture.tsx';

describe('EmailCapture', () => {
  it('renders without crashing', () => {
    render(<EmailCapture />);
    expect(screen.getByRole('main') || screen.getByTestId('emailcapture')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<EmailCapture {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('emailcapture')).toBeDefined();
  });
});
