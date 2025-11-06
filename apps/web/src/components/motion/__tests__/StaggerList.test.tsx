import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StaggerList from '../StaggerList.tsx';

describe('StaggerList', () => {
  it('renders without crashing', () => {
    render(<StaggerList />);
    expect(screen.getByRole('main') || screen.getByTestId('staggerlist')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StaggerList {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('staggerlist')).toBeDefined();
  });
});
