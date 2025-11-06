import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import MicrosoftClarity from '../MicrosoftClarity.tsx';

describe('MicrosoftClarity', () => {
  it('renders without crashing', () => {
    render(<MicrosoftClarity />);
    expect(screen.getByRole('main') || screen.getByTestId('microsoftclarity')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<MicrosoftClarity {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('microsoftclarity')).toBeDefined();
  });
});
