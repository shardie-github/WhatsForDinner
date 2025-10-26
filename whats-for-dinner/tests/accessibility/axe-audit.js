/**
 * Axe Accessibility Audit for What's for Dinner
 * Comprehensive accessibility testing using axe-core
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Test configuration
const testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
};

// Test data
const testData = {
  users: [
    { email: 'test@example.com', password: 'password123' },
    { email: 'accessibility-test@example.com', password: 'password123' },
  ],
  testPages: [
    '/',
    '/meals',
    '/ingredients',
    '/recipes',
    '/analytics',
    '/settings',
    '/login',
    '/register',
  ],
};

// Helper function to login
async function login(page, user = testData.users[0]) {
  await page.goto(`${testConfig.baseUrl}/login`);
  await page.fill('[data-testid="email"]', user.email);
  await page.fill('[data-testid="password"]', user.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(`${testConfig.baseUrl}/`);
}

// Helper function to run axe audit
async function runAxeAudit(page, context = 'page') {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  
  return results;
}

// Helper function to check for specific accessibility issues
async function checkSpecificIssues(page, issues) {
  const results = [];
  
  for (const issue of issues) {
    const elements = await page.locator(issue.selector).all();
    
    for (const element of elements) {
      const result = await issue.test(element);
      results.push({
        selector: issue.selector,
        description: issue.description,
        passed: result,
        element: await element.textContent(),
      });
    }
  }
  
  return results;
}

// Test: Home page accessibility
test('Home page accessibility audit', async ({ page }) => {
  await page.goto(`${testConfig.baseUrl}/`);
  
  const results = await runAxeAudit(page, 'home page');
  
  expect(results.violations).toHaveLength(0);
  expect(results.passes.length).toBeGreaterThan(0);
  
  // Check specific accessibility requirements
  const specificIssues = await checkSpecificIssues(page, [
    {
      selector: 'h1',
      description: 'Page must have a main heading',
      test: async (element) => {
        const text = await element.textContent();
        return text && text.trim().length > 0;
      },
    },
    {
      selector: 'nav',
      description: 'Navigation must have proper structure',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const role = await element.getAttribute('role');
        return ariaLabel || role === 'navigation';
      },
    },
    {
      selector: 'main',
      description: 'Page must have a main content area',
      test: async (element) => {
        const role = await element.getAttribute('role');
        return role === 'main' || element.tagName.toLowerCase() === 'main';
      },
    },
  ]);
  
  specificIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Meals page accessibility
test('Meals page accessibility audit', async ({ page }) => {
  await login(page);
  await page.goto(`${testConfig.baseUrl}/meals`);
  
  const results = await runAxeAudit(page, 'meals page');
  
  expect(results.violations).toHaveLength(0);
  
  // Check meal-specific accessibility
  const mealIssues = await checkSpecificIssues(page, [
    {
      selector: '.meal-card',
      description: 'Meal cards must be keyboard accessible',
      test: async (element) => {
        const tabIndex = await element.getAttribute('tabindex');
        const role = await element.getAttribute('role');
        return tabIndex !== null || role === 'button';
      },
    },
    {
      selector: '.meal-card img',
      description: 'Meal images must have alt text',
      test: async (element) => {
        const alt = await element.getAttribute('alt');
        return alt && alt.trim().length > 0;
      },
    },
    {
      selector: '.meal-card button',
      description: 'Meal action buttons must have accessible labels',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const text = await element.textContent();
        return ariaLabel || (text && text.trim().length > 0);
      },
    },
  ]);
  
  mealIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Ingredients page accessibility
test('Ingredients page accessibility audit', async ({ page }) => {
  await login(page);
  await page.goto(`${testConfig.baseUrl}/ingredients`);
  
  const results = await runAxeAudit(page, 'ingredients page');
  
  expect(results.violations).toHaveLength(0);
  
  // Check ingredient-specific accessibility
  const ingredientIssues = await checkSpecificIssues(page, [
    {
      selector: '.ingredient-search',
      description: 'Ingredient search must have proper labels',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const placeholder = await element.getAttribute('placeholder');
        const id = await element.getAttribute('id');
        return ariaLabel || placeholder || id;
      },
    },
    {
      selector: '.ingredient-list',
      description: 'Ingredient list must have proper structure',
      test: async (element) => {
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        return role === 'list' || ariaLabel;
      },
    },
    {
      selector: '.ingredient-item',
      description: 'Ingredient items must be keyboard accessible',
      test: async (element) => {
        const tabIndex = await element.getAttribute('tabindex');
        const role = await element.getAttribute('role');
        return tabIndex !== null || role === 'listitem';
      },
    },
  ]);
  
  ingredientIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Recipes page accessibility
test('Recipes page accessibility audit', async ({ page }) => {
  await login(page);
  await page.goto(`${testConfig.baseUrl}/recipes`);
  
  const results = await runAxeAudit(page, 'recipes page');
  
  expect(results.violations).toHaveLength(0);
  
  // Check recipe-specific accessibility
  const recipeIssues = await checkSpecificIssues(page, [
    {
      selector: '.recipe-card',
      description: 'Recipe cards must be keyboard accessible',
      test: async (element) => {
        const tabIndex = await element.getAttribute('tabindex');
        const role = await element.getAttribute('role');
        return tabIndex !== null || role === 'article';
      },
    },
    {
      selector: '.recipe-card img',
      description: 'Recipe images must have alt text',
      test: async (element) => {
        const alt = await element.getAttribute('alt');
        return alt && alt.trim().length > 0;
      },
    },
    {
      selector: '.recipe-rating',
      description: 'Recipe ratings must be accessible',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const role = await element.getAttribute('role');
        return ariaLabel || role === 'img';
      },
    },
  ]);
  
  recipeIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Form accessibility
test('Form accessibility audit', async ({ page }) => {
  await page.goto(`${testConfig.baseUrl}/register`);
  
  const results = await runAxeAudit(page, 'registration form');
  
  expect(results.violations).toHaveLength(0);
  
  // Check form-specific accessibility
  const formIssues = await checkSpecificIssues(page, [
    {
      selector: 'input[type="email"]',
      description: 'Email input must have proper labels',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const id = await element.getAttribute('id');
        const label = await page.locator(`label[for="${id}"]`).count();
        return ariaLabel || label > 0;
      },
    },
    {
      selector: 'input[type="password"]',
      description: 'Password input must have proper labels',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const id = await element.getAttribute('id');
        const label = await page.locator(`label[for="${id}"]`).count();
        return ariaLabel || label > 0;
      },
    },
    {
      selector: 'button[type="submit"]',
      description: 'Submit button must have accessible text',
      test: async (element) => {
        const text = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        return (text && text.trim().length > 0) || ariaLabel;
      },
    },
  ]);
  
  formIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Keyboard navigation
test('Keyboard navigation audit', async ({ page }) => {
  await page.goto(`${testConfig.baseUrl}/`);
  
  // Test tab order
  const tabOrder = [];
  let currentElement = await page.locator(':focus').first();
  
  for (let i = 0; i < 20; i++) {
    if (await currentElement.count() > 0) {
      const tagName = await currentElement.evaluate(el => el.tagName);
      const text = await currentElement.textContent();
      tabOrder.push({ tagName, text: text?.trim() });
      
      await page.keyboard.press('Tab');
      currentElement = await page.locator(':focus').first();
    } else {
      break;
    }
  }
  
  expect(tabOrder.length).toBeGreaterThan(0);
  
  // Test skip links
  const skipLinks = await page.locator('a[href^="#"]').all();
  expect(skipLinks.length).toBeGreaterThan(0);
  
  // Test focus management
  await page.click('[data-testid="menu-button"]');
  const focusedElement = await page.locator(':focus').first();
  expect(await focusedElement.count()).toBeGreaterThan(0);
});

// Test: Color contrast
test('Color contrast audit', async ({ page }) => {
  await page.goto(`${testConfig.baseUrl}/`);
  
  const results = await runAxeAudit(page, 'color contrast');
  
  // Check for color contrast violations
  const contrastViolations = results.violations.filter(
    violation => violation.id === 'color-contrast'
  );
  
  expect(contrastViolations).toHaveLength(0);
  
  // Test specific color contrast requirements
  const contrastIssues = await checkSpecificIssues(page, [
    {
      selector: 'h1, h2, h3, h4, h5, h6',
      description: 'Headings must have sufficient color contrast',
      test: async (element) => {
        const color = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.color;
        });
        // This would need a proper color contrast calculation
        return color !== 'rgb(0, 0, 0)'; // Placeholder check
      },
    },
    {
      selector: 'button, a',
      description: 'Interactive elements must have sufficient color contrast',
      test: async (element) => {
        const color = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.color;
        });
        return color !== 'rgb(0, 0, 0)'; // Placeholder check
      },
    },
  ]);
  
  contrastIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Screen reader compatibility
test('Screen reader compatibility audit', async ({ page }) => {
  await page.goto(`${testConfig.baseUrl}/`);
  
  const results = await runAxeAudit(page, 'screen reader compatibility');
  
  expect(results.violations).toHaveLength(0);
  
  // Check screen reader specific requirements
  const screenReaderIssues = await checkSpecificIssues(page, [
    {
      selector: 'img',
      description: 'Images must have alt text or be decorative',
      test: async (element) => {
        const alt = await element.getAttribute('alt');
        const role = await element.getAttribute('role');
        return alt !== null || role === 'presentation';
      },
    },
    {
      selector: 'button, a',
      description: 'Interactive elements must have accessible names',
      test: async (element) => {
        const text = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        return (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy;
      },
    },
    {
      selector: 'form',
      description: 'Forms must have proper structure',
      test: async (element) => {
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        return role === 'form' || ariaLabel;
      },
    },
  ]);
  
  screenReaderIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Mobile accessibility
test('Mobile accessibility audit', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${testConfig.baseUrl}/`);
  
  const results = await runAxeAudit(page, 'mobile accessibility');
  
  expect(results.violations).toHaveLength(0);
  
  // Check mobile-specific accessibility
  const mobileIssues = await checkSpecificIssues(page, [
    {
      selector: 'button, a',
      description: 'Interactive elements must be touch-friendly',
      test: async (element) => {
        const size = await element.boundingBox();
        return size && size.width >= 44 && size.height >= 44;
      },
    },
    {
      selector: 'input, select, textarea',
      description: 'Form elements must be touch-friendly',
      test: async (element) => {
        const size = await element.boundingBox();
        return size && size.height >= 44;
      },
    },
  ]);
  
  mobileIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});

// Test: Dynamic content accessibility
test('Dynamic content accessibility audit', async ({ page }) => {
  await login(page);
  await page.goto(`${testConfig.baseUrl}/meals`);
  
  // Test dynamic content loading
  await page.click('[data-testid="generate-meal-button"]');
  await page.waitForSelector('.meal-card', { timeout: 10000 });
  
  const results = await runAxeAudit(page, 'dynamic content');
  
  expect(results.violations).toHaveLength(0);
  
  // Check dynamic content accessibility
  const dynamicIssues = await checkSpecificIssues(page, [
    {
      selector: '.loading-spinner',
      description: 'Loading indicators must be accessible',
      test: async (element) => {
        const ariaLabel = await element.getAttribute('aria-label');
        const role = await element.getAttribute('role');
        return ariaLabel || role === 'status';
      },
    },
    {
      selector: '.error-message',
      description: 'Error messages must be accessible',
      test: async (element) => {
        const role = await element.getAttribute('role');
        const ariaLive = await element.getAttribute('aria-live');
        return role === 'alert' || ariaLive === 'assertive';
      },
    },
  ]);
  
  dynamicIssues.forEach(issue => {
    expect(issue.passed).toBe(true);
  });
});