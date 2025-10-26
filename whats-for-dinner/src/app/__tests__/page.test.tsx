import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'
import { supabase } from '@/lib/supabaseClient'

// Mock the Supabase client
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the main heading and description', () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    render(<Home />)
    
    expect(screen.getByText("What's for Dinner?")).toBeInTheDocument()
    expect(screen.getByText('Get AI-powered meal suggestions based on your pantry and preferences')).toBeInTheDocument()
  })

  it('renders InputPrompt component', () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    render(<Home />)
    
    expect(screen.getByPlaceholderText('Add an ingredient...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /what should i cook/i })).toBeInTheDocument()
  })

  it('loads pantry items for authenticated user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockPantryItems = [
      { ingredient: 'tomatoes' },
      { ingredient: 'onions' },
    ]
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockPantryItems, error: null })
      })
    } as any)
    
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Or add from your pantry:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /\+ tomatoes/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /\+ onions/i })).toBeInTheDocument()
    })
  })

  it('generates recipes when form is submitted', async () => {
    const user = userEvent.setup()
    const mockRecipes = [
      {
        title: 'Pasta with Tomatoes',
        cookTime: '30 minutes',
        calories: 450,
        ingredients: ['pasta', 'tomatoes'],
        steps: ['Cook pasta', 'Add tomatoes'],
      },
    ]
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ recipes: mockRecipes }),
    })
    
    render(<Home />)
    
    const ingredientInput = screen.getByPlaceholderText('Add an ingredient...')
    const addButton = screen.getByRole('button', { name: /add/i })
    const submitButton = screen.getByRole('button', { name: /what should i cook/i })
    
    await user.type(ingredientInput, 'pasta')
    await user.click(addButton)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dinner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ['pasta'],
          preferences: '',
        }),
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Suggested Recipes')).toBeInTheDocument()
      expect(screen.getByText('Pasta with Tomatoes')).toBeInTheDocument()
    })
  })

  it('saves recipe when save button is clicked', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockRecipe = {
      title: 'Pasta with Tomatoes',
      cookTime: '30 minutes',
      calories: 450,
      ingredients: ['pasta', 'tomatoes'],
      steps: ['Cook pasta', 'Add tomatoes'],
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
        })
      })
    } as any)
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ recipes: [mockRecipe] }),
    })
    
    render(<Home />)
    
    const ingredientInput = screen.getByPlaceholderText('Add an ingredient...')
    const addButton = screen.getByRole('button', { name: /add/i })
    const submitButton = screen.getByRole('button', { name: /what should i cook/i })
    
    await user.type(ingredientInput, 'pasta')
    await user.click(addButton)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Pasta with Tomatoes')).toBeInTheDocument()
    })
    
    const saveButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('recipes')
      expect(mockSupabase.from).toHaveBeenCalledWith('favorites')
    })
  })

  it('does not show save button for unauthenticated users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const mockRecipe = {
      title: 'Pasta with Tomatoes',
      cookTime: '30 minutes',
      calories: 450,
      ingredients: ['pasta', 'tomatoes'],
      steps: ['Cook pasta', 'Add tomatoes'],
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ recipes: [mockRecipe] }),
    })
    
    render(<Home />)
    
    const ingredientInput = screen.getByPlaceholderText('Add an ingredient...')
    const addButton = screen.getByRole('button', { name: /add/i })
    const submitButton = screen.getByRole('button', { name: /what should i cook/i })
    
    await user.type(ingredientInput, 'pasta')
    await user.click(addButton)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Pasta with Tomatoes')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /save recipe/i })).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<Home />)
    
    const ingredientInput = screen.getByPlaceholderText('Add an ingredient...')
    const addButton = screen.getByRole('button', { name: /add/i })
    const submitButton = screen.getByRole('button', { name: /what should i cook/i })
    
    await user.type(ingredientInput, 'pasta')
    await user.click(addButton)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error generating recipes:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
})