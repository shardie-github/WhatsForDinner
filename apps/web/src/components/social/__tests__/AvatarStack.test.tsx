import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import AvatarStack from '../AvatarStack.tsx';

describe('AvatarStack', () => {
  it('renders without crashing', () => {
    render(<AvatarStack />);
    expect(screen.getByRole('main') || screen.getByTestId('avatarstack')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<AvatarStack {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('avatarstack')).toBeDefined();
  });
});
