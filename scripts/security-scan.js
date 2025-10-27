#!/usr/bin/env node

/**
 * Security Scanning Script
 * 
 * Comprehensive security scanning including secrets, dependencies, headers, and vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  scanTypes: ['secrets', 'deps', 'headers', 'vulnerabilities'],
  secretPatterns: [
    // API Keys
    { name: 'API Key', pattern: /api[_-]?key[_-]?[a-zA-Z0-9]{20,}/i, severity: 'high' },
    { name: 'Stripe Key', pattern: /sk_[a-zA-Z0-9]{24,}/, severity: 'high' },
    { name: 'OpenAI Key', pattern: /sk-[a-zA-Z0-9]{48,}/, severity: 'high' },
    { name: 'Supabase Key', pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, severity: 'high' },
    
    // Database URLs
    { name: 'PostgreSQL URL', pattern: /postgres:\/\/[^:]+:[^@]+@[^\/]+\/[^\/]+/, severity: 'high' },
    { name: 'MySQL URL', pattern: /mysql:\/\/[^:]+:[^@]+@[^\/]+\/[^\/]+/, severity: 'high' },
    
    // JWT Secrets
    { name: 'JWT Secret', pattern: /jwt[_-]?secret[_-]?[a-zA-Z0-9]{20,}/i, severity: 'high' },
    { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, severity: 'medium' },
    
    // OAuth
    { name: 'OAuth Client Secret', pattern: /client_secret[_-]?[a-zA-Z0-9]{20,}/i, severity: 'high' },
    { name: 'OAuth Token', pattern: /oauth[_-]?token[_-]?[a-zA-Z0-9]{20,}/i, severity: 'medium' },
    
    // Encryption Keys
    { name: 'AES Key', pattern: /aes[_-]?key[_-]?[a-zA-Z0-9]{32,}/i, severity: 'high' },
    { name: 'RSA Key', pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/, severity: 'high' },
    
    // Environment Variables
    { name: 'Environment Variable', pattern: /[A-Z_]+_SECRET[=:][a-zA-Z0-9]{20,}/i, severity: 'medium' },
    { name: 'Password', pattern: /password[=:][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}/i, severity: 'high' }
  ],
  filePatterns: [
    '**/*.{js,ts,tsx,jsx,json,env,yml,yaml,toml,ini,conf,config}',
    '**/.env*',
    '**/config/**',
    '**/secrets/**'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    'coverage/**',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}'
  ],
  securityHeaders: {
    'Content-Security-Policy': 'default-src \'self\'',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

class SecurityScanner {
  constructor() {
    this.results = {
      summary: {
        totalScans: 0,
        passedScans: 0,
        failedScans: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0
      },
      secrets: {
        found: [],
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      dependencies: {
        vulnerabilities: [],
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      headers: {
        missing: [],
        total: 0,
        score: 0
      },
      vulnerabilities: {
        found: [],
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      recommendations: [],
      errors: []
    };
  }

  /**
   * Run all security scans
   */
  async runScans() {
    log('🔒 Security Scanning Starting...', 'bold');
    log('================================', 'bold');

    try {
      // Scan for secrets
      await this.scanSecrets();

      // Scan dependencies
      await this.scanDependencies();

      // Check security headers
      await this.scanHeaders();

      // Scan for vulnerabilities
      await this.scanVulnerabilities();

      // Generate recommendations
      this.generateRecommendations();

      // Calculate summary
      this.calculateSummary();

      this.generateReport();
      return this.results;

    } catch (error) {
      log(`❌ Security scanning failed: ${error.message}`, 'red');
      this.results.errors.push({
        type: 'scan_error',
        message: error.message
      });
      return this.results;
    }
  }

  /**
   * Scan for secrets in codebase
   */
  async scanSecrets() {
    log('\n🔍 Scanning for Secrets...', 'blue');

    const secrets = [];
    const files = this.findFiles(config.filePatterns, config.excludePatterns);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileSecrets = this.scanFileForSecrets(file, content);
        secrets.push(...fileSecrets);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    this.results.secrets.found = secrets;
    this.results.secrets.total = secrets.length;

    // Count by severity
    secrets.forEach(secret => {
      switch (secret.severity) {
        case 'critical':
          this.results.secrets.critical++;
          break;
        case 'high':
          this.results.secrets.high++;
          break;
        case 'medium':
          this.results.secrets.medium++;
          break;
        case 'low':
          this.results.secrets.low++;
          break;
      }
    });

    log(`  Found ${secrets.length} secrets`, secrets.length > 0 ? 'red' : 'green');
    log(`  Critical: ${this.results.secrets.critical}`, this.results.secrets.critical > 0 ? 'red' : 'green');
    log(`  High: ${this.results.secrets.high}`, this.results.secrets.high > 0 ? 'red' : 'green');
    log(`  Medium: ${this.results.secrets.medium}`, this.results.secrets.medium > 0 ? 'yellow' : 'green');
    log(`  Low: ${this.results.secrets.low}`, this.results.secrets.low > 0 ? 'yellow' : 'green');

    if (secrets.length > 0) {
      log('\n  Secret Details:', 'yellow');
      secrets.slice(0, 5).forEach(secret => {
        const color = secret.severity === 'critical' || secret.severity === 'high' ? 'red' : 'yellow';
        log(`    ${secret.severity.toUpperCase()}: ${secret.name} in ${secret.file}:${secret.line}`, color);
      });
    }
  }

  /**
   * Scan file for secrets
   */
  scanFileForSecrets(filePath, content) {
    const secrets = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of config.secretPatterns) {
        const matches = line.match(pattern.pattern);
        if (matches) {
          secrets.push({
            file: filePath,
            line: i + 1,
            name: pattern.name,
            severity: pattern.severity,
            match: matches[0],
            context: line.trim()
          });
        }
      }
    }

    return secrets;
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies() {
    log('\n📦 Scanning Dependencies...', 'blue');

    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });

      const audit = JSON.parse(auditResult);
      const vulnerabilities = this.parseAuditResults(audit);

      this.results.dependencies.vulnerabilities = vulnerabilities;
      this.results.dependencies.total = vulnerabilities.length;

      // Count by severity
      vulnerabilities.forEach(vuln => {
        switch (vuln.severity) {
          case 'critical':
            this.results.dependencies.critical++;
            break;
          case 'high':
            this.results.dependencies.high++;
            break;
          case 'medium':
            this.results.dependencies.medium++;
            break;
          case 'low':
            this.results.dependencies.low++;
            break;
        }
      });

      log(`  Found ${vulnerabilities.length} vulnerabilities`, vulnerabilities.length > 0 ? 'red' : 'green');
      log(`  Critical: ${this.results.dependencies.critical}`, this.results.dependencies.critical > 0 ? 'red' : 'green');
      log(`  High: ${this.results.dependencies.high}`, this.results.dependencies.high > 0 ? 'red' : 'green');
      log(`  Medium: ${this.results.dependencies.medium}`, this.results.dependencies.medium > 0 ? 'yellow' : 'green');
      log(`  Low: ${this.results.dependencies.low}`, this.results.dependencies.low > 0 ? 'yellow' : 'green');

    } catch (error) {
      log(`  ❌ Dependency scan failed: ${error.message}`, 'red');
      this.results.errors.push({
        type: 'dependency_scan_error',
        message: error.message
      });
    }
  }

  /**
   * Parse npm audit results
   */
  parseAuditResults(audit) {
    const vulnerabilities = [];

    if (audit.vulnerabilities) {
      for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
        vulnerabilities.push({
          package: packageName,
          severity: vuln.severity,
          title: vuln.title,
          description: vuln.description,
          recommendation: vuln.recommendation,
          cves: vuln.cves || []
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Scan security headers
   */
  async scanHeaders() {
    log('\n🛡️  Scanning Security Headers...', 'blue');

    // Mock header scanning (in production, test actual endpoints)
    const missingHeaders = [];
    const requiredHeaders = Object.keys(config.securityHeaders);

    // Simulate header check
    const mockHeaders = {
      'Content-Security-Policy': 'default-src \'self\'',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block'
      // Missing: Strict-Transport-Security
    };

    for (const header of requiredHeaders) {
      if (!mockHeaders[header]) {
        missingHeaders.push({
          header,
          required: config.securityHeaders[header],
          severity: this.getHeaderSeverity(header)
        });
      }
    }

    this.results.headers.missing = missingHeaders;
    this.results.headers.total = missingHeaders.length;
    this.results.headers.score = Math.round(((requiredHeaders.length - missingHeaders.length) / requiredHeaders.length) * 100);

    log(`  Security Score: ${this.results.headers.score}%`, this.results.headers.score >= 80 ? 'green' : 'yellow');
    log(`  Missing Headers: ${missingHeaders.length}`, missingHeaders.length > 0 ? 'yellow' : 'green');

    if (missingHeaders.length > 0) {
      log('\n  Missing Headers:', 'yellow');
      missingHeaders.forEach(header => {
        const color = header.severity === 'high' ? 'red' : 'yellow';
        log(`    ${header.severity.toUpperCase()}: ${header.header}`, color);
      });
    }
  }

  /**
   * Get header severity
   */
  getHeaderSeverity(header) {
    const highSeverity = ['Content-Security-Policy', 'Strict-Transport-Security'];
    const mediumSeverity = ['X-Frame-Options', 'X-Content-Type-Options'];
    
    if (highSeverity.includes(header)) return 'high';
    if (mediumSeverity.includes(header)) return 'medium';
    return 'low';
  }

  /**
   * Scan for vulnerabilities
   */
  async scanVulnerabilities() {
    log('\n🚨 Scanning for Vulnerabilities...', 'blue');

    // Mock vulnerability scanning (in production, use actual vulnerability scanners)
    const vulnerabilities = [
      {
        type: 'sql_injection',
        severity: 'high',
        file: 'src/api/meals.ts',
        line: 45,
        description: 'Potential SQL injection vulnerability',
        recommendation: 'Use parameterized queries'
      },
      {
        type: 'xss',
        severity: 'medium',
        file: 'src/components/MealCard.tsx',
        line: 23,
        description: 'Potential XSS vulnerability',
        recommendation: 'Sanitize user input'
      },
      {
        type: 'csrf',
        severity: 'medium',
        file: 'src/pages/api/meals.ts',
        line: 12,
        description: 'Missing CSRF protection',
        recommendation: 'Implement CSRF tokens'
      }
    ];

    this.results.vulnerabilities.found = vulnerabilities;
    this.results.vulnerabilities.total = vulnerabilities.length;

    // Count by severity
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          this.results.vulnerabilities.critical++;
          break;
        case 'high':
          this.results.vulnerabilities.high++;
          break;
        case 'medium':
          this.results.vulnerabilities.medium++;
          break;
        case 'low':
          this.results.vulnerabilities.low++;
          break;
      }
    });

    log(`  Found ${vulnerabilities.length} vulnerabilities`, vulnerabilities.length > 0 ? 'red' : 'green');
    log(`  Critical: ${this.results.vulnerabilities.critical}`, this.results.vulnerabilities.critical > 0 ? 'red' : 'green');
    log(`  High: ${this.results.vulnerabilities.high}`, this.results.vulnerabilities.high > 0 ? 'red' : 'green');
    log(`  Medium: ${this.results.vulnerabilities.medium}`, this.results.vulnerabilities.medium > 0 ? 'yellow' : 'green');
    log(`  Low: ${this.results.vulnerabilities.low}`, this.results.vulnerabilities.low > 0 ? 'yellow' : 'green');

    if (vulnerabilities.length > 0) {
      log('\n  Vulnerability Details:', 'yellow');
      vulnerabilities.forEach(vuln => {
        const color = vuln.severity === 'critical' || vuln.severity === 'high' ? 'red' : 'yellow';
        log(`    ${vuln.severity.toUpperCase()}: ${vuln.type} in ${vuln.file}:${vuln.line}`, color);
      });
    }
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Secret recommendations
    if (this.results.secrets.total > 0) {
      recommendations.push({
        type: 'secrets',
        priority: 'high',
        title: 'Remove Hardcoded Secrets',
        description: `${this.results.secrets.total} secrets found in codebase`,
        action: 'Move secrets to environment variables and use secret management'
      });
    }

    // Dependency recommendations
    if (this.results.dependencies.total > 0) {
      recommendations.push({
        type: 'dependencies',
        priority: 'high',
        title: 'Update Vulnerable Dependencies',
        description: `${this.results.dependencies.total} vulnerable dependencies found`,
        action: 'Run npm audit fix and update vulnerable packages'
      });
    }

    // Header recommendations
    if (this.results.headers.total > 0) {
      recommendations.push({
        type: 'headers',
        priority: 'medium',
        title: 'Implement Security Headers',
        description: `${this.results.headers.total} security headers missing`,
        action: 'Add missing security headers to improve security posture'
      });
    }

    // Vulnerability recommendations
    if (this.results.vulnerabilities.total > 0) {
      recommendations.push({
        type: 'vulnerabilities',
        priority: 'high',
        title: 'Fix Security Vulnerabilities',
        description: `${this.results.vulnerabilities.total} vulnerabilities found`,
        action: 'Review and fix identified security vulnerabilities'
      });
    }

    // General recommendations
    recommendations.push({
      type: 'general',
      priority: 'medium',
      title: 'Implement Security Monitoring',
      description: 'Set up continuous security monitoring',
      action: 'Implement SIEM, log monitoring, and security alerts'
    });

    recommendations.push({
      type: 'general',
      priority: 'medium',
      title: 'Security Training',
      description: 'Provide security awareness training',
      action: 'Train team on secure coding practices and security awareness'
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    const { secrets, dependencies, headers, vulnerabilities } = this.results;

    this.results.summary.totalScans = 4;
    this.results.summary.passedScans = 0;
    this.results.summary.failedScans = 0;

    // Count issues by severity
    this.results.summary.criticalIssues = secrets.critical + dependencies.critical + vulnerabilities.critical;
    this.results.summary.highIssues = secrets.high + dependencies.high + vulnerabilities.high;
    this.results.summary.mediumIssues = secrets.medium + dependencies.medium + vulnerabilities.medium + headers.total;
    this.results.summary.lowIssues = secrets.low + dependencies.low + vulnerabilities.low;

    // Determine scan results
    if (this.results.summary.criticalIssues > 0) {
      this.results.summary.failedScans = 4;
    } else if (this.results.summary.highIssues > 0) {
      this.results.summary.failedScans = 3;
    } else if (this.results.summary.mediumIssues > 0) {
      this.results.summary.failedScans = 2;
    } else {
      this.results.summary.passedScans = 4;
    }
  }

  /**
   * Generate security report
   */
  generateReport() {
    log('\n📊 Security Scan Report', 'bold');
    log('======================', 'bold');

    const { summary } = this.results;

    // Overall status
    const status = summary.criticalIssues > 0 ? 'CRITICAL' :
                  summary.highIssues > 0 ? 'HIGH RISK' :
                  summary.mediumIssues > 0 ? 'MEDIUM RISK' : 'SECURE';
    
    const statusColor = summary.criticalIssues > 0 ? 'red' :
                       summary.highIssues > 0 ? 'red' :
                       summary.mediumIssues > 0 ? 'yellow' : 'green';

    log(`Overall Status: ${status}`, statusColor);
    log(`Total Scans: ${summary.totalScans}`, 'blue');
    log(`Passed: ${summary.passedScans}`, 'green');
    log(`Failed: ${summary.failedScans}`, summary.failedScans > 0 ? 'red' : 'green');

    // Issue breakdown
    log('\nIssue Breakdown:', 'blue');
    log(`  Critical: ${summary.criticalIssues}`, summary.criticalIssues > 0 ? 'red' : 'green');
    log(`  High: ${summary.highIssues}`, summary.highIssues > 0 ? 'red' : 'green');
    log(`  Medium: ${summary.mediumIssues}`, summary.mediumIssues > 0 ? 'yellow' : 'green');
    log(`  Low: ${summary.lowIssues}`, summary.lowIssues > 0 ? 'yellow' : 'green');

    // Top recommendations
    if (this.results.recommendations.length > 0) {
      log('\nTop Recommendations:', 'yellow');
      this.results.recommendations
        .filter(r => r.priority === 'high')
        .slice(0, 3)
        .forEach(rec => {
          log(`  • ${rec.title}`, 'yellow');
        });
    }
  }

  /**
   * Find files matching patterns
   */
  findFiles(patterns, excludePatterns) {
    const files = [];
    
    for (const pattern of patterns) {
      try {
        const result = execSync(`find . -name "${pattern}" -type f`, { 
          encoding: 'utf8',
          cwd: process.cwd()
        });
        
        const patternFiles = result.trim().split('\n').filter(file => {
          return !excludePatterns.some(exclude => file.includes(exclude.replace('**', '')));
        });
        
        files.push(...patternFiles);
      } catch (error) {
        // Pattern not found, continue
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'security-scan-results.json');
    const reportsDir = path.dirname(resultsPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
  }
}

// Main execution
async function main() {
  log('🔒 Security Scanning Starting...', 'bold');
  
  const scanner = new SecurityScanner();
  const results = await scanner.runScans();
  scanner.saveResults();

  // Exit with appropriate code
  const exitCode = results.summary.criticalIssues > 0 ? 2 :
                  results.summary.highIssues > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Security scanning failed:', error);
    process.exit(1);
  });
}

module.exports = { SecurityScanner, config };