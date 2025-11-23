#!/usr/bin/env node
/**
 * Security Audit Script
 * 
 * Audits potential secrets and dangerous code patterns
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /dist/,
  /\.next/,
  /\.git/,
];

// Secret patterns
const SECRET_PATTERNS = [
  { name: 'API Key', pattern: /(api[_-]?key|apikey)\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi },
  { name: 'Secret Key', pattern: /(secret[_-]?key|secretkey)\s*[:=]\s*['"`]([^'"`]{10,})['"`]/gi },
  { name: 'Password', pattern: /(password|pwd)\s*[:=]\s*['"`]([^'"`]{8,})['"`]/gi },
  { name: 'Token', pattern: /(token|access[_-]?token)\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi },
  { name: 'Private Key', pattern: /(private[_-]?key|privkey)\s*[:=]\s*['"`]([^'"`]{40,})['"`]/gi },
  { name: 'AWS Key', pattern: /(aws[_-]?access[_-]?key|aws[_-]?secret)\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi },
  { name: 'Database URL', pattern: /(database[_-]?url|db[_-]?url)\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi },
  { name: 'Connection String', pattern: /(connection[_-]?string|conn[_-]?str)\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi },
];

// Dangerous code patterns
const DANGEROUS_PATTERNS = [
  { name: 'eval()', pattern: /\beval\s*\(/g, severity: 'CRITICAL' },
  { name: 'Function() constructor', pattern: /\bnew\s+Function\s*\(/g, severity: 'CRITICAL' },
  { name: 'innerHTML', pattern: /\.innerHTML\s*=/g, severity: 'HIGH' },
  { name: 'dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/g, severity: 'HIGH' },
  { name: 'document.write', pattern: /document\.write\s*\(/g, severity: 'MEDIUM' },
  { name: 'innerHTML getter', pattern: /\.innerHTML\s*[^=]/g, severity: 'MEDIUM' },
  { name: 'setTimeout with string', pattern: /setTimeout\s*\(\s*['"`]/g, severity: 'MEDIUM' },
  { name: 'setInterval with string', pattern: /setInterval\s*\(\s*['"`]/g, severity: 'MEDIUM' },
];

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  if (!INCLUDE_EXTENSIONS.includes(ext)) return false;
  
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(filePath)) return false;
  }
  
  return true;
}

function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.');
}

function findFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!shouldExcludeDir(file)) {
            findFiles(filePath, fileList);
          }
        } else if (shouldProcessFile(filePath)) {
          fileList.push(filePath);
        }
      } catch (e) {
        // Skip
      }
    }
  } catch (e) {
    // Skip
  }
  
  return fileList;
}

function auditSecrets(content, filePath) {
  const secrets = [];
  
  for (const { name, pattern } of SECRET_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // Skip if it's a comment or example
      const beforeMatch = content.substring(0, match.index);
      const lines = beforeMatch.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine.trim().startsWith('//') || 
          currentLine.includes('example') ||
          currentLine.includes('EXAMPLE') ||
          currentLine.includes('placeholder')) {
        continue;
      }
      
      // Check if it's an environment variable reference
      if (match[0].includes('process.env') || match[0].includes('$')) {
        continue; // Likely an env var reference, not a hardcoded secret
      }
      
      secrets.push({
        type: name,
        line: lines.length,
        match: match[0].substring(0, 50) + '...',
        severity: 'CRITICAL',
      });
    }
  }
  
  return secrets;
}

function auditDangerousPatterns(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const { name, pattern, severity } of DANGEROUS_PATTERNS) {
      if (pattern.test(line)) {
        // Skip if commented out
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          continue;
        }
        
        issues.push({
          type: name,
          line: i + 1,
          content: line.trim(),
          severity,
        });
      }
    }
  }
  
  return issues;
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    const secrets = auditSecrets(content, filePath);
    const dangerous = auditDangerousPatterns(content, filePath);
    
    return {
      file: filePath,
      secrets,
      dangerous,
      totalIssues: secrets.length + dangerous.length,
    };
  } catch (error) {
    return {
      file: filePath,
      error: error.message,
      secrets: [],
      dangerous: [],
      totalIssues: 0,
    };
  }
}

function main() {
  const rootDir = process.cwd();
  
  console.log('\n🔒 Security Audit Starting...\n');
  
  const files = findFiles(rootDir);
  console.log(`Scanning ${files.length} files...\n`);
  
  const results = [];
  let totalSecrets = 0;
  let totalDangerous = 0;
  
  for (const file of files) {
    const result = processFile(file);
    results.push(result);
    
    if (result.totalIssues > 0) {
      totalSecrets += result.secrets.length;
      totalDangerous += result.dangerous.length;
      
      if (result.secrets.length > 0) {
        console.log(`⚠️  ${file}:`);
        result.secrets.forEach(secret => {
          console.log(`   [SECRET] ${secret.type} at line ${secret.line}`);
        });
      }
      
      if (result.dangerous.length > 0) {
        console.log(`⚠️  ${file}:`);
        result.dangerous.forEach(issue => {
          console.log(`   [${issue.severity}] ${issue.type} at line ${issue.line}`);
        });
      }
    }
  }
  
  const filesWithIssues = results.filter(r => r.totalIssues > 0);
  
  console.log(`\n📊 Security Audit Summary:`);
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files with issues: ${filesWithIssues.length}`);
  console.log(`   Potential secrets found: ${totalSecrets}`);
  console.log(`   Dangerous patterns found: ${totalDangerous}`);
  console.log(`   Total issues: ${totalSecrets + totalDangerous}`);
  
  if (filesWithIssues.length > 0) {
    console.log(`\n⚠️  Review files with issues above.`);
    console.log(`   Many may be false positives (env var references, examples, etc.)`);
  }
  
  console.log(`\n✅ Audit complete!\n`);
}

main();
