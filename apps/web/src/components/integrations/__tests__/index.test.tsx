import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import index from '../index.tsx';

describe('index', () => {
  it('renders without crashing', () => {
    render(<index />);
    expect(screen.getByRole('main') || screen.getByTestId('index')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<index {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('index')).toBeDefined();
  });
});
