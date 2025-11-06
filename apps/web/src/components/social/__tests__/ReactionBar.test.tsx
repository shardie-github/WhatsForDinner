import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ReactionBar from '../ReactionBar.tsx';

describe('ReactionBar', () => {
  it('renders without crashing', () => {
    render(<ReactionBar />);
    expect(screen.getByRole('main') || screen.getByTestId('reactionbar')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<ReactionBar {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('reactionbar')).toBeDefined();
  });
});
