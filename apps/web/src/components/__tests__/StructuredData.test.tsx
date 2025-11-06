import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import StructuredData from '../StructuredData.tsx';

describe('StructuredData', () => {
  it('renders without crashing', () => {
    render(<StructuredData />);
    expect(screen.getByRole('main') || screen.getByTestId('structureddata')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<StructuredData {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('structureddata')).toBeDefined();
  });
});
