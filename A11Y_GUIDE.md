# Accessibility Guide (WCAG 2.2 AA)

This guide covers accessibility best practices, testing, and compliance for What's For Dinner, ensuring an inclusive experience for all users.

## Overview

Accessibility (a11y) ensures that our application is usable by people with disabilities, including:
- Visual impairments (blindness, low vision, color blindness)
- Motor impairments (limited dexterity, paralysis)
- Cognitive impairments (learning disabilities, attention disorders)
- Hearing impairments (deafness, hard of hearing)

## WCAG 2.2 AA Compliance

We follow the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards:

### 1. Perceivable
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Alt Text**: Descriptive alternative text for images
- **Audio/Video**: Captions and transcripts for multimedia
- **Responsive Design**: Content adapts to different screen sizes

### 2. Operable
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Focus Management**: Clear focus indicators and logical tab order
- **No Seizures**: No content that flashes more than 3 times per second
- **Navigation**: Consistent navigation and clear page titles

### 3. Understandable
- **Readable**: Clear, simple language and proper heading structure
- **Predictable**: Consistent navigation and functionality
- **Input Assistance**: Clear labels, error messages, and help text

### 4. Robust
- **Compatible**: Works with assistive technologies
- **Valid HTML**: Proper semantic markup
- **Future-proof**: Standards-compliant code

## Quick Start

### 1. Run Accessibility Tests

```bash
# Run all accessibility tests
pnpm run a11y

# Test specific page
node scripts/a11y-test.js --page /dashboard

# Test with custom threshold
node scripts/a11y-test.js --threshold 5
```

### 2. Manual Testing

```bash
# Start development server
pnpm run dev

# Test with keyboard only
# Tab through all interactive elements

# Test with screen reader
# Use NVDA, JAWS, or VoiceOver
```

## Testing Tools

### Automated Testing

#### axe-core
- Comprehensive accessibility testing
- WCAG 2.2 AA compliance
- Integration with CI/CD

```bash
# Install axe-core
npm install --save-dev axe-core

# Run axe tests
npx axe http://localhost:3000
```

#### pa11y
- Command-line accessibility testing
- Multiple standards support
- Detailed reporting

```bash
# Install pa11y
npm install --save-dev pa11y

# Run pa11y tests
npx pa11y http://localhost:3000
```

### Manual Testing

#### Keyboard Navigation
1. Tab through all interactive elements
2. Ensure logical tab order
3. Verify focus indicators are visible
4. Test all keyboard shortcuts

#### Screen Reader Testing
1. Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
2. Navigate through content using screen reader commands
3. Verify all content is announced correctly
4. Test form interactions and error messages

#### Color Contrast Testing
1. Use WebAIM Contrast Checker
2. Test all text against background colors
3. Verify color is not the only way to convey information

## Implementation Guidelines

### 1. Semantic HTML

#### Use Proper Heading Structure
```html
<!-- Good -->
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>

<!-- Bad -->
<div class="title">Page Title</div>
  <div class="section">Section Title</div>
```

#### Use Semantic Elements
```html
<!-- Good -->
<main>
  <section>
    <article>
      <header>
        <h1>Article Title</h1>
      </header>
      <p>Article content...</p>
    </article>
  </section>
</main>

<!-- Bad -->
<div>
  <div>
    <div>
      <div>Article Title</div>
      <div>Article content...</div>
    </div>
  </div>
</div>
```

### 2. Form Accessibility

#### Proper Labeling
```html
<!-- Good -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" required>

<!-- Bad -->
<div>Email Address</div>
<input type="email" name="email" required>
```

#### Error Messages
```html
<!-- Good -->
<label for="password">Password</label>
<input type="password" id="password" name="password" aria-describedby="password-error" aria-invalid="true">
<div id="password-error" role="alert">Password must be at least 8 characters</div>

<!-- Bad -->
<label for="password">Password</label>
<input type="password" id="password" name="password">
<div>Password must be at least 8 characters</div>
```

### 3. Interactive Elements

#### Buttons
```html
<!-- Good -->
<button type="submit" aria-label="Submit meal preferences">
  <span class="sr-only">Submit</span>
  <svg aria-hidden="true">...</svg>
</button>

<!-- Bad -->
<div onclick="submitForm()">Submit</div>
```

#### Links
```html
<!-- Good -->
<a href="/meals" aria-label="View meal recommendations">
  View Meals
</a>

<!-- Bad -->
<a href="/meals">Click here</a>
```

### 4. Images and Media

#### Alt Text
```html
<!-- Good -->
<img src="meal.jpg" alt="Grilled salmon with roasted vegetables and quinoa">

<!-- Bad -->
<img src="meal.jpg" alt="food">
<img src="meal.jpg" alt="">
```

#### Decorative Images
```html
<!-- Good -->
<img src="decoration.jpg" alt="" role="presentation">

<!-- Bad -->
<img src="decoration.jpg" alt="decoration">
```

### 5. Color and Contrast

#### Color Contrast
```css
/* Good - 4.5:1 contrast ratio */
.text {
  color: #000000;
  background-color: #ffffff;
}

/* Bad - 2.1:1 contrast ratio */
.text {
  color: #666666;
  background-color: #ffffff;
}
```

