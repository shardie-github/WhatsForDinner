/**
 * Lighthouse Configuration for What's for Dinner
 * Comprehensive performance and accessibility auditing
 */

const { chromium } = require('playwright');

module.exports = {
  // Test URLs to audit
  urls: [
    'http://localhost:3000/',
    'http://localhost:3000/meals',
    'http://localhost:3000/ingredients',
    'http://localhost:3000/recipes',
    'http://localhost:3000/analytics',
    'http://localhost:3000/settings',
  ],

  // Lighthouse configuration
  lighthouse: {
    // Performance thresholds
    performance: {
      firstContentfulPaint: 2000,
      largestContentfulPaint: 2500,
      firstInputDelay: 100,
      cumulativeLayoutShift: 0.1,
      speedIndex: 3000,
      totalBlockingTime: 300,
    },

    // Accessibility thresholds
    accessibility: {
      score: 0.9,
      colorContrast: 0.9,
      keyboardNavigation: 0.9,
      screenReader: 0.9,
    },

    // Best practices thresholds
    bestPractices: {
      score: 0.9,
      https: 0.9,
      vulnerabilities: 0.9,
      mixedContent: 0.9,
    },

    // SEO thresholds
    seo: {
      score: 0.9,
      metaTags: 0.9,
      structuredData: 0.9,
      mobileFriendly: 0.9,
    },

    // PWA thresholds
    pwa: {
      score: 0.8,
      installable: 0.8,
      serviceWorker: 0.8,
      offline: 0.8,
    },
  },

  // Test configurations
  configs: {
    // Desktop configuration
    desktop: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },

    // Mobile configuration
    mobile: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false,
      },
    },

    // Slow 3G configuration
    slow3G: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 400,
        throughputKbps: 400,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false,
      },
    },
  },

  // Custom audits
  customAudits: [
    {
      name: 'meal-generation-performance',
      description: 'Meal generation API performance',
      url: 'http://localhost:3000/api/meals/generate',
      method: 'POST',
      payload: {
        meal_type: 'dinner',
        cuisine_type: 'italian',
        dietary_restrictions: ['vegetarian'],
        preferences: {
          cooking_time: 30,
          difficulty: 'medium'
        }
      },
      threshold: 5000, // 5 seconds
    },
    {
      name: 'ingredient-search-performance',
      description: 'Ingredient search performance',
      url: 'http://localhost:3000/api/ingredients?search=chicken',
      method: 'GET',
      threshold: 1000, // 1 second
    },
    {
      name: 'recipe-recommendation-performance',
      description: 'Recipe recommendation performance',
      url: 'http://localhost:3000/api/recipes/recommendations',
      method: 'POST',
      payload: {
        user_id: 'test-user',
        preferences: {
          cuisine_types: ['italian', 'mexican'],
          dietary_restrictions: ['vegetarian'],
          cooking_time: 30
        }
      },
      threshold: 3000, // 3 seconds
    },
  ],

  // Accessibility testing
  accessibility: {
    // WCAG 2.1 AA compliance
    wcag: {
      level: 'AA',
      version: '2.1',
    },

    // Color contrast testing
    colorContrast: {
      enabled: true,
      threshold: 4.5, // WCAG AA standard
    },

    // Keyboard navigation testing
    keyboardNavigation: {
      enabled: true,
      testTabOrder: true,
      testFocusManagement: true,
      testSkipLinks: true,
    },

    // Screen reader testing
    screenReader: {
      enabled: true,
      testAltText: true,
      testAriaLabels: true,
      testHeadingStructure: true,
    },

    // Custom accessibility rules
    customRules: [
      {
        id: 'meal-card-alt-text',
        description: 'Meal cards must have descriptive alt text',
        selector: '.meal-card img',
        test: (element) => {
          const altText = element.getAttribute('alt');
          return altText && altText.length > 10;
        },
      },
      {
        id: 'ingredient-list-aria-label',
        description: 'Ingredient lists must have aria-labels',
        selector: '.ingredient-list',
        test: (element) => {
          const ariaLabel = element.getAttribute('aria-label');
          return ariaLabel && ariaLabel.length > 0;
        },
      },
      {
        id: 'recipe-button-accessible',
        description: 'Recipe buttons must be accessible',
        selector: '.recipe-button',
        test: (element) => {
          const hasAriaLabel = element.getAttribute('aria-label');
          const hasText = element.textContent.trim().length > 0;
          const isFocusable = element.tabIndex >= 0;
          return (hasAriaLabel || hasText) && isFocusable;
        },
      },
    ],
  },

  // Performance monitoring
  performance: {
    // Core Web Vitals
    coreWebVitals: {
      enabled: true,
      thresholds: {
        LCP: 2500, // Largest Contentful Paint
        FID: 100,  // First Input Delay
        CLS: 0.1,  // Cumulative Layout Shift
      },
    },

    // Resource timing
    resourceTiming: {
      enabled: true,
      trackImages: true,
      trackScripts: true,
      trackStylesheets: true,
      trackFonts: true,
    },

    // Memory usage
    memoryUsage: {
      enabled: true,
      trackHeapSize: true,
      trackMemoryLeaks: true,
    },

    // Network performance
    networkPerformance: {
      enabled: true,
      trackDNS: true,
      trackTCP: true,
      trackTLS: true,
      trackRequestTime: true,
    },
  },

  // Reporting configuration
  reporting: {
    // Output formats
    formats: ['html', 'json', 'csv'],

    // Output directory
    outputDir: './lighthouse-reports',

    // Report naming
    fileName: 'lighthouse-report-{timestamp}',

    // Report sections
    sections: [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
      'pwa',
      'custom-audits',
    ],

    // Comparison with previous runs
    comparison: {
      enabled: true,
      baselineFile: './lighthouse-reports/baseline.json',
    },

    // Trend analysis
    trends: {
      enabled: true,
      historyFile: './lighthouse-reports/history.json',
      trackMetrics: [
        'performance',
        'accessibility',
        'best-practices',
        'seo',
        'pwa',
      ],
    },
  },

  // CI/CD integration
  ci: {
    // Fail build on threshold violations
    failOnThreshold: true,

    // Thresholds for CI
    thresholds: {
      performance: 0.8,
      accessibility: 0.9,
      bestPractices: 0.9,
      seo: 0.9,
      pwa: 0.8,
    },

    // Slack notification
    slack: {
      enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#lighthouse-reports',
    },

    // GitHub integration
    github: {
      enabled: process.env.GITHUB_TOKEN ? true : false,
      token: process.env.GITHUB_TOKEN,
      repository: process.env.GITHUB_REPOSITORY,
      createIssue: true,
      issueLabels: ['lighthouse', 'performance', 'accessibility'],
    },
  },

  // Custom scripts
  scripts: {
    // Pre-audit setup
    preAudit: async (page) => {
      // Login if needed
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('http://localhost:3000/');
    },

    // Post-audit cleanup
    postAudit: async (page) => {
      // Logout if needed
      await page.click('[data-testid="logout-button"]');
    },

    // Custom data collection
    collectData: async (page) => {
      const data = await page.evaluate(() => {
        return {
          mealCount: document.querySelectorAll('.meal-card').length,
          ingredientCount: document.querySelectorAll('.ingredient-item').length,
          recipeCount: document.querySelectorAll('.recipe-card').length,
          hasServiceWorker: 'serviceWorker' in navigator,
          hasWebAppManifest: document.querySelector('link[rel="manifest"]') !== null,
        };
      });
      return data;
    },
  },

  // Environment-specific configurations
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      retries: 3,
    },
    staging: {
      baseUrl: 'https://staging.whats-for-dinner.vercel.app',
      timeout: 60000,
      retries: 5,
    },
    production: {
      baseUrl: 'https://whats-for-dinner.vercel.app',
      timeout: 60000,
      retries: 5,
    },
  },
};