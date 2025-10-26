# Contributing to What's for Dinner? 🍽️

Thank you for your interest in contributing to What's for Dinner! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project follows a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn
- Git
- A Supabase account (for database access)
- An OpenAI API key (for AI features)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/whats-for-dinner.git
   cd whats-for-dinner
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original/whats-for-dinner.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Fill in your environment variables in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   npm run supabase:start
   npm run supabase:db:push
   ```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── (auth)/            # Authentication pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   └── utils/            # General utilities
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type - use specific types instead
- Use strict type checking

### React Components

- Use functional components with hooks
- Follow the component naming convention: `PascalCase`
- Use proper prop types and interfaces
- Keep components small and focused

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `camelCase.ts`

### Code Style

- Use ESLint and Prettier for consistent formatting
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

### Example Component

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExampleComponentProps {
  title: string;
  onAction: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
```

## 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add Google OAuth integration
fix(api): resolve recipe generation timeout issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(hooks): extract common logic into custom hook
test(components): add unit tests for RecipeCard
chore(deps): update dependencies
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork** with the latest changes:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following the coding standards

4. **Run tests**:
   ```bash
   npm run test
   npm run test:coverage
   ```

5. **Run linting**:
   ```bash
   npm run lint
   npm run type-check
   ```

6. **Format code**:
   ```bash
   npm run format
   ```

### Submitting a Pull Request

1. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Wait for review** and address feedback

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
```

## 🐛 Issue Guidelines

### Before Creating an Issue

1. Check if the issue already exists
2. Search the documentation
3. Try the latest version

### Creating an Issue

Use the appropriate issue template and include:

- **Clear title** describing the problem
- **Detailed description** of the issue
- **Steps to reproduce** (for bugs)
- **Expected vs actual behavior**
- **Environment details** (OS, browser, Node.js version)
- **Screenshots** (if applicable)

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Aim for good test coverage
- Use descriptive test names
- Test both happy path and edge cases

### Test Structure

```tsx
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with correct title', () => {
    render(<ExampleComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);
    
    screen.getByRole('button').click();
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and components
- Document complex algorithms and business logic
- Keep README files updated
- Update API documentation for new endpoints

### JSDoc Example

```tsx
/**
 * Generates a recipe based on provided ingredients and preferences
 * @param ingredients - Array of available ingredients
 * @param preferences - User dietary preferences
 * @returns Promise resolving to generated recipes
 */
export async function generateRecipe(
  ingredients: string[],
  preferences: string
): Promise<Recipe[]> {
  // Implementation
}
```

## 🚀 Release Process

1. **Version bump** in `package.json`
2. **Update CHANGELOG.md** with new features and fixes
3. **Create release** on GitHub
4. **Deploy** to production

## 📞 Getting Help

- **Discord**: Join our community Discord
- **GitHub Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers directly

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to What's for Dinner! 🎉