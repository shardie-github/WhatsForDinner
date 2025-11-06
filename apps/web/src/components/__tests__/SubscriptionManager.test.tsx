import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import SubscriptionManager from '../SubscriptionManager.tsx';

describe('SubscriptionManager', () => {
  it('renders without crashing', () => {
    render(<SubscriptionManager />);
    expect(screen.getByRole('main') || screen.getByTestId('subscriptionmanager')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<SubscriptionManager {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('subscriptionmanager')).toBeDefined();
  });
});
