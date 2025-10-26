#!/usr/bin/env node

/**
 * Comprehensive Security Audit Script for What's for Dinner
 * 
 * This script performs a thorough security audit including:
 * - Supabase RLS policy validation
 * - API endpoint security checks
 * - Environment variable validation
 * - Dependency vulnerability scanning
 * - CORS configuration validation
 * - Authentication flow validation
 * - Data encryption verification
 * - Compliance checks (GDPR, SOC2, ISO 27001)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      criticalIssues: [],
      highIssues: [],
      mediumIssues: [],
      lowIssues: [],
      recommendations: [],
      compliance: {
        gdpr: { status: 'pending', issues: [] },
        soc2: { status: 'pending', issues: [] },
        iso27001: { status: 'pending', issues: [] }
      }
    };
  }

  async runFullAudit() {
    console.log('🔒 Starting comprehensive security audit...\n');

    try {
      await this.auditEnvironmentVariables();
      await this.auditDependencies();
      await this.auditSupabaseRLS();
      await this.auditAPIEndpoints();
      await this.auditCORSConfiguration();
      await this.auditAuthenticationFlow();
      await this.auditDataEncryption();
      await this.auditFilePermissions();
      await this.auditSecretsManagement();
      await this.auditComplianceRequirements();
      await this.auditRateLimiting();
      await this.auditInputValidation();
      await this.auditErrorHandling();
      await this.auditLoggingSecurity();
      await this.auditSessionManagement();

      this.calculateOverallScore();
      this.generateReport();
      
      console.log('\n✅ Security audit completed successfully!');
      console.log(`📊 Overall Security Score: ${this.auditResults.overallScore}/100`);
      
      return this.auditResults;
    } catch (error) {
      console.error('❌ Security audit failed:', error);
      throw error;
    }
  }

  async auditEnvironmentVariables() {
    console.log('🔍 Auditing environment variables...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.auditResults.criticalIssues.push({
        category: 'Environment Variables',
        issue: `Missing required environment variables: ${missingVars.join(', ')}`,
        impact: 'Critical',
        remediation: 'Set all required environment variables in production'
      });
    }

    // Check for hardcoded secrets
    const sourceFiles = this.getSourceFiles();
    const hardcodedSecrets = this.findHardcodedSecrets(sourceFiles);
    
    if (hardcodedSecrets.length > 0) {
      this.auditResults.criticalIssues.push({
        category: 'Secrets Management',
        issue: `Hardcoded secrets found in: ${hardcodedSecrets.join(', ')}`,
        impact: 'Critical',
        remediation: 'Move all secrets to environment variables'
      });
    }

    console.log('✅ Environment variables audit completed');
  }

  async auditDependencies() {
    console.log('🔍 Auditing dependencies for vulnerabilities...');
    
    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities) {
        const vulnerabilities = auditData.vulnerabilities;
        
        Object.entries(vulnerabilities).forEach(([packageName, vuln]) => {
          const severity = vuln.severity;
          const issue = {
            category: 'Dependencies',
            issue: `Vulnerability in ${packageName}: ${vuln.title}`,
            impact: severity,
            remediation: `Update ${packageName} to version ${vuln.fixAvailable?.version || 'latest'}`
          };

          switch (severity) {
            case 'critical':
              this.auditResults.criticalIssues.push(issue);
              break;
            case 'high':
              this.auditResults.highIssues.push(issue);
              break;
            case 'moderate':
              this.auditResults.mediumIssues.push(issue);
              break;
            case 'low':
              this.auditResults.lowIssues.push(issue);
              break;
          }
        });
      }
    } catch (error) {
      console.log('⚠️  Could not run npm audit:', error.message);
    }

    console.log('✅ Dependencies audit completed');
  }

  async auditSupabaseRLS() {
    console.log('🔍 Auditing Supabase RLS policies...');
    
    const rlsFiles = this.findFiles('**/*.sql');
    const rlsIssues = [];

    rlsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for missing RLS policies
      if (content.includes('CREATE TABLE') && !content.includes('ALTER TABLE') && !content.includes('ENABLE ROW LEVEL SECURITY')) {
        rlsIssues.push({
          file,
          issue: 'Table created without RLS enabled'
        });
      }

      // Check for overly permissive policies
      if (content.includes('SELECT *') && !content.includes('auth.uid()')) {
        rlsIssues.push({
          file,
          issue: 'Potentially overly permissive SELECT policy'
        });
      }

      // Check for missing user context in policies
      if (content.includes('CREATE POLICY') && !content.includes('auth.uid()') && !content.includes('auth.role()')) {
        rlsIssues.push({
          file,
          issue: 'Policy may not properly check user context'
        });
      }
    });

    if (rlsIssues.length > 0) {
      this.auditResults.highIssues.push({
        category: 'Supabase RLS',
        issue: `RLS policy issues found in ${rlsIssues.length} files`,
        impact: 'High',
        remediation: 'Review and fix RLS policies to ensure proper access control',
        details: rlsIssues
      });
    }

    console.log('✅ Supabase RLS audit completed');
  }

  async auditAPIEndpoints() {
    console.log('🔍 Auditing API endpoints...');
    
    const apiFiles = this.findFiles('src/app/api/**/*.ts');
    const apiIssues = [];

    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for missing authentication
      if (content.includes('export async function') && !content.includes('auth') && !content.includes('headers')) {
        apiIssues.push({
          file,
          issue: 'API endpoint may not have proper authentication'
        });
      }

      // Check for missing input validation
      if (content.includes('req.body') && !content.includes('zod') && !content.includes('validate')) {
        apiIssues.push({
          file,
          issue: 'API endpoint may not validate input data'
        });
      }

      // Check for missing rate limiting
      if (content.includes('export async function') && !content.includes('rate') && !content.includes('limit')) {
        apiIssues.push({
          file,
          issue: 'API endpoint may not have rate limiting'
        });
      }

      // Check for missing CORS headers
      if (content.includes('export async function') && !content.includes('cors') && !content.includes('Access-Control')) {
        apiIssues.push({
          file,
          issue: 'API endpoint may not have proper CORS headers'
        });
      }
    });

    if (apiIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'API Security',
        issue: `API security issues found in ${apiIssues.length} endpoints`,
        impact: 'Medium',
        remediation: 'Implement proper authentication, validation, and rate limiting',
        details: apiIssues
      });
    }

    console.log('✅ API endpoints audit completed');
  }

  async auditCORSConfiguration() {
    console.log('🔍 Auditing CORS configuration...');
    
    const corsIssues = [];
    
    // Check for overly permissive CORS
    const corsFiles = this.findFiles('**/*cors*');
    corsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('origin: "*"') || content.includes('origin: true')) {
        corsIssues.push({
          file,
          issue: 'Overly permissive CORS configuration'
        });
      }
    });

    if (corsIssues.length > 0) {
      this.auditResults.highIssues.push({
        category: 'CORS',
        issue: 'Overly permissive CORS configuration detected',
        impact: 'High',
        remediation: 'Restrict CORS to specific domains only',
        details: corsIssues
      });
    }

    console.log('✅ CORS configuration audit completed');
  }

  async auditAuthenticationFlow() {
    console.log('🔍 Auditing authentication flow...');
    
    const authIssues = [];
    
    // Check for secure session management
    const authFiles = this.findFiles('src/**/*auth*');
    authFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('localStorage') && content.includes('token')) {
        authIssues.push({
          file,
          issue: 'Storing tokens in localStorage is not secure'
        });
      }

      if (content.includes('sessionStorage') && content.includes('token')) {
        authIssues.push({
          file,
          issue: 'Storing tokens in sessionStorage is not secure'
        });
      }
    });

    if (authIssues.length > 0) {
      this.auditResults.highIssues.push({
        category: 'Authentication',
        issue: 'Insecure token storage detected',
        impact: 'High',
        remediation: 'Use httpOnly cookies or secure token storage',
        details: authIssues
      });
    }

    console.log('✅ Authentication flow audit completed');
  }

  async auditDataEncryption() {
    console.log('🔍 Auditing data encryption...');
    
    const encryptionIssues = [];
    
    // Check for unencrypted sensitive data
    const sourceFiles = this.getSourceFiles();
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('password') && !content.includes('hash') && !content.includes('bcrypt')) {
        encryptionIssues.push({
          file,
          issue: 'Password may not be properly hashed'
        });
      }

      if (content.includes('api_key') && !content.includes('encrypt')) {
        encryptionIssues.push({
          file,
          issue: 'API key may not be encrypted'
        });
      }
    });

    if (encryptionIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'Data Encryption',
        issue: 'Potential data encryption issues detected',
        impact: 'Medium',
        remediation: 'Ensure all sensitive data is properly encrypted',
        details: encryptionIssues
      });
    }

    console.log('✅ Data encryption audit completed');
  }

  async auditFilePermissions() {
    console.log('🔍 Auditing file permissions...');
    
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'package-lock.json',
      'supabase/config.toml'
    ];

    const permissionIssues = [];
    
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const mode = stats.mode & parseInt('777', 8);
        
        if (mode > parseInt('600', 8)) {
          permissionIssues.push({
            file,
            issue: `File has overly permissive permissions (${mode.toString(8)})`
          });
        }
      }
    });

    if (permissionIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'File Permissions',
        issue: 'Overly permissive file permissions detected',
        impact: 'Medium',
        remediation: 'Restrict file permissions to owner only (600)',
        details: permissionIssues
      });
    }

    console.log('✅ File permissions audit completed');
  }

  async auditSecretsManagement() {
    console.log('🔍 Auditing secrets management...');
    
    const secretsIssues = [];
    
    // Check for secrets in code
    const sourceFiles = this.getSourceFiles();
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for hardcoded API keys
      if (content.match(/['"](sk-|pk_|rk_)[a-zA-Z0-9]{20,}['"]/)) {
        secretsIssues.push({
          file,
          issue: 'Hardcoded API key detected'
        });
      }

      // Check for hardcoded passwords
      if (content.match(/password\s*[:=]\s*['"][^'"]{8,}['"]/i)) {
        secretsIssues.push({
          file,
          issue: 'Hardcoded password detected'
        });
      }
    });

    if (secretsIssues.length > 0) {
      this.auditResults.criticalIssues.push({
        category: 'Secrets Management',
        issue: 'Hardcoded secrets detected in code',
        impact: 'Critical',
        remediation: 'Move all secrets to environment variables or secure vault',
        details: secretsIssues
      });
    }

    console.log('✅ Secrets management audit completed');
  }

  async auditComplianceRequirements() {
    console.log('🔍 Auditing compliance requirements...');
    
    // GDPR Compliance
    const gdprIssues = this.checkGDPRCompliance();
    this.auditResults.compliance.gdpr = {
      status: gdprIssues.length === 0 ? 'compliant' : 'non-compliant',
      issues: gdprIssues
    };

    // SOC2 Compliance
    const soc2Issues = this.checkSOC2Compliance();
    this.auditResults.compliance.soc2 = {
      status: soc2Issues.length === 0 ? 'compliant' : 'non-compliant',
      issues: soc2Issues
    };

    // ISO 27001 Compliance
    const iso27001Issues = this.checkISO27001Compliance();
    this.auditResults.compliance.iso27001 = {
      status: iso27001Issues.length === 0 ? 'compliant' : 'non-compliant',
      issues: iso27001Issues
    };

    console.log('✅ Compliance requirements audit completed');
  }

  checkGDPRCompliance() {
    const issues = [];
    
    // Check for data processing consent
    if (!this.findFiles('**/*consent*').length) {
      issues.push('No data processing consent mechanism found');
    }

    // Check for data deletion capability
    if (!this.findFiles('**/*delete*').length) {
      issues.push('No data deletion capability found');
    }

    // Check for data export capability
    if (!this.findFiles('**/*export*').length) {
      issues.push('No data export capability found');
    }

    return issues;
  }

  checkSOC2Compliance() {
    const issues = [];
    
    // Check for access controls
    if (!this.findFiles('**/*rbac*').length && !this.findFiles('**/*role*').length) {
      issues.push('No role-based access control found');
    }

    // Check for audit logging
    if (!this.findFiles('**/*audit*').length && !this.findFiles('**/*log*').length) {
      issues.push('No audit logging found');
    }

    return issues;
  }

  checkISO27001Compliance() {
    const issues = [];
    
    // Check for security policies
    if (!this.findFiles('**/*policy*').length) {
      issues.push('No security policies found');
    }

    // Check for incident response
    if (!this.findFiles('**/*incident*').length) {
      issues.push('No incident response mechanism found');
    }

    return issues;
  }

  async auditRateLimiting() {
    console.log('🔍 Auditing rate limiting...');
    
    const rateLimitIssues = [];
    
    // Check for rate limiting implementation
    const apiFiles = this.findFiles('src/app/api/**/*.ts');
    const hasRateLimiting = apiFiles.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('rate') || content.includes('limit') || content.includes('throttle');
    });

    if (!hasRateLimiting) {
      rateLimitIssues.push('No rate limiting implemented on API endpoints');
    }

    if (rateLimitIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'Rate Limiting',
        issue: 'Rate limiting not properly implemented',
        impact: 'Medium',
        remediation: 'Implement rate limiting on all API endpoints',
        details: rateLimitIssues
      });
    }

    console.log('✅ Rate limiting audit completed');
  }

  async auditInputValidation() {
    console.log('🔍 Auditing input validation...');
    
    const validationIssues = [];
    
    // Check for input validation
    const apiFiles = this.findFiles('src/app/api/**/*.ts');
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('req.body') && !content.includes('zod') && !content.includes('validate')) {
        validationIssues.push({
          file,
          issue: 'No input validation found'
        });
      }
    });

    if (validationIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'Input Validation',
        issue: 'Input validation not properly implemented',
        impact: 'Medium',
        remediation: 'Implement proper input validation using Zod or similar',
        details: validationIssues
      });
    }

    console.log('✅ Input validation audit completed');
  }

  async auditErrorHandling() {
    console.log('🔍 Auditing error handling...');
    
    const errorHandlingIssues = [];
    
    // Check for proper error handling
    const sourceFiles = this.getSourceFiles();
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('throw new Error') && !content.includes('try') && !content.includes('catch')) {
        errorHandlingIssues.push({
          file,
          issue: 'Error thrown without proper handling'
        });
      }
    });

    if (errorHandlingIssues.length > 0) {
      this.auditResults.lowIssues.push({
        category: 'Error Handling',
        issue: 'Error handling could be improved',
        impact: 'Low',
        remediation: 'Implement proper error handling and logging',
        details: errorHandlingIssues
      });
    }

    console.log('✅ Error handling audit completed');
  }

  async auditLoggingSecurity() {
    console.log('🔍 Auditing logging security...');
    
    const loggingIssues = [];
    
    // Check for sensitive data in logs
    const sourceFiles = this.getSourceFiles();
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('console.log') && (content.includes('password') || content.includes('token'))) {
        loggingIssues.push({
          file,
          issue: 'Sensitive data may be logged'
        });
      }
    });

    if (loggingIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'Logging Security',
        issue: 'Sensitive data may be exposed in logs',
        impact: 'Medium',
        remediation: 'Remove sensitive data from logs',
        details: loggingIssues
      });
    }

    console.log('✅ Logging security audit completed');
  }

  async auditSessionManagement() {
    console.log('🔍 Auditing session management...');
    
    const sessionIssues = [];
    
    // Check for secure session configuration
    const authFiles = this.findFiles('src/**/*auth*');
    authFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('session') && !content.includes('secure') && !content.includes('httpOnly')) {
        sessionIssues.push({
          file,
          issue: 'Session may not be configured securely'
        });
      }
    });

    if (sessionIssues.length > 0) {
      this.auditResults.mediumIssues.push({
        category: 'Session Management',
        issue: 'Session management could be more secure',
        impact: 'Medium',
        remediation: 'Configure secure session settings',
        details: sessionIssues
      });
    }

    console.log('✅ Session management audit completed');
  }

  calculateOverallScore() {
    let score = 100;
    
    // Deduct points for issues
    score -= this.auditResults.criticalIssues.length * 20;
    score -= this.auditResults.highIssues.length * 10;
    score -= this.auditResults.mediumIssues.length * 5;
    score -= this.auditResults.lowIssues.length * 2;
    
    // Bonus points for good practices
    if (this.auditResults.compliance.gdpr.status === 'compliant') score += 5;
    if (this.auditResults.compliance.soc2.status === 'compliant') score += 5;
    if (this.auditResults.compliance.iso27001.status === 'compliant') score += 5;
    
    this.auditResults.overallScore = Math.max(0, Math.min(100, score));
  }

  generateReport() {
    const report = {
      ...this.auditResults,
      summary: {
        totalIssues: this.auditResults.criticalIssues.length + 
                    this.auditResults.highIssues.length + 
                    this.auditResults.mediumIssues.length + 
                    this.auditResults.lowIssues.length,
        criticalCount: this.auditResults.criticalIssues.length,
        highCount: this.auditResults.highIssues.length,
        mediumCount: this.auditResults.mediumIssues.length,
        lowCount: this.auditResults.lowIssues.length
      }
    };

    // Write report to file
    fs.writeFileSync('SECURITY_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync('SECURITY_AUDIT_REPORT.md', markdownReport);
    
    console.log('\n📊 Security audit report generated:');
    console.log('  - SECURITY_AUDIT_REPORT.json');
    console.log('  - SECURITY_AUDIT_REPORT.md');
  }

  generateMarkdownReport(report) {
    return `# Security Audit Report

**Generated:** ${report.timestamp}
**Overall Score:** ${report.overallScore}/100

## Summary

- **Total Issues:** ${report.summary.totalIssues}
- **Critical:** ${report.summary.criticalCount}
- **High:** ${report.summary.highCount}
- **Medium:** ${report.summary.mediumCount}
- **Low:** ${report.summary.lowCount}

## Critical Issues

${report.criticalIssues.map(issue => `### ${issue.category}
- **Issue:** ${issue.issue}
- **Impact:** ${issue.impact}
- **Remediation:** ${issue.remediation}
`).join('\n')}

## High Issues

${report.highIssues.map(issue => `### ${issue.category}
- **Issue:** ${issue.issue}
- **Impact:** ${issue.impact}
- **Remediation:** ${issue.remediation}
`).join('\n')}

## Medium Issues

${report.mediumIssues.map(issue => `### ${issue.category}
- **Issue:** ${issue.issue}
- **Impact:** ${issue.impact}
- **Remediation:** ${issue.remediation}
`).join('\n')}

## Low Issues

${report.lowIssues.map(issue => `### ${issue.category}
- **Issue:** ${issue.issue}
- **Impact:** ${issue.impact}
- **Remediation:** ${issue.remediation}
`).join('\n')}

## Compliance Status

### GDPR
- **Status:** ${report.compliance.gdpr.status}
- **Issues:** ${report.compliance.gdpr.issues.join(', ') || 'None'}

### SOC2
- **Status:** ${report.compliance.soc2.status}
- **Issues:** ${report.compliance.soc2.issues.join(', ') || 'None'}

### ISO 27001
- **Status:** ${report.compliance.iso27001.status}
- **Issues:** ${report.compliance.iso27001.issues.join(', ') || 'None'}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This report was generated automatically by the Security Audit Script*
`;
  }

  // Helper methods
  getSourceFiles() {
    return this.findFiles('src/**/*.{ts,tsx,js,jsx}');
  }

  findFiles(pattern) {
    try {
      const result = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' });
      return result.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  findHardcodedSecrets(files) {
    const secrets = [];
    const secretPatterns = [
      /['"](sk-|pk_|rk_)[a-zA-Z0-9]{20,}['"]/g,
      /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi
    ];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        secretPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            secrets.push(file);
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    return secrets;
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runFullAudit()
    .then(results => {
      if (results.overallScore < 70) {
        console.log('\n⚠️  Security score is below 70. Please address critical and high issues.');
        process.exit(1);
      } else {
        console.log('\n✅ Security audit passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Security audit failed:', error);
      process.exit(1);
    });
}

module.exports = SecurityAuditor;
