# Browser Compatibility Testing Guide

## Overview
This guide outlines browser compatibility testing procedures for What's for Dinner application.

## Current Status
- [ ] Chrome tested
- [ ] Firefox tested
- [ ] Safari tested
- [ ] Edge tested
- [ ] Mobile browsers tested

## Target Browsers

### Desktop Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile Browsers
- Chrome Mobile (Android)
- Safari Mobile (iOS)
- Samsung Internet (Android)

## Testing Checklist

### Functionality Testing
For each browser, test:

#### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Email verification
- [ ] OAuth (if applicable)

#### Core Features
- [ ] Recipe generation
- [ ] Pantry management
- [ ] Recipe viewing
- [ ] User preferences
- [ ] Search functionality

#### Payments
- [ ] Stripe checkout flow
- [ ] Payment processing
- [ ] Subscription management

#### UI/UX
- [ ] Responsive design
- [ ] Dark mode toggle
- [ ] Theme switching
- [ ] Navigation
- [ ] Forms

### Visual Testing
- [ ] Layout renders correctly
- [ ] Colors display properly
- [ ] Fonts load correctly
- [ ] Images display
- [ ] Icons visible
- [ ] Animations work

### Performance Testing
- [ ] Page load times
- [ ] Time to Interactive (TTI)
- [ ] First Contentful Paint (FCP)
- [ ] Large Contentful Paint (LCP)
- [ ] Cumulative Layout Shift (CLS)

## Testing Tools

### BrowserStack
1. Sign up at [browserstack.com](https://www.browserstack.com)
2. Select browsers to test
3. Run automated tests
4. Generate test report

### Playwright
Already configured in project:

```bash
# Run tests on multiple browsers
pnpm exec playwright test --project=chromium --project=firefox --project=webkit
```

### Manual Testing
Use real devices/browsers:
- Chrome on Windows/Mac
- Firefox on Windows/Mac
- Safari on Mac
- Edge on Windows
- Mobile devices

## Automated Testing

### Playwright Configuration
Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### Run Tests
```bash
# Run all browser tests
pnpm exec playwright test

# Run specific browser
pnpm exec playwright test --project=chromium

# Generate report
pnpm exec playwright show-report
```

## Known Issues

### Document Browser-Specific Issues

Create `docs/browser-issues.md`:

```markdown
# Browser-Specific Issues

## Safari
- Issue: [Description]
- Status: [Open/Fixed]
- Workaround: [If applicable]

## Firefox
- Issue: [Description]
- Status: [Open/Fixed]
- Workaround: [If applicable]
```

## Testing Checklist Template

### Per Browser
```
Browser: Chrome 120
OS: Windows 11
Date: [Date]
Tester: [Name]

? Authentication works
? Recipe generation works
? Payments work
? Responsive design works
? Issue: [Description]

Notes: [Any observations]
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/browser-test.yml
name: Browser Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install
      - run: pnpm exec playwright test
```

## Performance Testing

### Lighthouse CI
```bash
# Run Lighthouse on multiple browsers
lhci autorun --collect.numberOfRuns=3
```

### Browser Performance Comparison
- Compare metrics across browsers
- Identify performance regressions
- Optimize for slower browsers

## Mobile Testing

### Devices to Test
- iPhone (latest 2 versions)
- Android phones (latest 2 versions)
- Tablets (iPad, Android tablets)

### Mobile-Specific Tests
- Touch interactions
- Swipe gestures
- Mobile keyboard
- Orientation changes
- Network conditions (3G, 4G)

## Accessibility Testing

### Per Browser
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Focus indicators
- [ ] ARIA labels

## Reporting

### Test Results Template
```
Browser Compatibility Report
Date: [Date]
Tester: [Name]

Overall Status: [Pass/Fail]

Chrome: ? Pass
Firefox: ? Pass
Safari: ?? Minor issues
Edge: ? Pass
Mobile Chrome: ? Pass
Mobile Safari: ?? Minor issues

Issues Found:
1. [Issue] - Browser: Safari - Priority: Medium
2. [Issue] - Browser: Mobile Safari - Priority: Low

Recommendations:
- [Recommendations]
```

## Polyfills

### If needed for older browsers
- [ ] Identify required polyfills
- [ ] Add polyfills
- [ ] Test in target browsers
- [ ] Monitor bundle size

## Next Steps
1. Set up Playwright for cross-browser testing
2. Create browser test suite
3. Run initial compatibility tests
4. Document issues found
5. Fix critical issues
6. Set up CI/CD integration
