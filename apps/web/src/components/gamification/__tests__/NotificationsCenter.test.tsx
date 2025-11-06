import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import NotificationsCenter from '../NotificationsCenter.tsx';

describe('NotificationsCenter', () => {
  it('renders without crashing', () => {
    render(<NotificationsCenter />);
    expect(screen.getByRole('main') || screen.getByTestId('notificationscenter')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<NotificationsCenter {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('notificationscenter')).toBeDefined();
  });
});
