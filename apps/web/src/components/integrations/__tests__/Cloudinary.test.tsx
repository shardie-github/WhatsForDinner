import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Cloudinary from '../Cloudinary.tsx';

describe('Cloudinary', () => {
  it('renders without crashing', () => {
    render(<Cloudinary />);
    expect(screen.getByRole('main') || screen.getByTestId('cloudinary')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Cloudinary {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('cloudinary')).toBeDefined();
  });
});
