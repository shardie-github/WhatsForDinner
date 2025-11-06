import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import GroceryListCard from '../GroceryListCard.tsx';

describe('GroceryListCard', () => {
  it('renders without crashing', () => {
    render(<GroceryListCard />);
    expect(screen.getByRole('main') || screen.getByTestId('grocerylistcard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<GroceryListCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('grocerylistcard')).toBeDefined();
  });
});
