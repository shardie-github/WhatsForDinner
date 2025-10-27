# Developer Experience (DX) Guide

This guide covers development practices, tooling, and workflows for the What's For Dinner monorepo.

## Development Philosophy

- **Consistency**: Standardized scripts, linting, and formatting across all packages
- **Reliability**: Comprehensive testing and type checking
- **Performance**: Built-in performance monitoring and optimization
- **Accessibility**: WCAG 2.2 AA compliance built-in
- **Security**: Automated security scanning and dependency management

## Package Scripts Standardization

All packages follow the same script naming convention:

### Core Scripts
- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Run tests with coverage
- `test:ci` - Run tests for CI
- `lint` - Lint code
- `lint:fix` - Fix linting issues
- `type-check` - TypeScript type checking

### Quality Scripts
- `doctor` - Environment health check
- `a11y` - Accessibility testing
- `perf:analyze` - Performance analysis
- `security:audit` - Security audit

### Release Scripts
- `release` - Create release
- `format` - Format code
- `format:check` - Check formatting

## Development Workflow

### 1. Environment Setup
```bash
# Run preflight checks
pnpm run dev:doctor

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local
```

### 2. Daily Development
```bash
# Start development
pnpm run dev

# In another terminal, run tests
pnpm run test:watch

# Check code quality
pnpm run lint
pnpm run type-check
```

### 3. Before Committing
```bash
# Run full quality suite
pnpm run doctor
pnpm run test:ci
pnpm run lint
pnpm run type-check
pnpm run a11y
pnpm run perf:analyze
```

### 4. Code Review Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] Accessibility tests pass
- [ ] Performance budgets respected
- [ ] Security scan clean
- [ ] Documentation updated

## Tooling Configuration

### TypeScript
- Strict mode enabled
- Path mapping for clean imports
- Shared tsconfig for consistency

### ESLint
- Next.js recommended rules
- Accessibility rules (jsx-a11y)
- Prettier integration
- Import sorting

### Prettier
- Consistent formatting
- Tailwind CSS class sorting
- Markdown formatting

### Jest
- TypeScript support
- React Testing Library
- Coverage reporting
- Watch mode for development

## Performance Monitoring

### Built-in Tools
- Lighthouse CI integration
- Bundle size analysis
- Core Web Vitals monitoring
- Performance budgets

### Usage
```bash
# Analyze performance
pnpm run perf:analyze

# Monitor in development
pnpm run perf:monitor

# Generate Lighthouse report
pnpm run perf:lighthouse
```

## Accessibility (a11y)

### Standards
- WCAG 2.2 AA compliance
- Automated testing with axe-core
- Manual testing checklist

### Tools
```bash
# Run accessibility tests
pnpm run a11y

# Check specific pages
npx pa11y http://localhost:3000
```

## Security

### Automated Scans
- Dependency vulnerability scanning
- Secret detection
- Security headers validation

### Commands
```bash
# Full security audit
pnpm run security:audit

# Dependency scan
pnpm run security:deps

# Secret scan
pnpm run security:secrets

# Headers validation
pnpm run security:headers
```

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Utility function testing
- Hook testing

### Integration Tests
- API route testing
- Database integration
- Authentication flows

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile testing

### Performance Tests
- Load testing
- Stress testing
- Memory leak detection

## Code Organization

### File Naming
- `kebab-case` for files and directories
- `PascalCase` for React components
- `camelCase` for functions and variables

### Import Organization
1. Node modules
2. Internal packages
3. Relative imports
4. Type-only imports last

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  title: string;
  onClick: () => void;
}

// 3. Component
export function MyComponent({ title, onClick }: Props) {
  // 4. Hooks
  // 5. Event handlers
  // 6. Render
  return <Button onClick={onClick}>{title}</Button>;
}
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance
- `docs/description` - Documentation

### Commit Messages
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Pull Request Template
- Description of changes
- Testing instructions
- Screenshots (if UI changes)
- Breaking changes
- Checklist completion

## Debugging

### Development Tools
- React DevTools
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console for logging

### Common Issues
1. **Port conflicts**: Check `pnpm run dev:doctor`
2. **Environment variables**: Verify `.env.local`
3. **Type errors**: Run `pnpm run type-check`
4. **Build failures**: Check `pnpm run build`

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
pnpm run perf:analyze

# Check for duplicates
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

### Image Optimization
- Use Next.js Image component
- Optimize formats (WebP, AVIF)
- Responsive images with srcset
- Lazy loading

### Code Splitting
- Dynamic imports for large components
- Route-based splitting
- Library splitting

## Monitoring & Observability

### Logging
- Structured logging with correlation IDs
- PII redaction
- Log levels (debug, info, warn, error)

### Metrics
- Performance metrics
- Error rates
- User interactions
- Business metrics

### Alerts
- Error rate thresholds
- Performance degradation
- Security incidents

## Troubleshooting

### Common Commands
```bash
# Clear all caches
pnpm run clean
rm -rf node_modules
pnpm install

# Reset Supabase
pnpm run supabase:reset

# Check environment
pnpm run dev:doctor
```

### Getting Help
1. Check this guide
2. Search existing issues
3. Ask in team chat
4. Create a new issue

## Continuous Improvement

### Regular Reviews
- Weekly DX retrospectives
- Monthly tooling updates
- Quarterly architecture reviews

### Feedback Loop
- Developer surveys
- Performance metrics
- Error tracking
- User feedback

This guide is living documentation. Please contribute improvements and updates!