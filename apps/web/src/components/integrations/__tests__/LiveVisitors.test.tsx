import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import LiveVisitors from '../LiveVisitors.tsx';

describe('LiveVisitors', () => {
  it('renders without crashing', () => {
    render(<LiveVisitors />);
    expect(screen.getByRole('main') || screen.getByTestId('livevisitors')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<LiveVisitors {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('livevisitors')).toBeDefined();
  });
});
