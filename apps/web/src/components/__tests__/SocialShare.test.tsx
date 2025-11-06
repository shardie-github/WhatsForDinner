import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import SocialShare from '../SocialShare.tsx';

describe('SocialShare', () => {
  it('renders without crashing', () => {
    render(<SocialShare />);
    expect(screen.getByRole('main') || screen.getByTestId('socialshare')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<SocialShare {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('socialshare')).toBeDefined();
  });
});
