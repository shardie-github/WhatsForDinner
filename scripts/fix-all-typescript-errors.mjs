#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * Automatically fixes common TypeScript error patterns
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Get all TypeScript errors
console.log('🔍 Analyzing TypeScript errors...');
const errors = execSync('pnpm typecheck 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
const errorLines = errors.split('\n').filter(line => line.includes('error TS'));

// Group errors by file
const fileErrors = new Map();
for (const line of errorLines) {
  const match = line.match(/^([^:]+):(\d+):(\d+):/);
  if (match) {
    const [, file, lineNum, col] = match;
    if (!fileErrors.has(file)) {
      fileErrors.set(file, []);
    }
    fileErrors.get(file).push({ line: parseInt(lineNum), col: parseInt(col), error: line });
  }
}

console.log(`Found ${fileErrors.size} files with errors`);

// Fix common patterns
let fixedCount = 0;
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
        // Check if it's a template literal pattern
        if (line.match(/logger\.(info|warn|error|debug|log)\s*\(\s*'[^']*\$\{/)) {
          line = line.replace(/'([^']*\$\{[^}]+\}[^']*)'/g, '`$1`');
          modified = true;
        }
      }
      
      // Fix object literal syntax in logger calls
      if (line.includes('logger.') && line.includes('{') && line.includes('}')) {
        // Pattern: { var } -> { var: var }
        line = line.replace(
          /logger\.(info|warn|error|debug|log)\s*\(\s*'([^']+)',\s*\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\s*\)/g,
          (match, method, msg, varName) => {
            return `logger.${method}('${msg}', { ${varName}: ${varName} })`;
          }
        );
        if (line !== original) modified = true;
      }
      
      lines[lineIndex] = line;
    }
    
    if (modified) {
      content = lines.join('\n');
      writeFileSync(filePath, content, 'utf-8');
      fixedCount++;
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log(`✅ Fixed ${fixedCount} files`);
console.log('Run "pnpm typecheck" to verify fixes');
