#!/usr/bin/env node

/**
 * Lighthouse Audit Script for What's for Dinner
 *
 * This script performs comprehensive Lighthouse audits including:
 * - Performance analysis
 * - Accessibility testing
 * - Best practices validation
 * - SEO optimization
 * - PWA compliance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LighthouseAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categories: {
        performance: { score: 0, issues: [] },
        accessibility: { score: 0, issues: [] },
        bestPractices: { score: 0, issues: [] },
        seo: { score: 0, issues: [] },
        pwa: { score: 0, issues: [] },
      },
      recommendations: [],
      criticalIssues: [],
      warnings: [],
    };
  }

  async runFullAudit() {
    console.log('🔍 Starting comprehensive Lighthouse audit...\n');

    try {
      await this.auditPerformance();
      await this.auditAccessibility();
      await this.auditBestPractices();
      await this.auditSEO();
      await this.auditPWA();
      await this.generateRecommendations();

      this.calculateOverallScore();
      this.generateReport();

      console.log('\n✅ Lighthouse audit completed successfully!');
      console.log(`📊 Overall Score: ${this.auditResults.overallScore}/100`);

      return this.auditResults;
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error);
      throw error;
    }
  }

  async auditPerformance() {
    console.log('⚡ Auditing performance...');

    try {
      // Run Lighthouse performance audit
      const command = `npx lighthouse http://localhost:3000 --only-categories=performance --output=json --output-path=./lighthouse-performance.json --chrome-flags="--headless"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync('./lighthouse-performance.json')) {
        const results = JSON.parse(
          fs.readFileSync('./lighthouse-performance.json', 'utf8')
        );
        const performance = results.categories.performance;

        this.auditResults.categories.performance.score = Math.round(
          performance.score * 100
        );

        // Analyze performance issues
        const audits = results.audits;
        const performanceIssues = [];

        // Check Core Web Vitals
        if (audits['largest-contentful-paint']?.score < 0.9) {
          performanceIssues.push({
            id: 'lcp',
            title: 'Largest Contentful Paint',
            description: 'LCP is too slow',
            score: audits['largest-contentful-paint'].score,
            impact: 'high',
          });
        }

        if (audits['first-input-delay']?.score < 0.9) {
          performanceIssues.push({
            id: 'fid',
            title: 'First Input Delay',
            description: 'FID is too slow',
            score: audits['first-input-delay'].score,
            impact: 'high',
          });
        }

        if (audits['cumulative-layout-shift']?.score < 0.9) {
          performanceIssues.push({
            id: 'cls',
            title: 'Cumulative Layout Shift',
            description: 'CLS is too high',
            score: audits['cumulative-layout-shift'].score,
            impact: 'high',
          });
        }

        // Check other performance metrics
        if (audits['first-contentful-paint']?.score < 0.9) {
          performanceIssues.push({
            id: 'fcp',
            title: 'First Contentful Paint',
            description: 'FCP is too slow',
            score: audits['first-contentful-paint'].score,
            impact: 'medium',
          });
        }

        if (audits['speed-index']?.score < 0.9) {
          performanceIssues.push({
            id: 'speed-index',
            title: 'Speed Index',
            description: 'Speed Index is too slow',
            score: audits['speed-index'].score,
            impact: 'medium',
          });
        }

        this.auditResults.categories.performance.issues = performanceIssues;
      }

      console.log('✅ Performance audit completed');
    } catch (error) {
      console.error('❌ Performance audit failed:', error.message);
    }
  }

  async auditAccessibility() {
    console.log('♿ Auditing accessibility...');

    try {
      // Run Lighthouse accessibility audit
      const command = `npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json --output-path=./lighthouse-accessibility.json --chrome-flags="--headless"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync('./lighthouse-accessibility.json')) {
        const results = JSON.parse(
          fs.readFileSync('./lighthouse-accessibility.json', 'utf8')
        );
        const accessibility = results.categories.accessibility;

        this.auditResults.categories.accessibility.score = Math.round(
          accessibility.score * 100
        );

        // Analyze accessibility issues
        const audits = results.audits;
        const accessibilityIssues = [];

        // Check common accessibility issues
        if (audits['color-contrast']?.score < 1) {
          accessibilityIssues.push({
            id: 'color-contrast',
            title: 'Color Contrast',
            description: 'Text has insufficient color contrast',
            score: audits['color-contrast'].score,
            impact: 'high',
          });
        }

        if (audits['image-alt']?.score < 1) {
          accessibilityIssues.push({
            id: 'image-alt',
            title: 'Image Alt Text',
            description: 'Images are missing alt text',
            score: audits['image-alt'].score,
            impact: 'high',
          });
        }

        if (audits['button-name']?.score < 1) {
          accessibilityIssues.push({
            id: 'button-name',
            title: 'Button Labels',
            description: 'Buttons are missing accessible names',
            score: audits['button-name'].score,
            impact: 'high',
          });
        }

        if (audits['heading-order']?.score < 1) {
          accessibilityIssues.push({
            id: 'heading-order',
            title: 'Heading Order',
            description: 'Headings are not in logical order',
            score: audits['heading-order'].score,
            impact: 'medium',
          });
        }

        this.auditResults.categories.accessibility.issues = accessibilityIssues;
      }

      console.log('✅ Accessibility audit completed');
    } catch (error) {
      console.error('❌ Accessibility audit failed:', error.message);
    }
  }

  async auditBestPractices() {
    console.log('✅ Auditing best practices...');

    try {
      // Run Lighthouse best practices audit
      const command = `npx lighthouse http://localhost:3000 --only-categories=best-practices --output=json --output-path=./lighthouse-best-practices.json --chrome-flags="--headless"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync('./lighthouse-best-practices.json')) {
        const results = JSON.parse(
          fs.readFileSync('./lighthouse-best-practices.json', 'utf8')
        );
        const bestPractices = results.categories['best-practices'];

        this.auditResults.categories.bestPractices.score = Math.round(
          bestPractices.score * 100
        );

        // Analyze best practices issues
        const audits = results.audits;
        const bestPracticesIssues = [];

        // Check security issues
        if (audits['is-on-https']?.score < 1) {
          bestPracticesIssues.push({
            id: 'https',
            title: 'HTTPS',
            description: 'Site is not served over HTTPS',
            score: audits['is-on-https'].score,
            impact: 'high',
          });
        }

        if (audits['no-vulnerable-libraries']?.score < 1) {
          bestPracticesIssues.push({
            id: 'vulnerable-libraries',
            title: 'Vulnerable Libraries',
            description: 'Site uses vulnerable JavaScript libraries',
            score: audits['no-vulnerable-libraries'].score,
            impact: 'high',
          });
        }

        if (audits['no-mixed-content']?.score < 1) {
          bestPracticesIssues.push({
            id: 'mixed-content',
            title: 'Mixed Content',
            description: 'Site has mixed content issues',
            score: audits['no-mixed-content'].score,
            impact: 'medium',
          });
        }

        this.auditResults.categories.bestPractices.issues = bestPracticesIssues;
      }

      console.log('✅ Best practices audit completed');
    } catch (error) {
      console.error('❌ Best practices audit failed:', error.message);
    }
  }

  async auditSEO() {
    console.log('🔍 Auditing SEO...');

    try {
      // Run Lighthouse SEO audit
      const command = `npx lighthouse http://localhost:3000 --only-categories=seo --output=json --output-path=./lighthouse-seo.json --chrome-flags="--headless"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync('./lighthouse-seo.json')) {
        const results = JSON.parse(
          fs.readFileSync('./lighthouse-seo.json', 'utf8')
        );
        const seo = results.categories.seo;

        this.auditResults.categories.seo.score = Math.round(seo.score * 100);

        // Analyze SEO issues
        const audits = results.audits;
        const seoIssues = [];

        // Check meta tags
        if (audits['meta-description']?.score < 1) {
          seoIssues.push({
            id: 'meta-description',
            title: 'Meta Description',
            description: 'Page is missing a meta description',
            score: audits['meta-description'].score,
            impact: 'medium',
          });
        }

        if (audits['document-title']?.score < 1) {
          seoIssues.push({
            id: 'document-title',
            title: 'Document Title',
            description: 'Page is missing a title element',
            score: audits['document-title'].score,
            impact: 'high',
          });
        }

        if (audits['hreflang']?.score < 1) {
          seoIssues.push({
            id: 'hreflang',
            title: 'Hreflang',
            description: 'Page is missing hreflang tags',
            score: audits['hreflang'].score,
            impact: 'low',
          });
        }

        this.auditResults.categories.seo.issues = seoIssues;
      }

      console.log('✅ SEO audit completed');
    } catch (error) {
      console.error('❌ SEO audit failed:', error.message);
    }
  }

  async auditPWA() {
    console.log('📱 Auditing PWA compliance...');

    try {
      // Run Lighthouse PWA audit
      const command = `npx lighthouse http://localhost:3000 --only-categories=pwa --output=json --output-path=./lighthouse-pwa.json --chrome-flags="--headless"`;
      execSync(command, { stdio: 'pipe' });

      if (fs.existsSync('./lighthouse-pwa.json')) {
        const results = JSON.parse(
          fs.readFileSync('./lighthouse-pwa.json', 'utf8')
        );
        const pwa = results.categories.pwa;

        this.auditResults.categories.pwa.score = Math.round(pwa.score * 100);

        // Analyze PWA issues
        const audits = results.audits;
        const pwaIssues = [];

        // Check PWA requirements
        if (audits['installable-manifest']?.score < 1) {
          pwaIssues.push({
            id: 'manifest',
            title: 'Web App Manifest',
            description: 'App is missing a web app manifest',
            score: audits['installable-manifest'].score,
            impact: 'high',
          });
        }

        if (audits['service-worker']?.score < 1) {
          pwaIssues.push({
            id: 'service-worker',
            title: 'Service Worker',
            description: 'App is missing a service worker',
            score: audits['service-worker'].score,
            impact: 'high',
          });
        }

        if (audits['themed-omnibox']?.score < 1) {
          pwaIssues.push({
            id: 'themed-omnibox',
            title: 'Themed Omnibox',
            description: 'App is missing theme color for browser UI',
            score: audits['themed-omnibox'].score,
            impact: 'low',
          });
        }

        this.auditResults.categories.pwa.issues = pwaIssues;
      }

      console.log('✅ PWA audit completed');
    } catch (error) {
      console.error('❌ PWA audit failed:', error.message);
    }
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // Performance recommendations
    if (this.auditResults.categories.performance.score < 90) {
      recommendations.push({
        category: 'Performance',
        priority: 'high',
        title: 'Optimize Core Web Vitals',
        description:
          'Improve LCP, FID, and CLS scores for better user experience',
        actions: [
          'Optimize images and use modern formats (WebP, AVIF)',
          'Implement lazy loading for images and components',
          'Minimize JavaScript and CSS',
          'Use a CDN for static assets',
        ],
      });
    }

    // Accessibility recommendations
    if (this.auditResults.categories.accessibility.score < 90) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'high',
        title: 'Improve Accessibility',
        description: 'Make the app more accessible to users with disabilities',
        actions: [
          'Add alt text to all images',
          'Ensure proper color contrast ratios',
          'Add ARIA labels to interactive elements',
          'Implement keyboard navigation',
        ],
      });
    }

    // PWA recommendations
    if (this.auditResults.categories.pwa.score < 90) {
      recommendations.push({
        category: 'PWA',
        priority: 'medium',
        title: 'Enhance PWA Features',
        description: 'Improve Progressive Web App capabilities',
        actions: [
          'Add web app manifest',
          'Implement service worker for offline support',
          'Add theme colors and icons',
          'Enable push notifications',
        ],
      });
    }

    this.auditResults.recommendations = recommendations;

    console.log('✅ Recommendations generated');
  }

  calculateOverallScore() {
    const scores = Object.values(this.auditResults.categories).map(
      category => category.score
    );
    this.auditResults.overallScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }

  generateReport() {
    const report = {
      ...this.auditResults,
      summary: {
        overallScore: this.auditResults.overallScore,
        performanceScore: this.auditResults.categories.performance.score,
        accessibilityScore: this.auditResults.categories.accessibility.score,
        bestPracticesScore: this.auditResults.categories.bestPractices.score,
        seoScore: this.auditResults.categories.seo.score,
        pwaScore: this.auditResults.categories.pwa.score,
      },
    };

    // Write report to file
    fs.writeFileSync(
      'LIGHTHOUSE_AUDIT_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync('LIGHTHOUSE_AUDIT_REPORT.md', markdownReport);

    console.log('\n📊 Lighthouse audit report generated:');
    console.log('  - LIGHTHOUSE_AUDIT_REPORT.json');
    console.log('  - LIGHTHOUSE_AUDIT_REPORT.md');
  }

  generateMarkdownReport(report) {
    return `# Lighthouse Audit Report

**Generated:** ${report.timestamp}
**Overall Score:** ${report.overallScore}/100

## Summary

- **Performance:** ${report.summary.performanceScore}/100
- **Accessibility:** ${report.summary.accessibilityScore}/100
- **Best Practices:** ${report.summary.bestPracticesScore}/100
- **SEO:** ${report.summary.seoScore}/100
- **PWA:** ${report.summary.pwaScore}/100

## Performance Issues

${report.categories.performance.issues
  .map(
    issue => `### ${issue.title}
- **Description:** ${issue.description}
- **Score:** ${Math.round(issue.score * 100)}/100
- **Impact:** ${issue.impact}
`
  )
  .join('\n')}

## Accessibility Issues

${report.categories.accessibility.issues
  .map(
    issue => `### ${issue.title}
- **Description:** ${issue.description}
- **Score:** ${Math.round(issue.score * 100)}/100
- **Impact:** ${issue.impact}
`
  )
  .join('\n')}

## Best Practices Issues

${report.categories.bestPractices.issues
  .map(
    issue => `### ${issue.title}
- **Description:** ${issue.description}
- **Score:** ${Math.round(issue.score * 100)}/100
- **Impact:** ${issue.impact}
`
  )
  .join('\n')}

## SEO Issues

${report.categories.seo.issues
  .map(
    issue => `### ${issue.title}
- **Description:** ${issue.description}
- **Score:** ${Math.round(issue.score * 100)}/100
- **Impact:** ${issue.impact}
`
  )
  .join('\n')}

## PWA Issues

${report.categories.pwa.issues
  .map(
    issue => `### ${issue.title}
- **Description:** ${issue.description}
- **Score:** ${Math.round(issue.score * 100)}/100
- **Impact:** ${issue.impact}
`
  )
  .join('\n')}

## Recommendations

${report.recommendations
  .map(
    rec => `### ${rec.title}
- **Category:** ${rec.category}
- **Priority:** ${rec.priority}
- **Description:** ${rec.description}
- **Actions:**
${rec.actions.map(action => `  - ${action}`).join('\n')}
`
  )
  .join('\n')}

---
*This report was generated automatically by the Lighthouse Audit Script*
`;
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const auditor = new LighthouseAuditor();
  auditor
    .runFullAudit()
    .then(results => {
      console.log('\n✅ Lighthouse audit completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Lighthouse audit failed:', error);
      process.exit(1);
    });
}

module.exports = LighthouseAuditor;
