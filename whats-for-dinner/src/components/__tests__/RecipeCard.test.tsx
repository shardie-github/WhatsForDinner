import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeCard from '../RecipeCard';
import type { Recipe } from '@/lib/openaiClient';

const mockRecipe: Recipe = {
  title: 'Pasta with Tomatoes',
  cookTime: '30 minutes',
  calories: 450,
  ingredients: ['pasta', 'tomatoes', 'garlic', 'olive oil'],
  steps: [
    'Boil water and cook pasta according to package directions',
    'Heat olive oil in a large pan over medium heat',
    'Add minced garlic and cook until fragrant',
    'Add diced tomatoes and cook until softened',
    'Toss cooked pasta with the tomato mixture and serve',
  ],
};

const defaultProps = {
  recipe: mockRecipe,
  canSave: true,
};

describe('RecipeCard', () => {
  it('renders recipe information correctly', () => {
    render(<RecipeCard {...defaultProps} />);

    expect(screen.getByText('Pasta with Tomatoes')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('450 cal')).toBeInTheDocument();
    expect(screen.getByText('pasta')).toBeInTheDocument();
    expect(screen.getByText('tomatoes')).toBeInTheDocument();
    expect(screen.getByText('garlic')).toBeInTheDocument();
    expect(screen.getByText('olive oil')).toBeInTheDocument();
  });

  it('shows and hides instructions when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} />);

    const toggleButton = screen.getByRole('button', {
      name: /show instructions/i,
    });
    expect(screen.queryByText('Instructions:')).not.toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.getByText('Instructions:')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Boil water and cook pasta according to package directions'
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /hide instructions/i })
    );
    expect(screen.queryByText('Instructions:')).not.toBeInTheDocument();
  });

  it('shows save button when canSave is true and not favorite', () => {
    render(<RecipeCard {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /save recipe/i })
    ).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const mockOnSave = jest.fn();
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} onSave={mockOnSave} />);

    const saveButton = screen.getByRole('button', { name: /save recipe/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('shows remove button when isFavorite is true', () => {
    const mockOnRemove = jest.fn();
    render(<RecipeCard {...defaultProps} isFavorite onRemove={mockOnRemove} />);

    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save recipe/i })
    ).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const mockOnRemove = jest.fn();
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} isFavorite onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show save button when canSave is false', () => {
    render(<RecipeCard {...defaultProps} canSave={false} />);

    expect(
      screen.queryByRole('button', { name: /save recipe/i })
    ).not.toBeInTheDocument();
  });

  it('renders numbered steps correctly', async () => {
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} />);

    const toggleButton = screen.getByRole('button', {
      name: /show instructions/i,
    });
    await user.click(toggleButton);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders ingredients with bullet points', () => {
    render(<RecipeCard {...defaultProps} />);

    const ingredientList = screen.getByText('Ingredients:').parentElement;
    expect(ingredientList).toBeInTheDocument();

    // Check that each ingredient is in a list item
    mockRecipe.ingredients.forEach(ingredient => {
      const ingredientElement = screen.getByText(ingredient);
      expect(ingredientElement.closest('li')).toBeInTheDocument();
    });
  });
});
