import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import CacheRefresh from '../CacheRefresh.tsx';

describe('CacheRefresh', () => {
  it('renders without crashing', () => {
    render(<CacheRefresh />);
    expect(screen.getByRole('main') || screen.getByTestId('cacherefresh')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<CacheRefresh {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('cacherefresh')).toBeDefined();
  });
});
