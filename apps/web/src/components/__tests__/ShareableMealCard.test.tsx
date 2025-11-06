import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ShareableMealCard from '../ShareableMealCard.tsx';

describe('ShareableMealCard', () => {
  it('renders without crashing', () => {
    render(<ShareableMealCard />);
    expect(screen.getByRole('main') || screen.getByTestId('shareablemealcard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ShareableMealCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('shareablemealcard')).toBeDefined();
  });
});
