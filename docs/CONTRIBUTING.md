# Contributing to What's for Dinner

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Set up environment**: Copy `.env.example` to `.env.local` and fill in values
4. **Run development server**: `pnpm dev`
5. **Make your changes**
6. **Run tests**: `pnpm test`
7. **Submit a pull request**

## Development Workflow

### Before You Start

1. Check existing issues and discussions
2. Create an issue to discuss major changes
3. Get feedback before implementing

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Write tests for new functionality
4. Run the test suite: `pnpm test`
5. Check linting: `pnpm lint`
6. Check types: `pnpm typecheck`

### Code Style

- **TypeScript**: Use strict mode
- **Formatting**: Prettier (auto-formatted)
- **Linting**: ESLint (run `pnpm lint:fix`)
- **Tests**: Jest + React Testing Library

### Commit Messages

We use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run test suite** - all tests must pass
4. **Check linting** - must pass
5. **Write clear description** of changes
6. **Link related issues**

## Testing

- **Unit tests**: `pnpm test`
- **Watch mode**: `pnpm test:watch`
- **Coverage**: `pnpm test:coverage`
- **E2E tests**: `pnpm test:e2e`

## Code Review

All PRs require review. We're friendly reviewers and will help you succeed!

## Questions?

- Check the [documentation](docs/)
- Open an issue
- Ask in discussions

Thank you for contributing! 🙏
