import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Lottie from '../Lottie.tsx';

describe('Lottie', () => {
  it('renders without crashing', () => {
    render(<Lottie />);
    expect(screen.getByRole('main') || screen.getByTestId('lottie')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Lottie {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('lottie')).toBeDefined();
  });
});
