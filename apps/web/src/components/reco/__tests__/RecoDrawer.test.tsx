import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import RecoDrawer from '../RecoDrawer.tsx';

describe('RecoDrawer', () => {
  it('renders without crashing', () => {
    render(<RecoDrawer />);
    expect(screen.getByRole('main') || screen.getByTestId('recodrawer')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<RecoDrawer {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('recodrawer')).toBeDefined();
  });
});
