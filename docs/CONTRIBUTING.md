# Contributing Guide

Thank you for considering contributing to this project!

## Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-org/hardonia-app.git
   cd hardonia-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Run Doctor Check**
   ```bash
   npm run doctor
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run checks before committing:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add user profile page"
   ```

### Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Standards

### TypeScript
- Use TypeScript strict mode
- Define types for all function parameters and return values
- Avoid `any` types - use `unknown` if type is truly unknown

### Code Style
- Follow ESLint rules
- Use Prettier for formatting: `npm run format`
- Maximum line length: 100 characters

### Testing
- Write tests for new features
- Ensure tests pass: `npm test`
- Aim for >80% code coverage

### Documentation
- Update README.md if adding new features
- Add JSDoc comments for public functions
- Update API.md for API changes

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Update CHANGELOG.md with your changes
   - Update API.md for API changes

2. **Ensure CI Passes**
   - All type checks pass
   - All linting passes
   - All tests pass
   - Doctor script passes

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Include a detailed description
   - Reference any related issues
   - Add screenshots for UI changes

4. **Code Review**
   - Address review feedback
   - Keep PRs focused and small when possible
   - Rebase on main if needed

## Project Structure

```
apps/
  mobile/          # Expo React Native app
  web/             # Next.js web app
packages/          # Shared packages
supabase/
  migrations/      # Database migrations
  functions/       # Edge Functions
docs/              # Documentation
scripts/           # Utility scripts
```

## Questions?

- Open a GitHub issue for questions
- Check existing documentation first
- Review [SUPPORT.md](./SUPPORT.md)

Thank you for contributing! ??
