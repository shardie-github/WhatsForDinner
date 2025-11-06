import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import CommentSection from '../CommentSection.tsx';

describe('CommentSection', () => {
  it('renders without crashing', () => {
    render(<CommentSection />);
    expect(screen.getByRole('main') || screen.getByTestId('commentsection')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<CommentSection {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('commentsection')).toBeDefined();
  });
});
