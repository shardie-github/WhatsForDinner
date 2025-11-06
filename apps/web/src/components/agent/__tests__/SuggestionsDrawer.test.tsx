import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import SuggestionsDrawer from '../SuggestionsDrawer.tsx';

describe('SuggestionsDrawer', () => {
  it('renders without crashing', () => {
    render(<SuggestionsDrawer />);
    expect(screen.getByRole('main') || screen.getByTestId('suggestionsdrawer')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<SuggestionsDrawer {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('suggestionsdrawer')).toBeDefined();
  });
});
