import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import FriendsList from '../FriendsList.tsx';

describe('FriendsList', () => {
  it('renders without crashing', () => {
    render(<FriendsList />);
    expect(screen.getByRole('main') || screen.getByTestId('friendslist')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<FriendsList {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('friendslist')).toBeDefined();
  });
});
