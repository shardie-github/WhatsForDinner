import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StartCookingActivity from '../StartCookingActivity.tsx';

describe('StartCookingActivity', () => {
  it('renders without crashing', () => {
    render(<StartCookingActivity />);
    expect(screen.getByRole('main') || screen.getByTestId('startcookingactivity')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StartCookingActivity {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('startcookingactivity')).toBeDefined();
  });
});
