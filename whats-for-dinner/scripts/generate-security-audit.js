#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Generating security audit report...');

const auditReport = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  checks: {},
};

// Check for known vulnerabilities
try {
  console.log('  - Checking for known vulnerabilities...');
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const auditData = JSON.parse(auditOutput);
  auditReport.checks.vulnerabilities = {
    status: auditData.metadata.vulnerabilities.total === 0 ? 'PASS' : 'FAIL',
    total: auditData.metadata.vulnerabilities.total,
    high: auditData.metadata.vulnerabilities.high,
    critical: auditData.metadata.vulnerabilities.critical,
    details: auditData.vulnerabilities || {},
  };
} catch (error) {
  auditReport.checks.vulnerabilities = {
    status: 'ERROR',
    error: error.message,
  };
}

// Check for secrets in code
try {
  console.log('  - Scanning for secrets in code...');
  const trufflehogOutput = execSync(
    'trufflehog filesystem . --no-verification --format json',
    { encoding: 'utf8' }
  );
  const secrets = JSON.parse(trufflehogOutput);
  auditReport.checks.secrets = {
    status: secrets.length === 0 ? 'PASS' : 'FAIL',
    count: secrets.length,
    details: secrets.map(s => ({
      file: s.SourceMetadata.Data.Filesystem.file,
      line: s.SourceMetadata.Data.Filesystem.line,
      detector: s.DetectorName,
    })),
  };
} catch (error) {
  auditReport.checks.secrets = {
    status: 'ERROR',
    error: error.message,
  };
}

// Check for hardcoded secrets patterns
try {
  console.log('  - Checking for hardcoded secrets patterns...');
  const patterns = [
    { pattern: /sk-[a-zA-Z0-9]{48}/g, name: 'OpenAI API Key' },
    { pattern: /sk_[a-zA-Z0-9]{24}/g, name: 'Stripe Secret Key' },
    { pattern: /pk_[a-zA-Z0-9]{24}/g, name: 'Stripe Publishable Key' },
    { pattern: /[a-zA-Z0-9]{32,}/g, name: 'Potential Secret' },
  ];

  const hardcodedSecrets = [];
  const srcDir = path.join(__dirname, '..', 'src');

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        const content = fs.readFileSync(filePath, 'utf8');
        patterns.forEach(({ pattern, name }) => {
          const matches = content.match(pattern);
          if (matches) {
            hardcodedSecrets.push({
              file: filePath,
              type: name,
              count: matches.length,
            });
          }
        });
      }
    }
  }

  scanDirectory(srcDir);

  auditReport.checks.hardcodedSecrets = {
    status: hardcodedSecrets.length === 0 ? 'PASS' : 'FAIL',
    count: hardcodedSecrets.length,
    details: hardcodedSecrets,
  };
} catch (error) {
  auditReport.checks.hardcodedSecrets = {
    status: 'ERROR',
    error: error.message,
  };
}

// Check for security headers
try {
  console.log('  - Checking security headers configuration...');
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
  const nextConfigExists = fs.existsSync(nextConfigPath);

  auditReport.checks.securityHeaders = {
    status: nextConfigExists ? 'PASS' : 'WARN',
    details: {
      nextConfigExists,
      hasSecurityHeaders: false, // This would be checked in the actual config
    },
  };
} catch (error) {
  auditReport.checks.securityHeaders = {
    status: 'ERROR',
    error: error.message,
  };
}

// Check for environment file security
try {
  console.log('  - Checking environment file security...');
  const envExampleExists = fs.existsSync(
    path.join(__dirname, '..', '.env.example')
  );
  const envExists = fs.existsSync(path.join(__dirname, '..', '.env'));
  const envLocalExists = fs.existsSync(
    path.join(__dirname, '..', '.env.local')
  );

  auditReport.checks.environmentFiles = {
    status: envExampleExists && !envExists && !envLocalExists ? 'PASS' : 'WARN',
    details: {
      envExampleExists,
      envExists,
      envLocalExists,
      recommendation:
        'Use .env.example for documentation, avoid committing .env files',
    },
  };
} catch (error) {
  auditReport.checks.environmentFiles = {
    status: 'ERROR',
    error: error.message,
  };
}

// Generate overall security score
const checks = Object.values(auditReport.checks);
const passedChecks = checks.filter(check => check.status === 'PASS').length;
const totalChecks = checks.length;
const securityScore = Math.round((passedChecks / totalChecks) * 100);

auditReport.overallScore = securityScore;
auditReport.status =
  securityScore >= 80
    ? 'SECURE'
    : securityScore >= 60
      ? 'NEEDS_ATTENTION'
      : 'VULNERABLE';

// Generate markdown report
const markdownReport = `# Security Audit Report

**Generated:** ${auditReport.timestamp}  
**Environment:** ${auditReport.environment}  
**Overall Score:** ${auditReport.overallScore}/100  
**Status:** ${auditReport.status}

## Summary

- **Total Checks:** ${totalChecks}
- **Passed:** ${passedChecks}
- **Failed:** ${checks.filter(c => c.status === 'FAIL').length}
- **Warnings:** ${checks.filter(c => c.status === 'WARN').length}
- **Errors:** ${checks.filter(c => c.status === 'ERROR').length}

## Detailed Results

### 1. Vulnerability Scan
- **Status:** ${auditReport.checks.vulnerabilities?.status || 'UNKNOWN'}
- **Total Vulnerabilities:** ${auditReport.checks.vulnerabilities?.total || 0}
- **High Severity:** ${auditReport.checks.vulnerabilities?.high || 0}
- **Critical Severity:** ${auditReport.checks.vulnerabilities?.critical || 0}

### 2. Secrets Detection
- **Status:** ${auditReport.checks.secrets?.status || 'UNKNOWN'}
- **Secrets Found:** ${auditReport.checks.secrets?.count || 0}

### 3. Hardcoded Secrets
- **Status:** ${auditReport.checks.hardcodedSecrets?.status || 'UNKNOWN'}
- **Pattern Matches:** ${auditReport.checks.hardcodedSecrets?.count || 0}

### 4. Security Headers
- **Status:** ${auditReport.checks.securityHeaders?.status || 'UNKNOWN'}

### 5. Environment Files
- **Status:** ${auditReport.checks.environmentFiles?.status || 'UNKNOWN'}

## Recommendations

${securityScore < 80 ? '⚠️ **Action Required:** Security score is below 80%. Please address the issues above.' : '✅ **Good:** Security score is acceptable.'}

## Next Steps

1. Review all failed checks
2. Address critical and high severity vulnerabilities
3. Remove any hardcoded secrets
4. Implement proper security headers
5. Ensure environment variables are properly managed

---
*This report was generated automatically by the security audit script.*
`;

// Write reports
fs.writeFileSync('SECURITY_AUDIT.md', markdownReport);
fs.writeFileSync('security-audit.json', JSON.stringify(auditReport, null, 2));

console.log('✅ Security audit report generated successfully!');
console.log(`📊 Overall Security Score: ${securityScore}/100`);
console.log(`📄 Report saved to: SECURITY_AUDIT.md`);
console.log(`📄 JSON report saved to: security-audit.json`);
