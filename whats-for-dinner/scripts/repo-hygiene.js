#!/usr/bin/env node

/**
 * Continuous Repository Hygiene and Onboarding Automation
 * Maintains code quality, resolves issues, and automates developer onboarding
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

class RepoHygieneManager {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.projectRoot = process.cwd();
  }

  /**
   * Run comprehensive repo hygiene check
   */
  async runHygieneCheck() {
    console.log('🧹 Starting repository hygiene check...\n');

    try {
      // Run all hygiene checks
      await this.checkCodeSmells();
      await this.checkLintingIssues();
      await this.checkTypeErrors();
      await this.checkTestCoverage();
      await this.checkDependencies();
      await this.checkSecurityIssues();
      await this.checkPerformanceIssues();
      await this.checkDocumentation();
      await this.checkFileStructure();
      await this.checkGitHooks();

      // Generate report
      this.generateReport();

      // Auto-fix issues where possible
      await this.autoFixIssues();

    } catch (error) {
      console.error('❌ Error during hygiene check:', error);
      process.exit(1);
    }
  }

  /**
   * Check for code smells
   */
  async checkCodeSmells() {
    console.log('🔍 Checking for code smells...');

    const codeSmells = [
      {
        pattern: /console\.log\(/g,
        message: 'Console.log statements found',
        severity: 'low',
        fix: 'Remove or replace with proper logging'
      },
      {
        pattern: /TODO|FIXME|HACK|XXX/g,
        message: 'TODO/FIXME comments found',
        severity: 'medium',
        fix: 'Address or remove TODO comments'
      },
      {
        pattern: /any\s*[;\)]/g,
        message: 'TypeScript "any" types found',
        severity: 'medium',
        fix: 'Replace with proper types'
      },
      {
        pattern: /@ts-ignore/g,
        message: 'TypeScript ignore comments found',
        severity: 'high',
        fix: 'Fix underlying type issues instead of ignoring'
      },
      {
        pattern: /\.length\s*>\s*0/g,
        message: 'Inefficient array length checks',
        severity: 'low',
        fix: 'Use array.length directly in boolean context'
      },
      {
        pattern: /==\s*null|!=\s*null/g,
        message: 'Loose equality with null',
        severity: 'medium',
        fix: 'Use strict equality (===)'
      }
    ];

    const files = this.getSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const smell of codeSmells) {
        const matches = content.match(smell.pattern);
        if (matches) {
          this.issues.push({
            file,
            type: 'code_smell',
            message: smell.message,
            severity: smell.severity,
            fix: smell.fix,
            count: matches.length
          });
        }
      }
    }
  }

  /**
   * Check linting issues
   */
  async checkLintingIssues() {
    console.log('🔍 Checking linting issues...');

    try {
      // Run ESLint
      const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
      
      if (lintOutput.includes('error') || lintOutput.includes('warning')) {
        const lines = lintOutput.split('\n');
        for (const line of lines) {
          if (line.includes('error') || line.includes('warning')) {
            const match = line.match(/^(.+):(\d+):(\d+):\s+(.+)\s+\((.+)\)$/);
            if (match) {
              const [, file, lineNum, col, message, rule] = match;
              this.issues.push({
                file: path.resolve(file),
                type: 'linting',
                message: `${message} (${rule})`,
                severity: line.includes('error') ? 'high' : 'medium',
                fix: 'Fix linting rule violation',
                line: parseInt(lineNum),
                column: parseInt(col)
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not run linting check:', error.message);
    }
  }

  /**
   * Check TypeScript errors
   */
  async checkTypeErrors() {
    console.log('🔍 Checking TypeScript errors...');

    try {
      const typeCheckOutput = execSync('npm run type-check 2>&1', { encoding: 'utf8' });
      
      if (typeCheckOutput.includes('error TS')) {
        const lines = typeCheckOutput.split('\n');
        for (const line of lines) {
          if (line.includes('error TS')) {
            const match = line.match(/^(.+):(\d+):(\d+)\s+-\s+error\s+TS(\d+):\s+(.+)$/);
            if (match) {
              const [, file, lineNum, col, errorCode, message] = match;
              this.issues.push({
                file: path.resolve(file),
                type: 'typescript',
                message: `TS${errorCode}: ${message}`,
                severity: 'high',
                fix: 'Fix TypeScript error',
                line: parseInt(lineNum),
                column: parseInt(col)
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not run TypeScript check:', error.message);
    }
  }

  /**
   * Check test coverage
   */
  async checkTestCoverage() {
    console.log('🔍 Checking test coverage...');

    try {
      const coverageOutput = execSync('npm run test:coverage 2>&1', { encoding: 'utf8' });
      
      // Extract coverage percentage
      const coverageMatch = coverageOutput.match(/All files\s+\|\s+(\d+\.\d+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < 80) {
          this.issues.push({
            file: 'test-coverage',
            type: 'coverage',
            message: `Test coverage is ${coverage}%, below 80% threshold`,
            severity: 'medium',
            fix: 'Add more tests to improve coverage'
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not run test coverage check:', error.message);
    }
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    console.log('🔍 Checking dependencies...');

    try {
      // Check for outdated packages
      const outdatedOutput = execSync('npm outdated --json 2>&1', { encoding: 'utf8' });
      const outdated = JSON.parse(outdatedOutput);
      
      for (const [packageName, info] of Object.entries(outdated)) {
        this.issues.push({
          file: 'package.json',
          type: 'dependency',
          message: `${packageName} is outdated (${info.current} -> ${info.latest})`,
          severity: 'low',
          fix: `Update ${packageName} to version ${info.latest}`
        });
      }

      // Check for security vulnerabilities
      const auditOutput = execSync('npm audit --json 2>&1', { encoding: 'utf8' });
      const audit = JSON.parse(auditOutput);
      
      if (audit.vulnerabilities) {
        for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
          this.issues.push({
            file: 'package.json',
            type: 'security',
            message: `Security vulnerability in ${packageName}: ${vuln.title}`,
            severity: vuln.severity === 'high' ? 'high' : 'medium',
            fix: `Run 'npm audit fix' to resolve vulnerability`
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not check dependencies:', error.message);
    }
  }

  /**
   * Check security issues
   */
  async checkSecurityIssues() {
    console.log('🔍 Checking security issues...');

    const securityPatterns = [
      {
        pattern: /password\s*=\s*['"][^'"]+['"]/gi,
        message: 'Hardcoded password found',
        severity: 'critical'
      },
      {
        pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
        message: 'Hardcoded API key found',
        severity: 'critical'
      },
      {
        pattern: /secret\s*=\s*['"][^'"]+['"]/gi,
        message: 'Hardcoded secret found',
        severity: 'critical'
      },
      {
        pattern: /eval\s*\(/gi,
        message: 'eval() function usage found',
        severity: 'high'
      },
      {
        pattern: /innerHTML\s*=/gi,
        message: 'innerHTML usage found (potential XSS)',
        severity: 'medium'
      }
    ];

    const files = this.getSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of securityPatterns) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          this.issues.push({
            file,
            type: 'security',
            message: pattern.message,
            severity: pattern.severity,
            fix: 'Remove hardcoded credentials or use environment variables'
          });
        }
      }
    }
  }

  /**
   * Check performance issues
   */
  async checkPerformanceIssues() {
    console.log('🔍 Checking performance issues...');

    const performancePatterns = [
      {
        pattern: /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*array\.length\s*;\s*i\+\+\s*\)/g,
        message: 'Inefficient for loop with array.length',
        severity: 'low',
        fix: 'Use for...of loop or cache array.length'
      },
      {
        pattern: /\.map\(.*\)\.filter\(/g,
        message: 'Chained map and filter operations',
        severity: 'low',
        fix: 'Consider combining into single reduce operation'
      },
      {
        pattern: /document\.querySelectorAll\(/g,
        message: 'Multiple DOM queries',
        severity: 'medium',
        fix: 'Cache DOM elements or use event delegation'
      }
    ];

    const files = this.getSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of performancePatterns) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          this.issues.push({
            file,
            type: 'performance',
            message: pattern.message,
            severity: pattern.severity,
            fix: pattern.fix
          });
        }
      }
    }
  }

  /**
   * Check documentation
   */
  async checkDocumentation() {
    console.log('🔍 Checking documentation...');

    // Check for missing README
    if (!fs.existsSync('README.md')) {
      this.issues.push({
        file: 'README.md',
        type: 'documentation',
        message: 'README.md is missing',
        severity: 'high',
        fix: 'Create a comprehensive README.md file'
      });
    }

    // Check for missing API documentation
    const apiFiles = glob.sync('src/app/api/**/*.ts');
    if (apiFiles.length > 0 && !fs.existsSync('docs/api.md')) {
      this.issues.push({
        file: 'docs/api.md',
        type: 'documentation',
        message: 'API documentation is missing',
        severity: 'medium',
        fix: 'Generate API documentation'
      });
    }

    // Check for missing JSDoc comments in functions
    const sourceFiles = this.getSourceFiles();
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g);
      
      if (functions) {
        for (const func of functions) {
          const funcName = func.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/);
          if (funcName) {
            const name = funcName[1] || funcName[2];
            const funcIndex = content.indexOf(func);
            const beforeFunc = content.substring(Math.max(0, funcIndex - 200), funcIndex);
            
            if (!beforeFunc.includes('/**') && !beforeFunc.includes('//')) {
              this.issues.push({
                file,
                type: 'documentation',
                message: `Function ${name} is missing JSDoc comments`,
                severity: 'low',
                fix: 'Add JSDoc comments to function'
              });
            }
          }
        }
      }
    }
  }

  /**
   * Check file structure
   */
  async checkFileStructure() {
    console.log('🔍 Checking file structure...');

    // Check for proper directory structure
    const requiredDirs = ['src', 'public', 'docs'];
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        this.issues.push({
          file: dir,
          type: 'structure',
          message: `Required directory ${dir} is missing`,
          severity: 'medium',
          fix: `Create ${dir} directory`
        });
      }
    }

    // Check for proper file organization
    const srcFiles = glob.sync('src/**/*');
    const componentsDir = srcFiles.filter(f => f.includes('components')).length;
    const utilsDir = srcFiles.filter(f => f.includes('utils')).length;
    
    if (componentsDir > 0 && !fs.existsSync('src/components')) {
      this.issues.push({
        file: 'src/components',
        type: 'structure',
        message: 'Components should be organized in src/components directory',
        severity: 'low',
        fix: 'Move component files to src/components directory'
      });
    }

    if (utilsDir > 0 && !fs.existsSync('src/utils')) {
      this.issues.push({
        file: 'src/utils',
        type: 'structure',
        message: 'Utility functions should be organized in src/utils directory',
        severity: 'low',
        fix: 'Move utility files to src/utils directory'
      });
    }
  }

  /**
   * Check Git hooks
   */
  async checkGitHooks() {
    console.log('🔍 Checking Git hooks...');

    const hooksDir = '.git/hooks';
    const requiredHooks = ['pre-commit', 'pre-push'];

    for (const hook of requiredHooks) {
      const hookPath = path.join(hooksDir, hook);
      if (!fs.existsSync(hookPath)) {
        this.issues.push({
          file: hookPath,
          type: 'git',
          message: `Git hook ${hook} is missing`,
          severity: 'medium',
          fix: `Create ${hook} hook for code quality checks`
        });
      }
    }
  }

  /**
   * Get source files
   */
  getSourceFiles() {
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx'
    ];
    
    let files = [];
    for (const pattern of patterns) {
      files = files.concat(glob.sync(pattern));
    }
    
    return files.filter(file => !file.includes('node_modules') && !file.includes('.git'));
  }

  /**
   * Generate hygiene report
   */
  generateReport() {
    console.log('\n📊 Repository Hygiene Report');
    console.log('='.repeat(50));

    const issuesByType = this.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});

    const issuesBySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});

    console.log(`\nTotal Issues Found: ${this.issues.length}`);
    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(issuesByType)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('\nBy Severity:');
    for (const [severity, count] of Object.entries(issuesBySeverity)) {
      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${icon} ${severity}: ${count}`);
    }

    if (this.issues.length > 0) {
      console.log('\nTop Issues:');
      const topIssues = this.issues
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 10);

      for (const issue of topIssues) {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${icon} ${issue.file}: ${issue.message}`);
      }
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      issuesByType,
      issuesBySeverity,
      issues: this.issues
    };

    fs.writeFileSync('hygiene-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to hygiene-report.json');
  }

  /**
   * Auto-fix issues where possible
   */
  async autoFixIssues() {
    console.log('\n🔧 Attempting to auto-fix issues...');

    let fixedCount = 0;

    for (const issue of this.issues) {
      if (issue.severity === 'low' && issue.type === 'code_smell') {
        try {
          await this.fixCodeSmell(issue);
          fixedCount++;
        } catch (error) {
          console.warn(`⚠️  Could not fix ${issue.file}: ${error.message}`);
        }
      }
    }

    if (fixedCount > 0) {
      console.log(`✅ Auto-fixed ${fixedCount} issues`);
    } else {
      console.log('ℹ️  No issues could be auto-fixed');
    }
  }

  /**
   * Fix specific code smell
   */
  async fixCodeSmell(issue) {
    const content = fs.readFileSync(issue.file, 'utf8');
    let newContent = content;

    if (issue.message.includes('Console.log statements')) {
      // Remove console.log statements
      newContent = content.replace(/console\.log\([^)]*\);?\s*\n?/g, '');
    } else if (issue.message.includes('Inefficient array length checks')) {
      // Fix array length checks
      newContent = content.replace(/\.length\s*>\s*0/g, '.length');
    } else if (issue.message.includes('Loose equality with null')) {
      // Fix loose equality
      newContent = content.replace(/==\s*null/g, '=== null').replace(/!=\s*null/g, '!== null');
    }

    if (newContent !== content) {
      fs.writeFileSync(issue.file, newContent);
      this.fixes.push({
        file: issue.file,
        type: issue.type,
        message: issue.message,
        fixed: true
      });
    }
  }

  /**
   * Generate onboarding documentation
   */
  async generateOnboardingDocs() {
    console.log('\n📚 Generating onboarding documentation...');

    const onboardingContent = `# Developer Onboarding Guide

## Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git

## Setup
1. Clone the repository
2. Install dependencies: \`pnpm install\`
3. Copy environment variables: \`cp .env.example .env.local\`
4. Start development server: \`pnpm dev\`

## Project Structure
\`\`\`
src/
├── app/           # Next.js app directory
├── components/    # Reusable UI components
├── lib/          # Utility functions and configurations
├── hooks/        # Custom React hooks
└── types/        # TypeScript type definitions
\`\`\`

## Development Workflow
1. Create feature branch: \`git checkout -b feature/your-feature\`
2. Make changes
3. Run tests: \`pnpm test\`
4. Run linting: \`pnpm lint\`
5. Commit changes: \`git commit -m "feat: your feature"\`
6. Push and create PR

## Code Standards
- Use TypeScript for all new code
- Follow ESLint rules
- Write tests for new features
- Use conventional commits
- Document public APIs

## Available Scripts
- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build for production
- \`pnpm test\` - Run tests
- \`pnpm lint\` - Run linting
- \`pnpm type-check\` - Check TypeScript types

## Getting Help
- Check the README.md
- Review existing code examples
- Ask questions in team chat
- Create an issue for bugs
`;

    fs.writeFileSync('ONBOARDING.md', onboardingContent);
    console.log('✅ Onboarding documentation generated');
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new RepoHygieneManager();
  manager.runHygieneCheck()
    .then(() => manager.generateOnboardingDocs())
    .then(() => {
      console.log('\n🎉 Repository hygiene check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = RepoHygieneManager;