import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import GroceryIntegration from '../GroceryIntegration.tsx';

describe('GroceryIntegration', () => {
  it('renders without crashing', () => {
    render(<GroceryIntegration />);
    expect(screen.getByRole('main') || screen.getByTestId('groceryintegration')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<GroceryIntegration {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('groceryintegration')).toBeDefined();
  });
});