#### Don't Rely on Color Alone
```html
<!-- Good -->
<span class="error" aria-label="Error: ">Required field</span>

<!-- Bad -->
<span class="error">Required field</span>
```

### 6. Focus Management

#### Focus Indicators
```css
/* Good - Visible focus indicator */
button:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}

/* Bad - No focus indicator */
button:focus {
  outline: none;
}
```

#### Skip Links
```html
<!-- Good -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<main id="main-content">
  <!-- Main content -->
</main>
```

## React/Next.js Specific

### 1. ARIA Attributes

```tsx
// Good
<button
  aria-expanded={isOpen}
  aria-controls="menu"
  aria-haspopup="true"
  onClick={toggleMenu}
>
  Menu
</button>

// Bad
<button onClick={toggleMenu}>
  Menu
</button>
```

### 2. Focus Management

```tsx
// Good
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {/* Modal content */}
    </div>
  );
}
```

### 3. Screen Reader Only Content

```tsx
// Good
const ScreenReaderOnly = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Usage
<button>
  <ScreenReaderOnly>Add to favorites</ScreenReaderOnly>
  <HeartIcon aria-hidden="true" />
</button>
```

### 4. Form Validation

```tsx
// Good
function EmailInput() {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        aria-describedby={error ? "email-error" : undefined}
        aria-invalid={!isValid}
        onChange={handleChange}
      />
      {error && (
        <div id="email-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
```

## Testing Checklist

### Automated Testing
- [ ] Run axe-core tests
- [ ] Run pa11y tests
- [ ] Check color contrast ratios
- [ ] Validate HTML markup
- [ ] Test keyboard navigation

### Manual Testing
- [ ] Test with screen reader
- [ ] Test with keyboard only
- [ ] Test with high contrast mode
- [ ] Test with zoom up to 200%
- [ ] Test with different input methods

### User Testing
- [ ] Test with real users with disabilities
- [ ] Gather feedback on usability
- [ ] Test with assistive technologies
- [ ] Validate with accessibility experts

## Common Issues and Solutions

### 1. Color Contrast
**Issue**: Text doesn't meet contrast requirements
**Solution**: Use WebAIM Contrast Checker to find compliant colors

### 2. Missing Alt Text
**Issue**: Images without descriptive alt text
**Solution**: Add meaningful alt text or mark as decorative

### 3. Keyboard Navigation
**Issue**: Some elements not keyboard accessible
**Solution**: Ensure all interactive elements are focusable

### 4. Focus Management
**Issue**: Focus not visible or logical
**Solution**: Add visible focus indicators and logical tab order

### 5. Form Labels
**Issue**: Form controls not properly labeled
**Solution**: Associate labels with form controls

## Tools and Resources

### Testing Tools
- **axe-core**: Automated accessibility testing
- **pa11y**: Command-line accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built-in accessibility auditing

### Screen Readers
- **NVDA**: Free screen reader for Windows
- **JAWS**: Commercial screen reader for Windows
- **VoiceOver**: Built-in screen reader for Mac/iOS
- **TalkBack**: Built-in screen reader for Android

### Browser Extensions
- **axe DevTools**: Browser extension for testing
- **WAVE**: Web accessibility evaluation extension
- **Color Contrast Analyzer**: Check color contrast ratios

### Online Tools
- **WebAIM Contrast Checker**: Check color contrast
- **W3C Markup Validator**: Validate HTML markup
- **WAVE Web Accessibility Evaluator**: Online testing tool

## CI/CD Integration

### GitHub Actions
```yaml
- name: Accessibility Tests
  run: pnpm run a11y
  if: github.event_name == 'pull_request'
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm run a11y"
    }
  }
}
```

## Monitoring and Reporting

### Weekly Reports
- Accessibility test results
- Violation trends
- Improvement recommendations
- User feedback

### Metrics
- Test coverage percentage
- Violation count by type
- Page compliance status
- User satisfaction scores

## Training and Resources

### Team Training
- WCAG 2.2 guidelines
- Testing tools and techniques
- User experience considerations
- Legal requirements

### Documentation
- Accessibility standards
- Testing procedures
- Common issues and solutions
- Best practices

## Legal Compliance

### ADA Compliance
- Americans with Disabilities Act
- Section 508 compliance
- WCAG 2.2 AA standards

### International Standards
- EN 301 549 (Europe)
- JIS X 8341 (Japan)
- AS EN 301 549 (Australia)

## Success Metrics

### Technical Metrics
- 100% WCAG 2.2 AA compliance
- 0 critical accessibility violations
- < 5 warnings per page
- 100% keyboard navigation coverage

### User Metrics
- Screen reader compatibility
- User satisfaction scores
- Task completion rates
- Error rates

## Getting Help

### Internal Resources
- Accessibility team
- Design system guidelines
- Testing procedures
- Training materials

### External Resources
- WebAIM community
- A11y Project
- W3C WAI guidelines
- Accessibility conferences

This guide provides a comprehensive foundation for building accessible applications that work for everyone.