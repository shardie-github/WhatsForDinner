import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FadeIn from '../FadeIn.tsx';

describe('FadeIn', () => {
  it('renders without crashing', () => {
    render(<FadeIn />);
    expect(screen.getByRole('main') || screen.getByTestId('fadein')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<FadeIn {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('fadein')).toBeDefined();
  });
});
