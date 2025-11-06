import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../SkeletonLoader.tsx';

describe('SkeletonLoader', () => {
  it('renders without crashing', () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole('main') || screen.getByTestId('skeletonloader')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<SkeletonLoader {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('skeletonloader')).toBeDefined();
  });
});
