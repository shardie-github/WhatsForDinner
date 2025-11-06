import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import MealPlanCard from '../MealPlanCard.tsx';

describe('MealPlanCard', () => {
  it('renders without crashing', () => {
    render(<MealPlanCard />);
    expect(screen.getByRole('main') || screen.getByTestId('mealplancard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<MealPlanCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('mealplancard')).toBeDefined();
  });
});
