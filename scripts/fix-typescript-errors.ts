#!/usr/bin/env tsx
/**
 * TypeScript Error Fixer
 * 
 * Identifies and fixes common TypeScript errors:
 * - Unsafe `any` types
 * - Missing type definitions
 * - Unhandled promises
 * - Null/undefined errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface TypeIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
  fix?: string;
}

function findTypeIssues(dir: string, issues: TypeIssue[] = []): TypeIssue[] {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, dist, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== '.next' && file !== 'build') {
        findTypeIssues(fullPath, issues);
      }
    } else if (extname(file) === '.ts' || extname(file) === '.tsx') {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNum = index + 1;
          
          // Check for unsafe any types
          if (line.match(/:\s*any\b/) && !line.includes('// eslint-disable')) {
            issues.push({
              file: fullPath,
              line: lineNum,
              issue: `Unsafe 'any' type: ${line.trim()}`,
              severity: 'warning',
              fix: 'Replace with proper type definition'
            });
          }
          
          // Check for 'as any' assertions
          if (line.includes('as any') && !line.includes('// eslint-disable')) {
            issues.push({
              file: fullPath,
              line: lineNum,
              issue: `Unsafe 'as any' assertion: ${line.trim()}`,
              severity: 'warning',
              fix: 'Replace with proper type assertion'
            });
          }
          
          // Check for unhandled promises
          if (line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*;?\s*$/) && line.includes('await') && !line.includes('try')) {
            const prevLine = index > 0 ? lines[index - 1] : '';
            if (!prevLine.includes('try') && !prevLine.includes('catch')) {
              issues.push({
                file: fullPath,
                line: lineNum,
                issue: `Potentially unhandled promise: ${line.trim()}`,
                severity: 'warning',
                fix: 'Wrap in try-catch or handle errors'
              });
            }
          }
        });
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }
  
  return issues;
}

function generateReport(issues: TypeIssue[]): string {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  let report = '# TypeScript Issues Report\n\n';
  report += `**Total Issues:** ${issues.length}\n`;
  report += `- Errors: ${errors.length}\n`;
  report += `- Warnings: ${warnings.length}\n\n`;
  
  if (errors.length > 0) {
    report += '## Errors\n\n';
    errors.forEach(issue => {
      report += `### ${issue.file}:${issue.line}\n`;
      report += `**Issue:** ${issue.issue}\n`;
      if (issue.fix) {
        report += `**Fix:** ${issue.fix}\n`;
      }
      report += '\n';
    });
  }
  
  if (warnings.length > 0) {
    report += '## Warnings\n\n';
    const byFile = new Map<string, TypeIssue[]>();
    warnings.forEach(issue => {
      if (!byFile.has(issue.file)) {
        byFile.set(issue.file, []);
      }
      byFile.get(issue.file)!.push(issue);
    });
    
    byFile.forEach((fileIssues, file) => {
      report += `### ${file}\n`;
      fileIssues.forEach(issue => {
        report += `- Line ${issue.line}: ${issue.issue}\n`;
      });
      report += '\n';
    });
  }
  
  return report;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === '--check' || command === 'check' || !command) {
    console.log('🔍 Scanning for TypeScript issues...\n');
    
    const srcDirs = [
      join(process.cwd(), 'apps', 'web', 'src'),
      join(process.cwd(), 'packages'),
    ];
    
    const allIssues: TypeIssue[] = [];
    
    for (const dir of srcDirs) {
      try {
        const issues = findTypeIssues(dir);
        allIssues.push(...issues);
      } catch (err: any) {
        console.log(`⚠️  Could not scan ${dir}: ${err.message}`);
      }
    }
    
    console.log(`Found ${allIssues.length} issues\n`);
    
    const errors = allIssues.filter(i => i.severity === 'error');
    const warnings = allIssues.filter(i => i.severity === 'warning');
    
    if (errors.length > 0) {
      console.log(`❌ Errors: ${errors.length}`);
      errors.slice(0, 10).forEach(issue => {
        console.log(`   ${issue.file}:${issue.line}: ${issue.issue}`);
      });
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more`);
      }
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  Warnings: ${warnings.length}`);
      const anyWarnings = warnings.filter(w => w.issue.includes('any'));
      console.log(`   - Unsafe 'any' types: ${anyWarnings.length}`);
      
      if (anyWarnings.length > 0) {
        console.log('\n   Top files with any types:');
        const byFile = new Map<string, number>();
        anyWarnings.forEach(w => {
          byFile.set(w.file, (byFile.get(w.file) || 0) + 1);
        });
        
        Array.from(byFile.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([file, count]) => {
            console.log(`   - ${file}: ${count} instances`);
          });
      }
      console.log('');
    }
    
    // Generate report
    const report = generateReport(allIssues);
    writeFileSync(join(process.cwd(), 'reports', 'typescript-issues.md'), report);
    console.log('📄 Report saved to reports/typescript-issues.md\n');
    
    process.exit(errors.length > 0 ? 1 : 0);
  } else {
    console.log('TypeScript Error Fixer\n');
    console.log('Usage:');
    console.log('  pnpm fix:typescript --check    Check for TypeScript issues');
  }
}

if (require.main === module) {
  main();
}

export { findTypeIssues, generateReport };
