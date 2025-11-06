import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ShareButton from '../ShareButton.tsx';

describe('ShareButton', () => {
  it('renders without crashing', () => {
    render(<ShareButton />);
    expect(screen.getByRole('main') || screen.getByTestId('sharebutton')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ShareButton {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('sharebutton')).toBeDefined();
  });
});
