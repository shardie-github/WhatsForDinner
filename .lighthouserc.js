/**
 * Phase 2: Performance & UX Stability
 * Lighthouse CI Configuration
 * 
 * Validates performance budgets and Core Web Vitals in CI/CD
 */

module.exports = {
  ci: {
    collect: {
      url: [
        process.env.DEPLOY_URL || 'http://localhost:3000',
      ],
      numberOfRuns: 3, // Run 3 times for stability
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu',
        // Phase 2: Performance budgets
        budgets: [
          {
            path: '/',
            resourceSizes: [
              {
                resourceType: 'javascript',
                budget: 250000, // 250KB
              },
              {
                resourceType: 'css',
                budget: 50,000, // 50KB
              },
              {
                resourceType: 'image',
                budget: 1,000,000, // 1MB
              },
            ],
            resourceCounts: [
              {
                resourceType: 'third-party',
                budget: 10,
              },
            ],
          },
        ],
      },
    },
    assert: {
      // Phase 2: Core Web Vitals assertions
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }], // 90% minimum
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals budgets
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'max-potential-fid': ['error', { maxNumericValue: 100 }], // < 100ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // < 1.8s
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Bundle size checks
        'uses-responsive-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'offscreen-images': 'warn',
        
        // Code splitting
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
