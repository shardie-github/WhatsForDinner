#!/usr/bin/env node

/**
 * Comprehensive Accessibility Audit Script
 *
 * This script performs accessibility audits including:
 * - WCAG 2.1 AA compliance checking
 * - Color contrast validation
 * - Keyboard navigation testing
 * - Screen reader compatibility
 * - Focus management validation
 * - ARIA attributes verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AccessibilityAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: [],
      score: 0,
      wcagLevel: 'AA',
    };
  }

  async runFullAudit() {
    console.log('♿ Starting Comprehensive Accessibility Audit...\n');

    try {
      await this.checkColorContrast();
      await this.analyzeARIA();
      await this.checkKeyboardNavigation();
      await this.validateFocusManagement();
      await this.checkSemanticHTML();
      await this.analyzeImages();
      await this.checkForms();
      await this.validateHeadings();
      await this.checkLanguageAttributes();
      await this.analyzeInteractiveElements();

      this.calculateAccessibilityScore();
      this.generateReport();
    } catch (error) {
      console.error('❌ Accessibility audit failed:', error.message);
      process.exit(1);
    }
  }

  async checkColorContrast() {
    console.log('🎨 Checking color contrast...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts', '.css']);

    const contrastIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Look for color definitions
      const colorMatches = content.match(
        /(?:color|background-color|border-color):\s*([^;]+)/gi
      );

      if (colorMatches) {
        for (const match of colorMatches) {
          const color = match.split(':')[1].trim();

          // Basic contrast check (simplified)
          if (this.isLowContrastColor(color)) {
            contrastIssues.push({
              file: path.relative(process.cwd(), file),
              color,
              issue: 'Potential low contrast color',
              severity: 'medium',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...contrastIssues);
    console.log(`   Found ${contrastIssues.length} potential contrast issues`);
  }

  async analyzeARIA() {
    console.log('🔍 Analyzing ARIA attributes...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const ariaIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for missing ARIA labels on interactive elements
      const interactiveElements = content.match(
        /<(button|input|select|textarea|a)(?![^>]*aria-label)[^>]*>/gi
      );

      if (interactiveElements) {
        for (const element of interactiveElements) {
          // Skip if it has visible text content
          if (!this.hasVisibleText(element)) {
            ariaIssues.push({
              file: path.relative(process.cwd(), file),
              element,
              issue: 'Interactive element missing ARIA label',
              severity: 'high',
            });
          }
        }
      }

      // Check for invalid ARIA attributes
      const invalidAria = content.match(/aria-[a-z-]+="[^"]*"/gi);

      if (invalidAria) {
        for (const attr of invalidAria) {
          if (!this.isValidARIAAttribute(attr)) {
            ariaIssues.push({
              file: path.relative(process.cwd(), file),
              attribute: attr,
              issue: 'Invalid ARIA attribute',
              severity: 'medium',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...ariaIssues);
    console.log(`   Found ${ariaIssues.length} ARIA issues`);
  }

  async checkKeyboardNavigation() {
    console.log('⌨️  Checking keyboard navigation...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const keyboardIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for elements that should be focusable but aren't
      const clickableElements = content.match(/onClick\s*=\s*{/gi);

      if (clickableElements) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].includes('onClick') &&
            !lines[i].includes('onKeyDown') &&
            !lines[i].includes('onKeyPress')
          ) {
            // Check if it's a div or span (should be button or have tabIndex)
            if (lines[i].includes('<div') || lines[i].includes('<span')) {
              keyboardIssues.push({
                file: path.relative(process.cwd(), file),
                line: i + 1,
                issue: 'Clickable element missing keyboard support',
                severity: 'high',
              });
            }
          }
        }
      }

      // Check for missing tabIndex on custom interactive elements
      const customInteractive = content.match(/<div[^>]*onClick[^>]*>/gi);

      if (customInteractive) {
        for (const element of customInteractive) {
          if (!element.includes('tabIndex')) {
            keyboardIssues.push({
              file: path.relative(process.cwd(), file),
              element,
              issue: 'Custom interactive element missing tabIndex',
              severity: 'high',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...keyboardIssues);
    console.log(`   Found ${keyboardIssues.length} keyboard navigation issues`);
  }

  async validateFocusManagement() {
    console.log('🎯 Validating focus management...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const focusIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for modal dialogs without focus management
      const modals = content.match(/<div[^>]*role="dialog"[^>]*>/gi);

      if (modals) {
        for (const modal of modals) {
          if (
            !content.includes('focus-trap') &&
            !content.includes('useFocusTrap')
          ) {
            focusIssues.push({
              file: path.relative(process.cwd(), file),
              element: modal,
              issue: 'Modal dialog missing focus trap',
              severity: 'high',
            });
          }
        }
      }

      // Check for skip links
      if (
        content.includes('main') &&
        !content.includes('skip') &&
        !content.includes('Skip')
      ) {
        focusIssues.push({
          file: path.relative(process.cwd(), file),
          issue: 'Missing skip to main content link',
          severity: 'medium',
        });
      }
    }

    this.auditResults.issues.push(...focusIssues);
    console.log(`   Found ${focusIssues.length} focus management issues`);
  }

  async checkSemanticHTML() {
    console.log('📝 Checking semantic HTML...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const semanticIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for proper heading hierarchy
      const headings = content.match(/<h[1-6][^>]*>/gi);

      if (headings) {
        let lastLevel = 0;
        for (const heading of headings) {
          const level = parseInt(heading.match(/<h([1-6])/)[1]);

          if (level > lastLevel + 1) {
            semanticIssues.push({
              file: path.relative(process.cwd(), file),
              heading,
              issue: 'Heading level skipped',
              severity: 'medium',
            });
          }

          lastLevel = level;
        }
      }

      // Check for proper list structure
      const lists = content.match(/<ul[^>]*>.*?<\/ul>/gis);

      if (lists) {
        for (const list of lists) {
          if (!list.includes('<li')) {
            semanticIssues.push({
              file: path.relative(process.cwd(), file),
              list,
              issue: 'List missing list items',
              severity: 'high',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...semanticIssues);
    console.log(`   Found ${semanticIssues.length} semantic HTML issues`);
  }

  async analyzeImages() {
    console.log('🖼️  Analyzing images...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const imageIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for images without alt text
      const images = content.match(/<img[^>]*>/gi);

      if (images) {
        for (const img of images) {
          if (!img.includes('alt=') && !img.includes('aria-label=')) {
            imageIssues.push({
              file: path.relative(process.cwd(), file),
              image: img,
              issue: 'Image missing alt text',
              severity: 'high',
            });
          }
        }
      }

      // Check for decorative images
      const decorativeImages = content.match(/<img[^>]*alt="[^"]*"[^>]*>/gi);

      if (decorativeImages) {
        for (const img of decorativeImages) {
          if (img.includes('alt=""') && !img.includes('aria-hidden="true"')) {
            imageIssues.push({
              file: path.relative(process.cwd(), file),
              image: img,
              issue: 'Decorative image should have aria-hidden="true"',
              severity: 'medium',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...imageIssues);
    console.log(`   Found ${imageIssues.length} image accessibility issues`);
  }

  async checkForms() {
    console.log('📋 Checking forms...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const formIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for form inputs without labels
      const inputs = content.match(/<input[^>]*>/gi);

      if (inputs) {
        for (const input of inputs) {
          if (
            !input.includes('aria-label') &&
            !input.includes('aria-labelledby') &&
            !this.hasAssociatedLabel(input, content)
          ) {
            formIssues.push({
              file: path.relative(process.cwd(), file),
              input,
              issue: 'Form input missing label',
              severity: 'high',
            });
          }
        }
      }

      // Check for required fields without indication
      const requiredInputs = content.match(/<input[^>]*required[^>]*>/gi);

      if (requiredInputs) {
        for (const input of requiredInputs) {
          if (!input.includes('aria-required="true"')) {
            formIssues.push({
              file: path.relative(process.cwd(), file),
              input,
              issue: 'Required field missing aria-required attribute',
              severity: 'medium',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...formIssues);
    console.log(`   Found ${formIssues.length} form accessibility issues`);
  }

  async validateHeadings() {
    console.log('📑 Validating heading structure...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const headingIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for multiple h1 elements
      const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;

      if (h1Count > 1) {
        headingIssues.push({
          file: path.relative(process.cwd(), file),
          issue: 'Multiple h1 elements found',
          severity: 'medium',
        });
      }

      // Check for empty headings
      const emptyHeadings = content.match(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi);

      if (emptyHeadings) {
        for (const heading of emptyHeadings) {
          headingIssues.push({
            file: path.relative(process.cwd(), file),
            heading,
            issue: 'Empty heading element',
            severity: 'medium',
          });
        }
      }
    }

    this.auditResults.issues.push(...headingIssues);
    console.log(`   Found ${headingIssues.length} heading structure issues`);
  }

  async checkLanguageAttributes() {
    console.log('🌐 Checking language attributes...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const languageIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for html element with lang attribute
      if (content.includes('<html') && !content.includes('lang=')) {
        languageIssues.push({
          file: path.relative(process.cwd(), file),
          issue: 'HTML element missing lang attribute',
          severity: 'high',
        });
      }

      // Check for language changes without indication
      const foreignText = content.match(/[^\x00-\x7F]+/g);

      if (foreignText && !content.includes('lang=')) {
        languageIssues.push({
          file: path.relative(process.cwd(), file),
          issue: 'Foreign text without language indication',
          severity: 'medium',
        });
      }
    }

    this.auditResults.issues.push(...languageIssues);
    console.log(`   Found ${languageIssues.length} language attribute issues`);
  }

  async analyzeInteractiveElements() {
    console.log('🖱️  Analyzing interactive elements...');

    const srcDir = path.join(__dirname, '../src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    const interactiveIssues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for buttons without accessible names
      const buttons = content.match(/<button[^>]*>/gi);

      if (buttons) {
        for (const button of buttons) {
          if (
            !button.includes('aria-label') &&
            !button.includes('aria-labelledby') &&
            !this.hasVisibleText(button)
          ) {
            interactiveIssues.push({
              file: path.relative(process.cwd(), file),
              button,
              issue: 'Button missing accessible name',
              severity: 'high',
            });
          }
        }
      }

      // Check for links without accessible names
      const links = content.match(/<a[^>]*>/gi);

      if (links) {
        for (const link of links) {
          if (
            !link.includes('aria-label') &&
            !this.hasVisibleText(link) &&
            !link.includes('aria-hidden="true"')
          ) {
            interactiveIssues.push({
              file: path.relative(process.cwd(), file),
              link,
              issue: 'Link missing accessible name',
              severity: 'high',
            });
          }
        }
      }
    }

    this.auditResults.issues.push(...interactiveIssues);
    console.log(
      `   Found ${interactiveIssues.length} interactive element issues`
    );
  }

  calculateAccessibilityScore() {
    console.log('📊 Calculating accessibility score...');

    let score = 100;

    // Deduct points for issues
    for (const issue of this.auditResults.issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    this.auditResults.score = Math.max(0, score);
  }

  generateReport() {
    console.log('\n♿ Accessibility Audit Report');
    console.log('============================');
    console.log(`Overall Accessibility Score: ${this.auditResults.score}/100`);
    console.log(`Issues Found: ${this.auditResults.issues.length}`);
    console.log(`WCAG Level: ${this.auditResults.wcagLevel}`);

    if (this.auditResults.issues.length > 0) {
      console.log('\n🚨 Issues by Severity:');

      const bySeverity = this.auditResults.issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {});

      Object.entries(bySeverity).forEach(([severity, count]) => {
        console.log(`   ${severity.toUpperCase()}: ${count} issues`);
      });

      console.log('\n📋 Top Issues:');
      this.auditResults.issues
        .filter(
          issue => issue.severity === 'high' || issue.severity === 'critical'
        )
        .slice(0, 10)
        .forEach(issue => {
          console.log(`   ${issue.severity.toUpperCase()}: ${issue.issue}`);
          if (issue.file) console.log(`     File: ${issue.file}`);
        });
    }

    // Generate recommendations
    this.generateRecommendations();

    // Save detailed report
    const reportPath = path.join(
      __dirname,
      '../accessibility-audit-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Generate HTML report
    this.generateHTMLReport();

    if (this.auditResults.score < 80) {
      console.log('\n❌ Accessibility score below acceptable threshold (80)');
      process.exit(1);
    } else {
      console.log('\n✅ Accessibility audit passed');
    }
  }

  generateRecommendations() {
    const recommendations = [];

    if (
      this.auditResults.issues.some(issue => issue.issue.includes('alt text'))
    ) {
      recommendations.push({
        type: 'images',
        priority: 'high',
        title: 'Add alt text to all images',
        description:
          'Ensure all images have descriptive alt text or are marked as decorative',
      });
    }

    if (this.auditResults.issues.some(issue => issue.issue.includes('ARIA'))) {
      recommendations.push({
        type: 'aria',
        priority: 'high',
        title: 'Improve ARIA implementation',
        description: 'Add proper ARIA labels and roles to interactive elements',
      });
    }

    if (
      this.auditResults.issues.some(issue => issue.issue.includes('keyboard'))
    ) {
      recommendations.push({
        type: 'keyboard',
        priority: 'high',
        title: 'Improve keyboard navigation',
        description: 'Ensure all interactive elements are keyboard accessible',
      });
    }

    if (
      this.auditResults.issues.some(issue => issue.issue.includes('contrast'))
    ) {
      recommendations.push({
        type: 'contrast',
        priority: 'medium',
        title: 'Improve color contrast',
        description:
          'Ensure sufficient color contrast for all text and UI elements',
      });
    }

    this.auditResults.recommendations = recommendations;

    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.title}`);
        console.log(`     ${rec.description}`);
      });
    }
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .score { font-size: 2em; font-weight: bold; color: ${this.auditResults.score >= 80 ? 'green' : 'red'}; }
        .issue { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
        .critical { border-left-color: #ff0000; }
        .high { border-left-color: #ff8800; }
        .medium { border-left-color: #ffaa00; }
        .low { border-left-color: #ffcc00; }
        .recommendation { margin: 10px 0; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Accessibility Audit Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Score: <span class="score">${this.auditResults.score}/100</span></p>
    <p>Issues Found: ${this.auditResults.issues.length}</p>
    
    <h2>Issues</h2>
    ${this.auditResults.issues
      .map(
        issue => `
        <div class="issue ${issue.severity}">
            <strong>${issue.severity.toUpperCase()}:</strong> ${issue.issue}
            ${issue.file ? `<br><small>File: ${issue.file}</small>` : ''}
        </div>
    `
      )
      .join('')}
    
    <h2>Recommendations</h2>
    ${this.auditResults.recommendations
      .map(
        rec => `
        <div class="recommendation">
            <strong>${rec.priority.toUpperCase()}:</strong> ${rec.title}
            <br>${rec.description}
        </div>
    `
      )
      .join('')}
</body>
</html>`;

    const htmlPath = path.join(__dirname, '../accessibility-audit-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }

  // Helper methods
  isLowContrastColor(color) {
    // Simplified contrast check - in reality, you'd use a proper color contrast library
    const lowContrastColors = ['#ccc', '#ddd', '#eee', '#fff', '#000'];
    return lowContrastColors.some(low => color.toLowerCase().includes(low));
  }

  hasVisibleText(element) {
    // Check if element has visible text content
    return (
      element.includes('>') &&
      element.includes('<') &&
      element.split('>')[1].split('<')[0].trim().length > 0
    );
  }

  isValidARIAAttribute(attr) {
    const validAriaAttrs = [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-hidden',
      'aria-expanded',
      'aria-selected',
      'aria-checked',
      'aria-disabled',
      'aria-required',
      'aria-invalid',
      'aria-live',
      'aria-atomic',
      'aria-busy',
      'aria-controls',
      'aria-current',
      'aria-flowto',
      'aria-owns',
      'aria-posinset',
      'aria-setsize',
      'aria-sort',
      'aria-valuemin',
      'aria-valuemax',
      'aria-valuenow',
      'aria-valuetext',
    ];

    const attrName = attr.split('=')[0];
    return validAriaAttrs.includes(attrName);
  }

  hasAssociatedLabel(input, content) {
    // Check if input has an associated label
    const inputId = input.match(/id="([^"]*)"/);
    if (inputId) {
      const label = content.match(
        new RegExp(`<label[^>]*for="${inputId[1]}"[^>]*>`, 'i')
      );
      return !!label;
    }
    return false;
  }

  getAllFiles(dir, extensions) {
    let files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new AccessibilityAuditor();
  auditor.runFullAudit().catch(console.error);
}

module.exports = AccessibilityAuditor;
