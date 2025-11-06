import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import RecipeFeedback from '../RecipeFeedback.tsx';

describe('RecipeFeedback', () => {
  it('renders without crashing', () => {
    render(<RecipeFeedback />);
    expect(screen.getByRole('main') || screen.getByTestId('recipefeedback')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<RecipeFeedback {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('recipefeedback')).toBeDefined();
  });
});
