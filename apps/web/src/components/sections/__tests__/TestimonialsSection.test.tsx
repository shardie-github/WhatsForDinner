import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import TestimonialsSection from '../TestimonialsSection.tsx';

describe('TestimonialsSection', () => {
  it('renders without crashing', () => {
    render(<TestimonialsSection />);
    expect(screen.getByRole('main') || screen.getByTestId('testimonialssection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<TestimonialsSection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('testimonialssection')).toBeDefined();
  });
});
