import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PushNotificationSetup from '../PushNotificationSetup.tsx';

describe('PushNotificationSetup', () => {
  it('renders without crashing', () => {
    render(<PushNotificationSetup />);
    expect(screen.getByRole('main') || screen.getByTestId('pushnotificationsetup')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<PushNotificationSetup {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('pushnotificationsetup')).toBeDefined();
  });
});
