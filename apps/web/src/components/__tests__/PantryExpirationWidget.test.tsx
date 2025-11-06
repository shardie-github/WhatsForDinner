import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PantryExpirationWidget from '../PantryExpirationWidget.tsx';

describe('PantryExpirationWidget', () => {
  it('renders without crashing', () => {
    render(<PantryExpirationWidget />);
    expect(screen.getByRole('main') || screen.getByTestId('pantryexpirationwidget')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PantryExpirationWidget {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('pantryexpirationwidget')).toBeDefined();
  });
});
