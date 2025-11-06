import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import code-splitting from '../code-splitting.tsx';

describe('code-splitting', () => {
  it('renders without crashing', () => {
    render(<code-splitting />);
    expect(screen.getByRole('main') || screen.getByTestId('code-splitting')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<code-splitting {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('code-splitting')).toBeDefined();
  });
});
