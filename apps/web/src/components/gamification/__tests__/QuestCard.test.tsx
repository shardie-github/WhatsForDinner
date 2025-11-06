import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import QuestCard from '../QuestCard.tsx';

describe('QuestCard', () => {
  it('renders without crashing', () => {
    render(<QuestCard />);
    expect(screen.getByRole('main') || screen.getByTestId('questcard')).toBeDefined();
  });

  it('renders with required props', () => {
    const props = {};
    render(<QuestCard {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('questcard')).toBeDefined();
  });
});
