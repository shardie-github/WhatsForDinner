import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import RecipeSpotlightCard from '../RecipeSpotlightCard.tsx';

describe('RecipeSpotlightCard', () => {
  it('renders without crashing', () => {
    render(<RecipeSpotlightCard />);
    expect(screen.getByRole('main') || screen.getByTestId('recipespotlightcard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<RecipeSpotlightCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('recipespotlightcard')).toBeDefined();
  });
});
