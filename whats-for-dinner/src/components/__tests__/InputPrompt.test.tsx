import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputPrompt from '../InputPrompt';

const mockOnGenerate = jest.fn();

const defaultProps = {
  onGenerate: mockOnGenerate,
  loading: false,
  pantryItems: ['tomatoes', 'onions', 'garlic'],
};

describe('InputPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input fields and buttons', () => {
    render(<InputPrompt {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Add an ingredient...')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('e.g., vegetarian, gluten-free, low-carb...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /what should i cook/i })
    ).toBeInTheDocument();
  });

  it('adds ingredients when typing and clicking add', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add an ingredient...');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'pasta');
    await user.click(addButton);

    expect(screen.getByText('pasta')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('does not add duplicate ingredients', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add an ingredient...');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'pasta');
    await user.click(addButton);
    await user.type(input, 'pasta');
    await user.click(addButton);

    expect(screen.getAllByText('pasta')).toHaveLength(1);
  });

  it('adds ingredients from pantry when clicked', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const pantryButton = screen.getByRole('button', { name: /\+ tomatoes/i });
    await user.click(pantryButton);

    expect(screen.getByText('tomatoes')).toBeInTheDocument();
  });

  it('removes ingredients when x is clicked', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add an ingredient...');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'pasta');
    await user.click(addButton);

    const removeButton = screen.getByRole('button', { name: /×/i });
    await user.click(removeButton);

    expect(screen.queryByText('pasta')).not.toBeInTheDocument();
  });

  it('calls onGenerate with correct parameters when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add an ingredient...');
    const preferencesInput = screen.getByPlaceholderText(
      'e.g., vegetarian, gluten-free, low-carb...'
    );
    const submitButton = screen.getByRole('button', {
      name: /what should i cook/i,
    });

    await user.type(input, 'pasta');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await user.type(preferencesInput, 'vegetarian');
    await user.click(submitButton);

    expect(mockOnGenerate).toHaveBeenCalledWith(['pasta'], 'vegetarian');
  });

  it('does not submit when no ingredients are selected', async () => {
    const user = userEvent.setup();
    render(<InputPrompt {...defaultProps} />);

    const submitButton = screen.getByRole('button', {
      name: /what should i cook/i,
    });
    await user.click(submitButton);

    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    render(<InputPrompt {...defaultProps} loading={true} />);

    const submitButton = screen.getByRole('button', {
      name: /generating recipes/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('shows pantry items when available', () => {
    render(<InputPrompt {...defaultProps} />);

    expect(screen.getByText('Or add from your pantry:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /\+ tomatoes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /\+ onions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /\+ garlic/i })
    ).toBeInTheDocument();
  });

  it('does not show pantry section when no pantry items', () => {
    render(<InputPrompt {...defaultProps} pantryItems={[]} />);

    expect(
      screen.queryByText('Or add from your pantry:')
    ).not.toBeInTheDocument();
  });
});
