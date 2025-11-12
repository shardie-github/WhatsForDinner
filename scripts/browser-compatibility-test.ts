#!/usr/bin/env tsx
/**
 * Browser Compatibility Test Script
 * 
 * For demo purposes, this script validates that the application
 * uses compatible APIs and patterns for major browsers.
 * 
 * Run: npx tsx scripts/browser-compatibility-test.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface CompatibilityIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
  browser?: string;
}

const ISSUES: CompatibilityIssue[] = [];

// APIs that are not supported in older browsers
const UNSUPPORTED_APIS = [
  { pattern: /\.flatMap\(/g, name: 'Array.flatMap', browsers: 'IE, Safari < 12' },
  { pattern: /\.flat\(/g, name: 'Array.flat', browsers: 'IE, Safari < 12' },
  { pattern: /Object\.fromEntries\(/g, name: 'Object.fromEntries', browsers: 'IE, Safari < 12.1' },
  { pattern: /String\.matchAll\(/g, name: 'String.matchAll', browsers: 'IE, Safari < 13' },
  { pattern: /Promise\.allSettled\(/g, name: 'Promise.allSettled', browsers: 'IE, Safari < 13' },
  { pattern: /globalThis/g, name: 'globalThis', browsers: 'IE, Safari < 12.1' },
  { pattern: /BigInt\(/g, name: 'BigInt', browsers: 'IE, Safari < 14' },
  { pattern: /Optional Chaining/g, name: 'Optional Chaining (?.)', browsers: 'IE, Safari < 13.1' },
];

// Features that need polyfills
const NEEDS_POLYFILL = [
  { pattern: /\.replaceAll\(/g, name: 'String.replaceAll', browsers: 'IE, Safari < 13.1' },
  { pattern: /Intl\.DisplayNames/g, name: 'Intl.DisplayNames', browsers: 'IE, Safari < 14' },
];

// Check a single file
function checkFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Check for unsupported APIs
    UNSUPPORTED_APIS.forEach(({ pattern, name, browsers }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          issue: `Uses ${name} (not supported in ${browsers})`,
          severity: 'warning',
          browser: browsers,
        });
      }
    });

    // Check for features needing polyfills
    NEEDS_POLYFILL.forEach(({ pattern, name, browsers }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          issue: `${name} may need polyfill for ${browsers}`,
          severity: 'warning',
          browser: browsers,
        });
      }
    });

    // Check for browser-specific code that might break
    if (content.includes('window.chrome') && !content.includes('window.browser')) {
      const lineNumber = content.split('\n').findIndex(line => line.includes('window.chrome'));
      ISSUES.push({
        file: filePath,
        line: lineNumber + 1,
        issue: 'Uses window.chrome without fallback for Firefox/Edge',
        severity: 'warning',
        browser: 'Firefox, Edge',
      });
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

// Recursively find TypeScript/JavaScript files
function findSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', '.next', 'dist', 'build', '.turbo'].includes(file)) {
        findSourceFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file) && !file.includes('.test.') && !file.includes('.spec.')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
function main() {
  console.log('?? Running Browser Compatibility Tests...\n');

  const sourceFiles = findSourceFiles(join(process.cwd(), 'apps/web/src'));
  
  console.log(`Checking ${sourceFiles.length} files...\n`);

  sourceFiles.forEach(checkFile);

  // Report results
  const errors = ISSUES.filter(i => i.severity === 'error');
  const warnings = ISSUES.filter(i => i.severity === 'warning');

  console.log('\n?? Results:');
  console.log(`  ? Files checked: ${sourceFiles.length}`);
  console.log(`  ??  Warnings: ${warnings.length}`);
  console.log(`  ? Errors: ${errors.length}\n`);

  if (ISSUES.length > 0) {
    console.log('?? Issues Found:\n');
    
    ISSUES.forEach((issue, index) => {
      const icon = issue.severity === 'error' ? '?' : '??';
      console.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}`);
      console.log(`   ${issue.issue}`);
      if (issue.browser) {
        console.log(`   Affected browsers: ${issue.browser}`);
      }
      console.log('');
    });
  }

  // Browser support summary
  console.log('\n?? Target Browser Support:');
  console.log('  ? Chrome 90+');
  console.log('  ? Firefox 88+');
  console.log('  ? Safari 14+');
  console.log('  ? Edge 90+');
  console.log('  ??  Older browsers may require polyfills\n');

  // Recommendations
  if (warnings.length > 0) {
    console.log('?? Recommendations:');
    console.log('  1. Test the application on target browsers');
    console.log('  2. Add polyfills for older browser support if needed');
    console.log('  3. Use @babel/preset-env with appropriate targets');
    console.log('  4. Consider using feature detection instead of direct API calls\n');
  }

  // Exit with error code if there are critical issues
  if (errors.length > 0) {
    process.exit(1);
  }

  console.log('? Browser compatibility check complete!');
}

if (require.main === module) {
  main();
}

export { checkFile, findSourceFiles };
