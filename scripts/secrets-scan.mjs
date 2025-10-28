#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Secret patterns to detect
const SECRET_PATTERNS = [
  // API Keys
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, type: 'API Key' },
  { pattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, type: 'Secret Key' },
  { pattern: /(?:access[_-]?token|accesstoken)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, type: 'Access Token' },
  { pattern: /(?:refresh[_-]?token|refreshtoken)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, type: 'Refresh Token' },
  
  // Database
  { pattern: /(?:database[_-]?url|db[_-]?url)\s*[:=]\s*['"]?([a-zA-Z0-9_:/.-]{20,})['"]?/gi, type: 'Database URL' },
  { pattern: /(?:postgres[_-]?url|postgresql[_-]?url)\s*[:=]\s*['"]?([a-zA-Z0-9_:/.-]{20,})['"]?/gi, type: 'PostgreSQL URL' },
  
  // Supabase
  { pattern: /(?:supabase[_-]?url|supabase[_-]?project[_-]?ref)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]{20,})['"]?/gi, type: 'Supabase URL/Ref' },
  { pattern: /(?:supabase[_-]?service[_-]?role[_-]?key|supabase[_-]?anon[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]{20,})['"]?/gi, type: 'Supabase Key' },
  
  // AWS
  { pattern: /(?:aws[_-]?access[_-]?key[_-]?id|aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_+/=]{20,})['"]?/gi, type: 'AWS Credentials' },
  
  // Stripe
  { pattern: /(?:stripe[_-]?secret[_-]?key|stripe[_-]?publishable[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_]{20,})['"]?/gi, type: 'Stripe Key' },
  
  // GitHub
  { pattern: /(?:github[_-]?token|gh[_-]?token)\s*[:=]\s*['"]?([a-zA-Z0-9_]{20,})['"]?/gi, type: 'GitHub Token' },
  
  // Generic tokens
  { pattern: /(?:token|key|secret)\s*[:=]\s*['"]?([a-zA-Z0-9_+/=]{20,})['"]?/gi, type: 'Generic Token' },
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.env\.example/,
  /package-lock\.json/,
  /pnpm-lock\.yaml/,
  /yarn\.lock/,
  /\.DS_Store/,
  /\.vscode/,
  /\.idea/,
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.md', '.yml', '.yaml'];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function shouldScanFile(filePath) {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return SCAN_EXTENSIONS.includes(ext);
}

function scanFile(filePath) {
  const findings = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    
    SECRET_PATTERNS.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const secret = match[1];
        
        // Skip if it looks like a placeholder or example
        if (secret.includes('example') || 
            secret.includes('placeholder') || 
            secret.includes('your-') ||
            secret.includes('xxx') ||
            secret.length < 10) {
          continue;
        }
        
        findings.push({
          file: filePath,
          type,
          secret: secret.substring(0, 8) + '...', // Only show first 8 chars
          line: content.substring(0, match.index).split('\n').length,
          context: content.substring(Math.max(0, match.index - 50), match.index + 50)
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
  
  return findings;
}

function scanDirectory(dirPath) {
  const findings = [];
  
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (shouldExcludeFile(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        findings.push(...scanDirectory(fullPath));
      } else if (entry.isFile() && shouldScanFile(fullPath)) {
        findings.push(...scanFile(fullPath));
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return findings;
}

function checkServiceRoleInClientBundles() {
  const findings = [];
  const webAppPath = join(projectRoot, 'apps/web/.next');
  
  if (statSync(webAppPath, { throwIfNoEntry: false })) {
    const clientFiles = scanDirectory(join(webAppPath, 'static'));
    
    clientFiles.forEach(finding => {
      if (finding.type.includes('Service Role') || finding.secret.includes('service_role')) {
        findings.push({
          ...finding,
          severity: 'CRITICAL',
          message: 'SERVICE_ROLE key detected in client bundle! This is a critical security issue.'
        });
      }
    });
  }
  
  return findings;
}

function printReport(findings) {
  console.log('\n🔍 Secrets Scan Report');
  console.log('=====================\n');
  
  if (findings.length === 0) {
    console.log('✅ No secrets detected!');
    return;
  }
  
  // Group findings by type
  const grouped = findings.reduce((acc, finding) => {
    const type = finding.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(finding);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([type, typeFindings]) => {
    console.log(`\n📋 ${type} (${typeFindings.length} found):`);
    typeFindings.forEach(finding => {
      const severity = finding.severity || 'WARNING';
      const icon = severity === 'CRITICAL' ? '🚨' : '⚠️';
      console.log(`   ${icon} ${finding.file}:${finding.line}`);
      console.log(`      ${finding.secret}`);
      if (finding.message) {
        console.log(`      ${finding.message}`);
      }
    });
  });
  
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const warningCount = findings.length - criticalCount;
  
  console.log(`\n📊 Summary:`);
  console.log(`   🚨 Critical: ${criticalCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);
  console.log(`   📁 Total: ${findings.length}`);
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  
  console.log('🔍 Scanning for secrets...');
  
  const findings = [
    ...scanDirectory(projectRoot),
    ...checkServiceRoleInClientBundles()
  ];
  
  printReport(findings);
  
  if (checkOnly) {
    const hasCritical = findings.some(f => f.severity === 'CRITICAL');
    if (hasCritical) {
      console.log('\n❌ Secrets scan failed! Critical issues found.');
      process.exit(1);
    } else if (findings.length > 0) {
      console.log('\n⚠️  Secrets scan completed with warnings.');
      process.exit(1);
    } else {
      console.log('\n✅ Secrets scan passed!');
    }
  }
}

main();