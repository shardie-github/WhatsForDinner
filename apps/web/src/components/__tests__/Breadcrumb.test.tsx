import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Breadcrumb from '../Breadcrumb.tsx';

describe('Breadcrumb', () => {
  it('renders without crashing', () => {
    render(<Breadcrumb />);
    expect(screen.getByRole('main') || screen.getByTestId('breadcrumb')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<Breadcrumb {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('breadcrumb')).toBeDefined();
  });
});
