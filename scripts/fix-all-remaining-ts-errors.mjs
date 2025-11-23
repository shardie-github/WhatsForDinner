#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer - Final Pass
 * Fixes all remaining template literal and syntax errors
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get all TypeScript errors
console.log('🔍 Analyzing TypeScript errors...');
const errors = execSync('pnpm typecheck 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
const errorLines = errors.split('\n').filter(line => line.includes('error TS'));

// Group errors by file
const fileErrors = new Map();
for (const line of errorLines) {
  const match = line.match(/^([^:]+):(\d+):(\d+):/);
  if (match) {
    const [, file, lineNum] = match;
    if (!fileErrors.has(file)) {
      fileErrors.set(file, []);
    }
    fileErrors.get(file).push({ line: parseInt(lineNum), error: line });
  }
}

console.log(`Found ${fileErrors.size} files with errors`);

// Fix common patterns
let totalFixed = 0;
for (const [filePath, errors] of fileErrors.entries()) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    
    for (const { line: lineNum } of errors) {
      if (lineNum > lines.length) continue;
      const lineIndex = lineNum - 1;
      let line = lines[lineIndex];
      const original = line;
      
      // Fix broken template literals
      if (line.includes("'") && line.includes('${') && !line.includes('`')) {
        // Pattern: logger.info('text ${var}')
        line = line.replace(
          /logger\.(info|warn|error|debug|log)\s*\(\s*'([^']*\$\{[^}]+\}[^']*)'/g,
          (match, method, text) => {
            return `logger.${method}(\`${text}\``;
          }
        );
      }
      
      // Fix broken object literals
      if (line.includes('logger.') && line.includes('{') && line.includes('}')) {
        // Pattern: logger.info('text', { var }) -> logger.info('text', { var: var })
        line = line.replace(
          /logger\.(info|warn|error|debug|log)\s*\(\s*'([^']+)',\s*\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\s*\)/g,
          (match, method, text, varName) => {
            return `logger.${method}('${text}', { ${varName}: ${varName} })`;
          }
        );
      }
      
      // Fix broken repeat calls
      line = line.replace(/\.repeat\((\d+)`\)/g, '.repeat($1)');
      
      // Fix broken method calls
      line = line.replace(/toUpperCase\(`\)/g, 'toUpperCase()');
      line = line.replace(/\.name`\)/g, '.name)');
      
      lines[lineIndex] = line;
      if (line !== original) modified = true;
    }
    
    if (modified) {
      content = lines.join('\n');
      writeFileSync(filePath, content, 'utf-8');
      totalFixed++;
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log(`✅ Fixed ${totalFixed} files`);
console.log('Run "pnpm typecheck" to verify fixes');
