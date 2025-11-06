import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar.tsx';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(screen.getByRole('main') || screen.getByTestId('navbar')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Navbar {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('navbar')).toBeDefined();
  });
});
