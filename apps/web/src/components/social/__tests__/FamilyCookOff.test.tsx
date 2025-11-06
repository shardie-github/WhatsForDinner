import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FamilyCookOff from '../FamilyCookOff.tsx';

describe('FamilyCookOff', () => {
  it('renders without crashing', () => {
    render(<FamilyCookOff />);
    expect(screen.getByRole('main') || screen.getByTestId('familycookoff')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<FamilyCookOff {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('familycookoff')).toBeDefined();
  });
});
